import { ref, reactive, onMounted } from 'vue';
import { getApiList, type ApiItem } from '@/api/systemApi';
import { getAppList } from '@/api/app';
import { DEFAULT_PAGE_SIZE } from '@/config';

export interface ApiAppOption {
  label: string;
  value: string;
  iconName?: string;
}

export function useApiList() {
  const loading = ref(false);
  const tableData = ref<ApiItem[]>([]);
  const total = ref(0);
  const appOptions = ref<ApiAppOption[]>([]);

  const queryParams = reactive<{
    name: string;
    path: string;
    method: '' | 'GET' | 'POST' | 'PUT' | 'DELETE';
    appName: string;
    enabled: boolean | undefined;
    pageIndex: number;
    pageSize: number;
  }>({
    name: '',
    path: '',
    method: '',
    appName: '',
    enabled: undefined,
    pageIndex: 1,
    pageSize: DEFAULT_PAGE_SIZE
  });

  const fetchData = async () => {
    loading.value = true;
    try {
      const { list, total: t } = (await getApiList({
        name: queryParams.name.trim() || undefined,
        path: queryParams.path.trim() || undefined,
        method: queryParams.method || undefined,
        appName: queryParams.appName || undefined,
        enabled: queryParams.enabled,
        pageIndex: queryParams.pageIndex,
        pageSize: queryParams.pageSize
      })) ?? { list: [], total: 0 };
      tableData.value = list;
      total.value = t;
    } finally {
      loading.value = false;
    }
  };

  const fetchAppOptions = async () => {
    const list = await getAppList();
    const valueMap = new Map<string, ApiAppOption>();
    (list ?? []).forEach((item) => {
      const appName = String(item.name || '').trim();
      if (!appName) return;
      valueMap.set(appName, {
        value: appName,
        label: String(item.shortName || item.name || '').trim() || appName,
        iconName: String(item.iconName || '').trim()
      });
    });
    appOptions.value = [{ label: '主系统', value: '主系统' }, ...Array.from(valueMap.values())];
  };

  const handleSearch = () => {
    queryParams.pageIndex = 1;
    fetchData();
  };

  const resetQuery = () => {
    queryParams.name = '';
    queryParams.path = '';
    queryParams.method = '';
    queryParams.appName = '';
    queryParams.enabled = undefined;
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

  onMounted(() => {
    fetchAppOptions();
    fetchData();
  });

  return {
    loading,
    tableData,
    total,
    appOptions,
    queryParams,
    fetchData,
    handleSearch,
    resetQuery,
    handlePageChange,
    handleSizeChange
  };
}
