import { computed, onMounted, reactive, ref } from 'vue';
import { getDictCategoryList, type DictCategory } from '@/api/dict';
import { DEFAULT_PAGE_SIZE } from '@/config';

export function useCategoryList() {
  const loading = ref(false);
  const list = ref<DictCategory[]>([]);

  const queryParams = reactive({
    pageIndex: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    categoryName: '',
    categoryCode: '',
    status: ''
  });

  const filteredList = computed(() => {
    let data = list.value;
    if (queryParams.categoryName?.trim()) {
      const n = queryParams.categoryName.trim().toLowerCase();
      data = data.filter((item) => (item.categoryName || '').toLowerCase().includes(n));
    }
    if (queryParams.categoryCode?.trim()) {
      const c = queryParams.categoryCode.trim().toLowerCase();
      data = data.filter((item) => (item.categoryCode || '').toLowerCase().includes(c));
    }
    if (queryParams.status) {
      data = data.filter((item) => String(item.status ?? 0) === queryParams.status);
    }
    return data;
  });

  const total = computed(() => filteredList.value.length);

  const tableData = computed(() => {
    const start = (queryParams.pageIndex - 1) * queryParams.pageSize;
    return filteredList.value.slice(start, start + queryParams.pageSize);
  });

  const fetchData = async () => {
    loading.value = true;
    try {
      const data = await getDictCategoryList();
      list.value = data || [];
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
    queryParams.pageIndex = 1;
    queryParams.pageSize = DEFAULT_PAGE_SIZE;
    queryParams.categoryName = '';
    queryParams.categoryCode = '';
    queryParams.status = '';
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

