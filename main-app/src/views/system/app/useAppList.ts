import { ref, reactive, onMounted } from 'vue';
import { getAppList, type MicroApp, type AppQueryParams, type AppCategory } from '@/api/app';

export function useAppList(category: AppCategory) {
  const loading = ref(false);
  const tableData = ref<MicroApp[]>([]);
  const queryParams = reactive<Omit<AppQueryParams, 'category'>>({
    searchName: '',
    status: ''
  });

  const fetchData = async () => {
    loading.value = true;
    try {
      const res = await getAppList({
        searchName: queryParams.searchName || undefined,
        status: queryParams.status === '' ? undefined : queryParams.status,
        category
      });
      tableData.value = res ?? [];
    } finally {
      loading.value = false;
    }
  };

  const resetQuery = () => {
    queryParams.searchName = '';
    queryParams.status = '';
    fetchData();
  };

  onMounted(() => {
    fetchData();
  });

  return {
    loading,
    tableData,
    queryParams,
    fetchData,
    resetQuery
  };
}
