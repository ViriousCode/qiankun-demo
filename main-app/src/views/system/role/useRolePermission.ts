import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getPermissionTree, updateRole, type Role } from '@/api/role';
import { useUserStore } from '@/store/user';
import { getTenantAuthorizedApps } from '@/api/systemTenant';
import { getAppList, type MicroApp } from '@/api/app';

export function useRolePermission(options: {
  roleList: { value: Role[] };
  fetchData: () => Promise<void>;
  resolveCurrentTenantId: () => number | null;
}) {
  const { roleList, fetchData, resolveCurrentTenantId } = options;
  const userStore = useUserStore();

  const permDialogVisible = ref(false);
  const permissionData = ref<any[]>([]);
  const permissionDataAll = ref<any[]>([]);
  const initialPermissionIds = ref<number[]>([]);
  const currentRoleId = ref<number | null>(null);
  const currentRoleName = ref<string>('');
  const currentRoleCode = ref<string>('');
  const checkStrictly = ref(true);
  const appFilter = ref<string>('root-main');
  const appFilterOptions = ref<{ label: string; value: string }[]>([]);

  const filterTreeByPermission = (tree: any[], userPerms: string[]) => {
    const res: any[] = [];
    tree.forEach((node) => {
      const tempNode = { ...node };
      if (tempNode.children && tempNode.children.length > 0) {
        tempNode.children = filterTreeByPermission(tempNode.children, userPerms);
      }
      const hasAuth = tempNode.permission && userPerms.includes(tempNode.permission);
      const hasChildren = tempNode.children && tempNode.children.length > 0;
      if (hasAuth || hasChildren) {
        res.push(tempNode);
      }
    });
    return res;
  };

  const buildTreeByTenantApps = async () => {
    const tenantId = resolveCurrentTenantId();
    const mainTreeRaw = await getPermissionTree({ app: 'main' });
    // 主系统不展示“个人中心”目录
    const removePersonalCenter = (list: any[]): any[] =>
      (list || [])
        .filter((node) => String(node?.title || '') !== '个人中心')
        .map((node) => ({
          ...node,
          children: removePersonalCenter(node?.children || [])
        }));
    const mainTree = removePersonalCenter(Array.isArray(mainTreeRaw) ? mainTreeRaw : []);
    if (tenantId == null) {
      return [
        {
          id: 'root-main',
          title: '主系统',
          children: mainTree
        }
      ];
    }

    const authed = await getTenantAuthorizedApps(tenantId);
    const appIds = Array.isArray(authed?.appIds) ? authed.appIds : [];
    if (!appIds.length) {
      return [
        {
          id: 'root-main',
          title: '主系统',
          children: mainTree
        }
      ];
    }

    const allApps = (await getAppList()) ?? [];
    const appIdSet = new Set(appIds);
    const apps = (allApps as MicroApp[])
      .filter((a) => a?.id != null && appIdSet.has(Number(a.id)))
      .sort(
        (a, b) =>
          Number(a.sort || 0) - Number(b.sort || 0) || String(a.name).localeCompare(String(b.name))
      );

    const appTrees = await Promise.all(
      apps.map(async (app) => {
        const tree = await getPermissionTree({ app: app.name });
        return {
          id: `root-app-${app.id}`,
          title: app.shortName || app.name,
          children: Array.isArray(tree) ? tree : []
        };
      })
    );

    return [
      {
        id: 'root-main',
        title: '主系统',
        children: mainTree
      },
      ...appTrees
    ];
  };

  const applyAppFilter = () => {
    const key = appFilter.value || 'root-main';
    const picked = (permissionDataAll.value || []).find((node: any) => String(node?.id) === key);
    // 不展示包裹父级（root-*），直接展示该应用下的菜单树
    const base = Array.isArray(picked?.children) ? picked.children : [];
    // 常见情况：只返回一个顶层目录（如“主应用/案卷智能评查系统”），按要求去掉这一层
    if (
      base.length === 1 &&
      base[0] &&
      Array.isArray(base[0].children) &&
      base[0].children.length > 0
    ) {
      permissionData.value = base[0].children;
      return;
    }
    permissionData.value = base;
  };

  const handlePermission = async (row: Role) => {
    currentRoleId.value = row.id!;
    currentRoleName.value = String(row.roleName || '');
    currentRoleCode.value = String((row as any).roleCode || (row as any).roleKey || '');
    const fullTree: any = await buildTreeByTenantApps();
    const treeToShow =
      userStore.userInfo.roleKey === 'admin'
        ? fullTree
        : filterTreeByPermission(fullTree, userStore.permissions);
    permissionDataAll.value = treeToShow;
    appFilterOptions.value = Array.isArray(treeToShow)
      ? treeToShow.map((n: any) => ({ label: String(n?.title || ''), value: String(n?.id || '') }))
      : [];
    // 默认选择主系统（若不存在则选第一个）
    appFilter.value =
      appFilterOptions.value.find((o) => o.value === 'root-main')?.value ??
      appFilterOptions.value[0]?.value ??
      'root-main';
    applyAppFilter();
    initialPermissionIds.value = [...(row.permissionIds || [])];
    permDialogVisible.value = true;
  };

  const submitPermission = async (payload: {
    checkedKeys: (string | number)[];
    halfCheckedKeys: (string | number)[];
  }) => {
    if (!currentRoleId.value) return;
    const { checkedKeys, halfCheckedKeys } = payload;
    const allIds = [...checkedKeys, ...halfCheckedKeys] as number[];
    const role = roleList.value.find((r) => r.id === currentRoleId.value);
    if (!role) return;
    await updateRole(currentRoleId.value, {
      ...role,
      permissionIds: allIds
    });
    ElMessage.success('权限分配成功');
    permDialogVisible.value = false;
    await fetchData();
    await userStore.refreshAndSync();
  };

  return {
    permDialogVisible,
    permissionData,
    appFilter,
    appFilterOptions,
    applyAppFilter,
    initialPermissionIds,
    currentRoleId,
    currentRoleName,
    currentRoleCode,
    checkStrictly,
    handlePermission,
    submitPermission
  };
}
