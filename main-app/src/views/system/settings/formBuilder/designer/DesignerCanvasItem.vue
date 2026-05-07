<template>
  <div
    v-show="visible"
    class="canvas-item"
    :data-uid="field.uid"
    :class="{ 'is-active': isActive, 'is-selected': isSelected }"
    @click="onSelect"
  >
    <div class="canvas-main">
      <div class="canvas-label">{{ field.label || '未命名字段' }}</div>
      <div class="canvas-meta">{{ field.type }} · {{ field.field || '(field)' }}</div>
    </div>
    <el-button link type="danger" @click.stop="emit('remove')">移除</el-button>
  </div>
</template>

<script setup lang="ts">
import type { FormFieldSchema } from '@/types/formBuilder';

defineProps<{
  field: FormFieldSchema;
  visible: boolean;
  isActive: boolean;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', event: MouseEvent): void;
  (e: 'remove'): void;
}>();

const onSelect = (event: MouseEvent) => {
  emit('select', event);
};
</script>

<style scoped lang="scss">
.canvas-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
}

.canvas-item:last-child {
  margin-bottom: 0;
}

.canvas-item.is-active {
  border-color: var(--el-color-primary);
  background: rgba(64, 158, 255, 0.06);
}

.canvas-item.is-selected {
  border-color: rgba(64, 158, 255, 0.5);
  background: rgba(64, 158, 255, 0.04);
}

.canvas-label {
  font-weight: 600;
}

.canvas-meta {
  color: #888;
  font-size: 12px;
  margin-top: 2px;
}
</style>
