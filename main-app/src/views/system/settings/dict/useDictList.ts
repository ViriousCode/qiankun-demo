import { ref, reactive, computed, onMounted } from 'vue';
import { getDictList, type DictItem } from '@/api/dict';
import { DEFAULT_PAGE_SIZE } from '@/config';

export function useDictList() {
  const loading = ref(false);
  const list = ref<DictItem[]>([]);

  const queryParams = reactive({
    pageIndex: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    name: '',
    code: '',
    categoryCode: '',
    status: ''
  });

  const filteredList = computed(() => {
    let data = list.value;
    if (queryParams.name?.trim()) {
      const n = queryParams.name.trim().toLowerCase();
      data = data.filter((item) => (item.name || '').toLowerCase().includes(n));
    }
    if (queryParams.code?.trim()) {
      const c = queryParams.code.trim().toLowerCase();
      data = data.filter((item) => (item.code || '').toLowerCase().includes(c));
    }
    if (queryParams.categoryCode?.trim()) {
      const cc = queryParams.categoryCode.trim();
      data = data.filter((item) => String(item.categoryCode || '') === cc);
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
      const data = await getDictList();
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
    queryParams.name = '';
    queryParams.code = '';
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
