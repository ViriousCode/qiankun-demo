import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getSystemUserList, type SystemUser } from '@/api/systemUser';
import { getGroupUsers, updateGroupUsers, type SystemGroup } from '@/api/systemGroup';

export function useGroupUser(options: {
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
  const userOptionsAll = ref<SystemUser[]>([]);
  const selectedUserIds = ref<number[]>([]);
  const currentTenantId = ref<number | null>(null);

  const userOptions = computed(() => {
    const kw = String(keyword.value || '')
      .trim()
      .toLowerCase();
    if (!kw) return userOptionsAll.value;
    return userOptionsAll.value.filter((u: any) => {
      const values = [u.name, u.nickName, u.phone, u.email, u.authIdentifier]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return values.includes(kw);
    });
  });

  const loadUsers = async () => {
    const tenantId = resolveCurrentTenantId();
    if (tenantId == null) return;
    currentTenantId.value = tenantId;
    loading.value = true;
    try {
      const res = await getSystemUserList({
        tenantId,
        source: 'platform',
        status: '',
        pageIndex: 1,
        pageSize: 1000
      } as any);
      userOptionsAll.value = ((res?.list ?? []) as SystemUser[]).filter(
        (u: any) => Number(u?.tenantId ?? tenantId) === Number(tenantId)
      );
    } finally {
      loading.value = false;
    }
  };

  const open = async (group: SystemGroup) => {
    if ((group as any)?.isDefault === true) {
      ElMessage.warning('默认群组不支持授权账户');
      return;
    }
    currentGroupId.value = group.id ?? null;
    currentGroupName.value = String(group.groupName || '');
    currentGroupCode.value = String(group.groupCode || '');
    keyword.value = '';
    selectedUserIds.value = [];
    dialogVisible.value = true;
    await loadUsers();
    if (currentGroupId.value) {
      const res = await getGroupUsers(currentGroupId.value);
      selectedUserIds.value = Array.isArray(res?.userIds) ? res.userIds : [];
    }
  };

  const save = async () => {
    if (!currentGroupId.value) return;
    saving.value = true;
    try {
      const ids = (selectedUserIds.value || [])
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n));
      await updateGroupUsers(currentGroupId.value, ids);
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
        userOptionsAll.value = [];
        selectedUserIds.value = [];
      }
    }
  );

  return {
    dialogVisible,
    currentGroupName,
    currentGroupCode,
    keyword,
    currentTenantId,
    userOptionsAll,
    userOptions,
    selectedUserIds,
    loading,
    saving,
    open,
    save
  };
}
