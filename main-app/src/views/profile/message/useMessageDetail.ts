import { ref, computed, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { getMessageDetail, markMessageRead, type MessageItem } from '@/api/message';
import type { ProfileMessageItem } from './constants';
import { useMessageUnreadCount } from './useMessageUnreadCount';

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

export function useMessageDetail(id: MaybeRefOrGetter<string>) {
  const item = ref<ProfileMessageItem | null>(null);
  const loading = ref(false);
  const { refreshUnreadCount } = useMessageUnreadCount();

  const displayTitle = computed(() => item.value?.summary || '');
  const displayDesc = computed(() => item.value?.detailContent || item.value?.summary || '');

  async function loadItem(messageId = toValue(id)) {
    if (!messageId) {
      item.value = null;
      return;
    }
    loading.value = true;
    try {
      const res = await getMessageDetail(messageId);
      item.value = res ? mapItem(res) : null;
      // 进入详情后标记为已读（仅未读时调用）
      if (res && res.status === 'unread') {
        markMessageRead(res.id)
          .then(() => {
            if (item.value && item.value.id === res.id) {
              item.value = { ...item.value, status: 'read' };
            }
            refreshUnreadCount();
          })
          .catch(() => undefined);
      }
    } catch {
      item.value = null;
    } finally {
      loading.value = false;
    }
  }

  watch(
    () => toValue(id),
    () => {
      loadItem();
    },
    { immediate: true }
  );

  return {
    item,
    loading,
    displayTitle,
    displayDesc,
    loadItem
  };
}
