<template>
  <el-drawer
    v-model="visible"
    title="消息提醒"
    direction="rtl"
    size="470px"
    :with-header="true"
    :modal="false"
    modal-class="message-drawer-wrapper"
  >
    <template #header>
      <div class="drawer-header">
        <span class="drawer-title">消息提醒</span>
        <div class="drawer-actions">
          <el-button link type="primary" @click="handleMarkAllRead">一键已读</el-button>
          <el-button link type="primary" @click="handleGotoList">消息列表</el-button>
        </div>
      </div>
    </template>
    <div class="message-panel">
      <section v-if="list && list.length" class="message-section">
        <MessageItem v-for="(item, index) in list" :key="item.id ?? String(index)" :item="item"
          :type="(item as any).type ?? item.level" @open="handleItemOpen" @read="handleItemRead" />
      </section>

      <TableEmpty v-if="!hasMessages" type="nomessage" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MessageItem from './MessageItem.vue';
import TableEmpty from '@/components/TableEmpty.vue';
import type { MessageItem as MessageNoticeItem } from '@/api/message';

interface Props {
  modelValue: boolean;
  list: MessageNoticeItem[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'item-action', item: MessageNoticeItem): void;
  (e: 'item-read', item: MessageNoticeItem): void;
  (e: 'mark-all-read'): void;
  (e: 'goto-list'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value);
  }
});

const hasMessages = computed(() => {
  return props.list && props.list.length > 0;
});

const handleItemOpen = (item: MessageNoticeItem) => {
  emit('item-action', item);
};

const handleItemRead = (item: MessageNoticeItem) => {
  emit('item-read', item);
};

const handleMarkAllRead = () => {
  emit('mark-all-read');
};

const handleGotoList = () => {
  emit('goto-list');
};
</script>

<style scoped lang="scss">
.message-panel {
  margin-top: 16px;
}

.drawer-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 10px;
}

.drawer-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
}

.drawer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
