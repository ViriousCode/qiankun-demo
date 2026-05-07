import { ref, reactive, computed, onMounted } from 'vue';
import { getLinkList, type LinkItem } from '@/api/link';
import { DEFAULT_PAGE_SIZE } from '@/config';

export function useLinkList() {
  const loading = ref(false);
  const fullList = ref<LinkItem[]>([]);
  const total = ref(0);

  const queryParams = reactive({
    pageIndex: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    name: '',
    status: '' as '' | 0 | 1
  });

  const tableData = computed(() => {
    const start = (queryParams.pageIndex - 1) * queryParams.pageSize;
    return fullList.value.slice(start, start + queryParams.pageSize);
  });

  const fetchData = async () => {
    loading.value = true;
    try {
      const data = await getLinkList({
        name: queryParams.name.trim() || undefined,
        status: queryParams.status === '' ? undefined : Number(queryParams.status)
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
    queryParams.status = '';
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
    resetQuery,
    calculateIndex
  };
}
