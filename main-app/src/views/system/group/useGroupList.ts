import { computed, onMounted, reactive, ref } from 'vue';
import { useUserStore } from '@/store/user';
import { getSystemTenantList, type SystemTenant } from '@/api/systemTenant';
import { getSystemGroupList, type SystemGroup } from '@/api/systemGroup';

export function useGroupList() {
  const loading = ref(false);
  const groupList = ref<SystemGroup[]>([]);

  const userStore = useUserStore();
  const isAdmin = computed(() => userStore.userInfo.roleKey === 'admin');

  const queryParams = reactive<{
    keyword: string;
    status: '' | 0 | 1;
    tenantId: number | null;
  }>({
    keyword: '',
    status: '',
    tenantId: null
  });

  const tenantLoading = ref(false);
  const tenantOptions = ref<{ label: string; value: number }[]>([]);

  const fetchTenantOptions = async () => {
    tenantLoading.value = true;
    try {
      const res = await getSystemTenantList({ pageIndex: 1, pageSize: 1000, status: 1 });
      const list = res?.list ?? [];
      tenantOptions.value = list.map((t: SystemTenant) => ({ label: t.tenantName, value: t.id }));
      if (isAdmin.value && !queryParams.tenantId && tenantOptions.value.length) {
        queryParams.tenantId = tenantOptions.value[0]!.value;
      }
    } finally {
      tenantLoading.value = false;
    }
  };

  const resolveCurrentTenantId = () => {
    if (isAdmin.value) return queryParams.tenantId ?? null;
    return userStore.userInfo.tenantId ?? null;
  };

  const currentTenantName = computed(() => {
    const tid = resolveCurrentTenantId();
    if (!tid) return '';
    const opt = tenantOptions.value.find((t) => t.value === tid);
    return opt?.label || String(tid);
  });

  const normalizeRow = (r: any): SystemGroup => {
    const updateTime = r.updateTime ?? r.createTime ?? '';
    const status = r.status != null ? Number(r.status) : 1;
    const roleIds = Array.isArray(r.roleIds) ? r.roleIds : [];
    const userIds = Array.isArray(r.userIds) ? r.userIds : [];
    return {
      ...r,
      updateTime,
      status,
      tenantId: r.tenantId ?? null,
      roleIds,
      userIds,
      roleCount: r.roleCount != null ? Number(r.roleCount) : roleIds.length,
      userCount: r.userCount != null ? Number(r.userCount) : userIds.length,
      isDefault: r.isDefault === true
    };
  };

  const fetchData = async () => {
    loading.value = true;
    try {
      const res = await getSystemGroupList({
        keyword: queryParams.keyword || '',
        status: queryParams.status === '' ? '' : queryParams.status,
        tenantId: resolveCurrentTenantId()
      });
      groupList.value = (res?.list ?? []).map(normalizeRow);
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => {
    fetchData();
  };

  const resetQuery = () => {
    queryParams.keyword = '';
    queryParams.status = '';
    if (!isAdmin.value) {
      queryParams.tenantId = userStore.userInfo.tenantId ?? null;
    }
    fetchData();
  };

  onMounted(async () => {
    await fetchTenantOptions();
    if (!isAdmin.value) queryParams.tenantId = userStore.userInfo.tenantId ?? null;
    fetchData();
  });

  return {
    loading,
    groupList,
    isAdmin,
    queryParams,
    tenantLoading,
    tenantOptions,
    currentTenantName,
    resolveCurrentTenantId,
    fetchData,
    handleSearch,
    resetQuery
  };
}
