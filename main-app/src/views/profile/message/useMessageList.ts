import { ref, watch, onMounted } from 'vue';
import { getMessageList, type MessageItem } from '@/api/message';
import { type MessageTab, type ProfileMessageItem } from './constants';

function mapItem(apiItem: MessageItem): ProfileMessageItem {
  return {
    id: apiItem.id,
    title: apiItem.title,
    summary: apiItem.summary,
    detailContent: apiItem.detailContent,
    publishTime: apiItem.publishTime,
    status: apiItem.status,
    level: apiItem.level,
    category: apiItem.category,
    sourceApp: apiItem.sourceApp
  };
}

export function useMessageList() {
  const LIST_PAGE_SIZE = 500;
  const loading = ref(false);
  const activeTab = ref<MessageTab>('unread');
  const sourceAppKey = ref<string>('');
  const list = ref<ProfileMessageItem[]>([]);
  const total = ref(0);
  const unreadCount = ref(0);
  const readCount = ref(0);

  async function fetchData() {
    loading.value = true;
    try {
      const res = await getMessageList({
        status: activeTab.value,
        pageIndex: 1,
        pageSize: LIST_PAGE_SIZE,
        sourceApp: sourceAppKey.value || undefined
      });
      list.value = (res?.list ?? []).map(mapItem);
      total.value = res?.total ?? 0;
      if (res?.unreadCount != null) unreadCount.value = res.unreadCount;
      if (res?.readCount != null) readCount.value = res.readCount;
      if (res?.unreadCount == null && activeTab.value === 'unread') unreadCount.value = total.value;
      if (res?.readCount == null && activeTab.value === 'read') readCount.value = total.value;
    } catch {
      list.value = [];
      total.value = 0;
      unreadCount.value = 0;
      readCount.value = 0;
    } finally {
      loading.value = false;
    }
  }

  function handleTabChange() {
    // 切换标签后由 watch 自动拉取
  }

  watch([activeTab, sourceAppKey], () => {
    fetchData();
  });

  onMounted(() => {
    fetchData();
  });

  return {
    loading,
    activeTab,
    sourceAppKey,
    unreadCount,
    readCount,
    list,
    total,
    fetchData,
    handleTabChange
  };
}
