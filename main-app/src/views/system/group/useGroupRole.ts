import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getRoleList, type Role } from '@/api/role';
import { getGroupRoles, updateGroupRoles, type SystemGroup } from '@/api/systemGroup';

export function useGroupRole(options: {
  fetchData: () => Promise<void>;
  resolveCurrentTenantId: () => number | null;
}) {
  const { fetchData, resolveCurrentTenantId } = options;

  const dialogVisible = ref(false);
  const loading = ref(false);
  const saving = ref(false);

  const currentGroupId = ref<number | null>(null);
  const currentGroupName = ref('');
  const currentGroupCode = ref('');

  const keyword = ref('');
  const roleOptionsAll = ref<Role[]>([]);
  const selectedRoleIds = ref<number[]>([]);
  const currentTenantId = ref<number | null>(null);

  const roleOptions = computed(() => {
    const kw = String(keyword.value || '')
      .trim()
      .toLowerCase();
    if (!kw) return roleOptionsAll.value;
    return roleOptionsAll.value.filter((r: any) => {
      const values = [r.roleName, r.roleCode, (r as any).roleKey]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return values.includes(kw);
    });
  });

  const loadRoles = async () => {
    const tenantId = resolveCurrentTenantId();
    if (tenantId == null) return;
    currentTenantId.value = tenantId;
    loading.value = true;
    try {
      const res = await getRoleList({ tenantId, status: '' });
      const list = (res?.list ?? []) as Role[];
      roleOptionsAll.value = list
        .map((r: any) => ({
          ...r,
          roleCode: r.roleCode ?? r.roleKey ?? ''
        }))
        .filter((r: any) => Number(r?.tenantId ?? tenantId) === Number(tenantId));
    } finally {
      loading.value = false;
    }
  };

  const open = async (group: SystemGroup) => {
    currentGroupId.value = group.id ?? null;
    currentGroupName.value = String(group.groupName || '');
    currentGroupCode.value = String(group.groupCode || '');
    keyword.value = '';
    selectedRoleIds.value = [];
    dialogVisible.value = true;
    await loadRoles();
    if (currentGroupId.value) {
      const res = await getGroupRoles(currentGroupId.value);
      selectedRoleIds.value = Array.isArray(res?.roleIds) ? res.roleIds : [];
    }
  };

  const save = async () => {
    if (!currentGroupId.value) return;
    saving.value = true;
    try {
      const ids = (selectedRoleIds.value || [])
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n));
      await updateGroupRoles(currentGroupId.value, ids);
      ElMessage.success('保存成功');
      dialogVisible.value = false;
      await fetchData();
    } finally {
      saving.value = false;
    }
  };

  watch(
    () => dialogVisible.value,
    (open) => {
      if (!open) {
        currentGroupId.value = null;
        currentGroupName.value = '';
        currentGroupCode.value = '';
        keyword.value = '';
        roleOptionsAll.value = [];
        selectedRoleIds.value = [];
      }
    }
  );

  return {
    dialogVisible,
    currentGroupName,
    currentGroupCode,
    keyword,
    currentTenantId,
    roleOptionsAll,
    roleOptions,
    selectedRoleIds,
    loading,
    saving,
    open,
    save
  };
}
