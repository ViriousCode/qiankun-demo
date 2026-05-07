import { ref, watch, onMounted, computed } from 'vue';
import type { ProfileTodoItem, TodoTab } from './constants';
import { DEFAULT_PAGE_SIZE } from './constants';
import { getTodoList } from '@/api/todo';
import type { TodoItem } from '@/api/todo';

function mapItem(apiItem: TodoItem): ProfileTodoItem {
  return {
    id: apiItem.id,
    category: apiItem.category,
    appKey: apiItem.appKey,
    createTime: apiItem.createTime,
    desc: apiItem.desc,
    deadline: apiItem.deadline,
    completeTime: apiItem.completeTime,
    status: apiItem.status,
    assigneeAvatar: apiItem.assigneeAvatar,
    title: apiItem.title,
    detailDesc: apiItem.detailDesc
  };
}

export function useTodoList() {
  const loading = ref(false);
  const activeTab = ref<TodoTab>('pending');
  const pageIndex = ref(1);
  const pageSize = ref(DEFAULT_PAGE_SIZE);
  const pendingFilterAppKey = ref<string>('');
  const pendingFilterKeyword = ref<string>('');
  const doneFilterAppKey = ref<string>('');
  const doneFilterKeyword = ref<string>('');

  const activeFilters = computed(() => {
    if (activeTab.value === 'done') {
      return { appKey: doneFilterAppKey.value, keyword: doneFilterKeyword.value };
    }
    return { appKey: pendingFilterAppKey.value, keyword: pendingFilterKeyword.value };
  });

  /** 当前页列表（接口返回或 mock） */
  const list = ref<ProfileTodoItem[]>([]);
  /** 当前 Tab 总数 */
  const total = ref(0);
  /** 待处理数量（接口返回 pendingCount 或当前 Tab 为 pending 时的 total） */
  const pendingCount = ref(0);
  /** 已处理数量（接口返回 doneCount 或当前 Tab 为 done 时的 total） */
  const doneCount = ref(0);

  /** 逾期数量（当前已拉取列表内计算；后续建议由后端提供 total overdueCount） */
  const overdueCount = computed(() => {
    const now = Date.now();
    return list.value.filter((item) => {
      if (item.status !== 'pending') return false;
      const deadline = new Date(String(item.deadline || '')).getTime();
      if (Number.isNaN(deadline)) return false;
      return deadline < now;
    }).length;
  });

  async function fetchData() {
    loading.value = true;
    try {
      const res = await getTodoList({
        status: activeTab.value,
        pageIndex: pageIndex.value,
        pageSize: pageSize.value,
        appKey: activeFilters.value.appKey || undefined,
        keyword: activeFilters.value.keyword?.trim() || undefined
      });
      list.value = (res?.list ?? []).map(mapItem);
      total.value = res?.total ?? 0;
      if (res?.pendingCount != null) pendingCount.value = res.pendingCount;
      if (res?.doneCount != null) doneCount.value = res.doneCount;
      if (res?.pendingCount == null && activeTab.value === 'pending')
        pendingCount.value = total.value;
      if (res?.doneCount == null && activeTab.value === 'done') doneCount.value = total.value;
    } catch {
      list.value = [];
      total.value = 0;
      pendingCount.value = 0;
      doneCount.value = 0;
    } finally {
      loading.value = false;
    }
  }

  function handleTabChange() {
    pageIndex.value = 1;
  }

  function handlePageChange(page: number) {
    pageIndex.value = page;
  }

  function handleSizeChange(size: number) {
    pageSize.value = size;
    pageIndex.value = 1;
  }

  watch(activeTab, () => {
    pageIndex.value = 1;
  });

  watch([activeTab, pageIndex, pageSize, activeFilters], () => {
    fetchData();
  });

  onMounted(() => {
    fetchData();
  });

  return {
    loading,
    activeTab,
    pendingCount,
    doneCount,
    overdueCount,
    pendingFilterAppKey,
    pendingFilterKeyword,
    doneFilterAppKey,
    doneFilterKeyword,
    list,
    total,
    pageIndex,
    pageSize,
    fetchData,
    handleTabChange,
    handlePageChange,
    handleSizeChange
  };
}
