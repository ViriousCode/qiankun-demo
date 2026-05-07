import { ref, computed, toValue, watch, type MaybeRefOrGetter } from 'vue';
import type { ProfileTodoItem } from './constants';
import { getTodoDetail, type TodoItem } from '@/api/todo';

function mapItem(apiItem: TodoItem): ProfileTodoItem {
  return {
    id: apiItem.id,
    category: apiItem.category,
    appKey: apiItem.appKey,
    createTime: apiItem.createTime,
    desc: apiItem.desc,
    deadline: apiItem.deadline,
    status: apiItem.status,
    assigneeAvatar: apiItem.assigneeAvatar,
    title: apiItem.title,
    detailDesc: apiItem.detailDesc
  };
}

export function useTodoDetail(id: MaybeRefOrGetter<string>) {
  const item = ref<ProfileTodoItem | null>(null);
  const loading = ref(false);

  const isOverdue = computed(() => {
    const it = item.value;
    if (!it || it.status !== 'pending') return false;
    const deadline = it.deadline;
    if (!deadline) return false;
    const t = new Date(deadline.replace(/-/g, '/')).getTime();
    return !Number.isNaN(t) && Date.now() > t;
  });

  const displayTitle = computed(() => item.value?.title || item.value?.desc || '');
  const displayDesc = computed(() => item.value?.detailDesc || item.value?.desc || '');

  async function loadItem(todoId = toValue(id)) {
    if (!todoId) {
      item.value = null;
      return;
    }
    loading.value = true;
    try {
      const res = await getTodoDetail(todoId);
      item.value = res ? mapItem(res) : null;
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
    isOverdue,
    displayTitle,
    displayDesc,
    loadItem
  };
}
