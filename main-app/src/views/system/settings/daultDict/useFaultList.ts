import { ref, reactive, computed, onMounted } from 'vue';
import { getFaultList, type FaultItem } from '@/api/fault';
import { DEFAULT_PAGE_SIZE } from '@/config';

export function useFaultList() {
  const loading = ref(false);
  const fullList = ref<FaultItem[]>([]);
  const total = ref(0);

  const queryParams = reactive({
    pageIndex: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    faultCode: '',
    faultCategory: '',
    faultLevel: ''
  });

  const tableData = computed(() => {
    const start = (queryParams.pageIndex - 1) * queryParams.pageSize;
    return fullList.value.slice(start, start + queryParams.pageSize);
  });

  const fetchData = async () => {
    loading.value = true;
    try {
      const data = await getFaultList({
        faultCode: queryParams.faultCode || undefined,
        faultCategory: queryParams.faultCategory || undefined,
        faultLevel: queryParams.faultLevel || undefined
      });
      fullList.value = data || [];
      total.value = fullList.value.length;
    } finally {
      loading.value = false;
    }
  };

  const calculateIndex = (index: number) => {
    return (queryParams.pageIndex - 1) * queryParams.pageSize + index + 1;
  };

  const handleSearch = () => {
    queryParams.pageIndex = 1;
    fetchData();
  };

  const resetQuery = () => {
    queryParams.faultCode = '';
    queryParams.faultCategory = '';
    queryParams.faultLevel = '';
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
    resetQuery,
    calculateIndex
  };
}
