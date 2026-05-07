import { ref } from 'vue';
import { getMessageList } from '@/api/message';

const unreadCount = ref(0);
const loading = ref(false);

let inflight: Promise<number> | null = null;

async function refreshUnreadCount(): Promise<number> {
  if (inflight) return inflight;
  inflight = (async () => {
    loading.value = true;
    try {
      const res = await getMessageList({
        status: 'unread',
        pageIndex: 1,
        pageSize: 1
      });
      const next = res?.unreadCount ?? res?.total ?? 0;
      unreadCount.value = next;
      return next;
    } catch {
      unreadCount.value = 0;
      return 0;
    } finally {
      loading.value = false;
      inflight = null;
    }
  })();
  return inflight;
}

export function useMessageUnreadCount() {
  return {
    unreadCount,
    loading,
    refreshUnreadCount
  };
}
