import { ref, reactive, onMounted } from 'vue';
import { getSystemUserList, type SystemUserListParams, type SystemUser } from '@/api/systemUser';
import { getSystemTenantList, type SystemTenant } from '@/api/systemTenant';
import { DEFAULT_PAGE_SIZE } from '@/config';

/** 顶部租户筛选：仅看未关联租户的用户 */
export const TENANT_FILTER_NONE = 'none' as const;
export type TenantFilter = number | typeof TENANT_FILTER_NONE | undefined;

export function useUserList() {
  const loading = ref(false);
  const tableData = ref<SystemUser[]>([]);
  const total = ref(0);
  const tenantList = ref<SystemTenant[]>([]);
  const nameOptions = ref<string[]>([]);
  const queryParams = reactive<{
    name: string;
    tenantFilter: TenantFilter;
    status: number | undefined;
    pageIndex: number;
    pageSize: number;
  }>({
    name: '',
    tenantFilter: undefined,
    status: undefined,
    pageIndex: 1,
    pageSize: DEFAULT_PAGE_SIZE
  });

  const fetchData = async () => {
    loading.value = true;
    try {
      const params: SystemUserListParams = {
        source: 'platform',
        name: queryParams.name?.trim() || undefined,
        tenantEmpty: queryParams.tenantFilter === TENANT_FILTER_NONE ? true : undefined,
        tenantId:
          typeof queryParams.tenantFilter === 'number' ? queryParams.tenantFilter : undefined,
        status: queryParams.status,
        pageIndex: queryParams.pageIndex,
        pageSize: queryParams.pageSize
      };
      const res = await getSystemUserList(params);
      tableData.value = res?.list ?? [];
      total.value = res?.total ?? 0;
    } finally {
      loading.value = false;
    }
  };

  const fetchTenantOptions = async () => {
    const res = await getSystemTenantList({ pageIndex: 1, pageSize: 500 });
    tenantList.value = res?.list ?? [];
  };
  const fetchNameOptions = async () => {
    const res = await getSystemUserList({ source: 'platform', pageIndex: 1, pageSize: 500 });
    const values = new Set<string>();
    (res?.list ?? []).forEach((item) => {
      const value = String(item.name || '').trim();
      if (value) values.add(value);
    });
    nameOptions.value = Array.from(values);
  };

  const handleSearch = () => {
    queryParams.pageIndex = 1;
    fetchData();
  };

  const handlePageChange = (page: number) => {
    queryParams.pageIndex = page;
    fetchData();
  };

  const handleSizeChange = (size: number) => {
    queryParams.pageSize = size;
    queryParams.pageIndex = 1;
    fetchData();
  };

  const resetQuery = () => {
    queryParams.name = '';
    queryParams.tenantFilter = undefined;
    queryParams.status = undefined;
    queryParams.pageIndex = 1;
    fetchData();
  };

  function displayTenantName(row: SystemUser) {
    if (row.tenantName) return row.tenantName;
    const tid = row.tenantId;
    if (tid == null) return '无租户';
    return tenantList.value.find((t) => t.id === tid)?.tenantName ?? '无租户';
  }

  function displayGender(g?: string) {
    if (g === 'female') return '女';
    if (g === 'male') return '男';
    return '-';
  }

  onMounted(() => {
    fetchNameOptions();
    fetchTenantOptions();
    fetchData();
  });

  return {
    loading,
    tableData,
    total,
    tenantList,
    nameOptions,
    queryParams,
    fetchData,
    handleSearch,
    handlePageChange,
    handleSizeChange,
    resetQuery,
    displayTenantName,
    displayGender
  };
}
