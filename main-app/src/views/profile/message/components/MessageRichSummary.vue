<template>
  <span class="message-rich-summary">
    <template v-for="(seg, idx) in segments" :key="idx">
      <span v-if="seg.className" :class="seg.className">{{ seg.text }}</span>
      <template v-else>{{ seg.text }}</template>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { buildMessageContentSegments } from '../messageContentSegments';

const props = defineProps<{
  summary: string;
  level: 'warning' | 'danger';
}>();

const segments = computed(() => buildMessageContentSegments(props.summary, props.level));
</script>

<style scoped lang="scss">
/* 设计 token（与稿 / DevTools 命名一致，便于主题或排查） */
.message-rich-summary {
  --task-title: rgba(51, 51, 51, 1);
  --msg-gray: rgba(102, 102, 102, 1);
  --msg-blue: rgba(64, 158, 255, 1);
  --msg-red: rgba(249, 50, 96, 1);

  color: var(--msg-gray);
  line-height: 1.5;

  .is-due-date {
    color: var(--msg-blue);
    font-weight: 500;
  }

  span.is-task-title {
    color: var(--task-title) !important;
    font-weight: 600;
  }

  .is-template-glue {
    color: var(--msg-gray);
    font-weight: 400;
  }

  .is-overdue,
  .is-overdue-flag {
    color: var(--msg-red);
    font-weight: 500;
  }
}
</style>
