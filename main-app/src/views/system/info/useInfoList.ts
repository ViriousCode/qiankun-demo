import { ref, reactive, onMounted } from 'vue';
import { getSystemInfoList, type SystemInfo } from '@/api/systemInfo';
import { DEFAULT_PAGE_SIZE } from '@/config';
import { INFO_TYPE_OPTIONS } from './constants';

export function useInfoList() {
  const loading = ref(false);
  const tableData = ref<SystemInfo[]>([]);
  const total = ref(0);
  const typeOptions = ref(
    INFO_TYPE_OPTIONS.map((item) => ({
      label: item.label,
      value: item.value
    }))
  );
  const queryParams = reactive<{
    title: string;
    infoType: 'internal' | 'external' | '';
    status: number | undefined;
    pageIndex: number;
    pageSize: number;
  }>({
    title: '',
    infoType: '',
    status: undefined,
    pageIndex: 1,
    pageSize: DEFAULT_PAGE_SIZE
  });

  const fetchData = async () => {
    loading.value = true;
    try {
      const res = await getSystemInfoList({
        title: queryParams.title.trim() || undefined,
        infoType: queryParams.infoType || undefined,
        status: queryParams.status,
        pageIndex: queryParams.pageIndex,
        pageSize: queryParams.pageSize
      });
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
    queryParams.title = '';
    queryParams.infoType = '';
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
    typeOptions,
    queryParams,
    fetchData,
    handleSearch,
    handlePageChange,
    handleSizeChange,
    resetQuery
  };
}
