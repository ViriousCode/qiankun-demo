import { ref, reactive, onMounted } from 'vue';
import { getSystemTenantList, type SystemTenant } from '@/api/systemTenant';
import type { SystemTenantListParams } from '@/api/systemTenant';
import { DEFAULT_PAGE_SIZE } from '@/config';

export function useTenantList() {
  const loading = ref(false);
  const tableData = ref<SystemTenant[]>([]);
  const total = ref(0);
  const queryParams = reactive<{
    tenantName: string;
    status: number | undefined;
    pageIndex: number;
    pageSize: number;
  }>({
    tenantName: '',
    status: undefined,
    pageIndex: 1,
    pageSize: DEFAULT_PAGE_SIZE
  });

  const fetchData = async () => {
    loading.value = true;
    try {
      const params: SystemTenantListParams = {
        tenantName: queryParams.tenantName || undefined,
        status: queryParams.status,
        pageIndex: queryParams.pageIndex,
        pageSize: queryParams.pageSize
      };
      const res = await getSystemTenantList(params);
      tableData.value = res?.list ?? [];
      total.value = res?.total ?? 0;
    } finally {
      loading.value = false;
    }
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
    queryParams.tenantName = '';
    queryParams.status = undefined;
    queryParams.pageIndex = 1;
    fetchData();
  };

  onMounted(() => {
    fetchData();
  });

  return {
    loading,
    tableData,
    total,
    queryParams,
    fetchData,
    handleSearch,
    handlePageChange,
    handleSizeChange,
    resetQuery
  };
}
