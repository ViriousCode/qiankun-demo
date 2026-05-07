import { computed, onMounted, reactive, ref } from 'vue';
import { getRoleList, type Role } from '@/api/role';
import { getSystemTenantList, type SystemTenant } from '@/api/systemTenant';
import { useUserStore } from '@/store/user';

export function useRoleList() {
  const loading = ref(false);
  const roleList = ref<Role[]>([]);

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

  const normalizeRoleRow = (r: any): Role => {
    const roleCode = r.roleCode ?? r.roleKey ?? '';
    const updateTime = r.updateTime ?? r.createTime ?? '';
    const status = r.status != null ? Number(r.status) : 1;
    return {
      ...r,
      roleCode,
      updateTime,
      status,
      app: r.app ?? 'main',
      tenantId: r.tenantId ?? null
    };
  };

  const fetchData = async () => {
    loading.value = true;
    try {
      const res = await getRoleList({
        keyword: queryParams.keyword || '',
        status: queryParams.status === '' ? '' : queryParams.status,
        tenantId: resolveCurrentTenantId()
      });
      roleList.value = (res?.list ?? []).map(normalizeRoleRow);
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
    roleList,
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
