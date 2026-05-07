<template>
  <div class="message-box" @click="handleOpen">
    <div class="message-item" :class="type">
      <div class="message-icon">
        <img class="message-icon-img" :src="iconSrc" alt="" />
      </div>
      <div class="message-body">
        <div class="message-title">
          <div class="message-title-row">
            <span class="message-title-text" :title="taskStatusText">{{ taskStatusText }}</span>
            <span class="message-title-tag" :class="{ 'no-icon': isSystemNotice }">
              <MenuIcon
                v-if="!isSystemNotice && sourceDisplay.icon"
                class="tag-app-icon"
                :icon="sourceDisplay.icon"
                :width="12"
                :height="12"
              />
              <span v-else-if="!isSystemNotice" class="tag-icon" />
              <span class="tag-text">{{ sourceDisplay.title }}</span>
            </span>
            <span class="message-ops" @click.stop>
              <span v-if="item.status === 'unread'" class="message-unread-dot" />
            </span>
          </div>
        </div>
        <div class="message-content">
          <template v-for="(seg, idx) in contentSegments" :key="idx">
            <span :class="seg.className">{{ seg.text }}</span>
          </template>
        </div>
        <div class="message-time">{{ relativeTimeText }}</div>
      </div>
    </div>
    <div class="message-action-line"></div>
    <div class="text">请及时处理</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MenuIcon from '@/components/MenuIcon.vue';
import { usePermissionStore } from '@/store/permission';
import type { MessageItem as MessageNoticeItem, MessageLevel } from '@/api/message';
import iconMsgDangerUrl from '@/assets/image/navbar/icon_msg_danger.svg';
import iconMsgWarningUrl from '@/assets/image/navbar/icon_msg_warning.svg';

interface MessageItemProps {
  item: MessageNoticeItem;
  /** optional: legacy external override */
  type?: MsgType;
}

const props = defineProps<MessageItemProps>();

const emit = defineEmits<{
  (e: 'open', item: MessageNoticeItem): void;
  (e: 'read', item: MessageNoticeItem): void;
}>();

const permissionStore = usePermissionStore();

type MsgType = MessageLevel;
const type = computed<MsgType>(() => {
  const raw =
    props.type ??
    (props.item as MessageNoticeItem & { type?: MsgType }).type ??
    props.item.level;
  return raw === 'danger' ? 'danger' : 'warning';
});

const taskStatusText = computed(() => {
  return type.value === 'danger' ? '任务已逾期' : '任务即将到期';
});

const iconSrc = computed(() => (type.value === 'danger' ? iconMsgDangerUrl : iconMsgWarningUrl));

type ContentSegment = { text: string; className?: string };

const contentSegments = computed<ContentSegment[]>(() => {
  const raw = String(props.item.summary || '');
  if (!raw) return [];

  // 匹配日期：2026-02-28 / 2026/02/28 / 2026年02月28日
  const dateRe = /\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{4}年\d{1,2}月\d{1,2}日/g;
  // 逾期关键字
  const overdueRe = /已逾期|逾期/g;

  // 先做日期分段
  const dateParts: ContentSegment[] = [];
  let last = 0;
  for (const m of raw.matchAll(dateRe)) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (start > last) dateParts.push({ text: raw.slice(last, start) });
    dateParts.push({ text: m[0], className: 'is-date' });
    last = end;
  }
  if (last < raw.length) dateParts.push({ text: raw.slice(last) });

  // 再在各段内标红“逾期”
  const res: ContentSegment[] = [];
  for (const p of dateParts) {
    if (!p.text || p.className === 'is-date') {
      res.push(p);
      continue;
    }
    let s = p.text;
    let cursor = 0;
    for (const m of s.matchAll(overdueRe)) {
      const start = m.index ?? 0;
      const end = start + m[0].length;
      if (start > cursor) res.push({ text: s.slice(cursor, start) });
      res.push({ text: m[0], className: 'is-overdue' });
      cursor = end;
    }
    if (cursor < s.length) res.push({ text: s.slice(cursor) });
  }
  return res;
});

const sourceDisplay = computed(() => {
  const fallback = { title: props.item.category || '', icon: '' as string | undefined };
  const key = (props.item as MessageNoticeItem & { sourceApp?: string }).sourceApp || props.item.category;
  const resolved = permissionStore.getSubAppDisplayByKey(key);
  return resolved ? { ...resolved } : fallback;
});

const isSystemNotice = computed(() => {
  const key = (props.item as MessageNoticeItem & { sourceApp?: string }).sourceApp || '';
  return props.item.category === '系统通知' || key === 'main';
});

const parsePublishTime = (value: string): Date | null => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  // supports "YYYY-MM-DD HH:mm" / "YYYY-MM-DD HH:mm:ss"
  const normalized = raw.replace(/-/g, '/');
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
};

const relativeTimeText = computed(() => {
  const d = parsePublishTime(props.item.publishTime);
  if (!d) return props.item.publishTime;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThatDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((startOfToday.getTime() - startOfThatDay.getTime()) / 86400000);

  if (diffDays <= 0) return '今天';
  if (diffDays === 1) return '1天前';
  return `${diffDays}天前`;
});

const handleOpen = () => {
  emit('open', props.item);
};
</script>

<style scoped lang="scss">
.message-box {
  width: 100%;
  background: rgba(255, 255, 255, 1);
  border-radius: 8px;
  border: 1px solid rgba(232, 237, 243, 1);
  box-sizing: border-box;
  transition: all 0.25s;
  margin-bottom: 10px;
  padding: 15px 15px 0 19px;
  cursor: pointer;

  &:hover {
    background: #F7F9FE;

    .message-item {
      .message-unread-dot {
        opacity: 0;
      }
    }
  }

  .message-item {
    display: flex;
    align-items: flex-start;
    position: relative;

    .message-icon {
      flex-shrink: 0;
      margin-top: 2px;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .message-icon-img {
      width: 44px;
      height: 44px;
      display: block;
    }

    .message-body {
      flex: 1;
      min-width: 0;
      margin-left: 14px;
    }

    .message-title {
      width: 100%;
    }

    .message-title-row {
      display: flex;
      align-items: center;
      width: 100%;
    }

    .message-ops {
      margin-left: auto;
      width: 16px;
      height: 16px;
      position: relative;
      flex-shrink: 0;
    }

    .message-title-text {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 12px;
      font-family: PingFangSC, PingFang SC;
      font-weight: 500;
      font-size: 16px;
      color: #333333;
      line-height: 22px;
    }

    /* 参考工作台 TodoCard 的 item-tag 样式 */
    .message-title-tag {
      height: 20px;
      padding: 0 9px 0 6px;
      display: inline-flex;
      align-items: center;
      background: rgba(233, 241, 255, 1);
      border-radius: 4px;
      flex-shrink: 0;

      &.no-icon {
        padding-left: 9px;
      }

      .tag-app-icon {
        flex-shrink: 0;
      }

      .tag-icon {
        width: 10px;
        height: 10px;
        background: #009dff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .tag-text {
        font-family: PingFangSC, PingFang SC;
        font-weight: 500;
        font-size: 12px;
        color: #666666;
        line-height: 17px;
        text-align: left;
        font-style: normal;
        margin-left: 3px;
        white-space: nowrap;
      }
    }

    &.warning .message-title-tag .tag-icon {
      background: var(--el-color-warning);
    }

    &.danger .message-title-tag .tag-icon {
      background: var(--el-color-danger);
    }

    .message-content {
      font-size: 14px;
      color: var(--el-text-color-primary);
      line-height: 1.5;
      margin-top: 8px;

      .is-date {
        color: var(--el-color-primary);
        font-weight: 500;
      }

      .is-overdue {
        color: var(--el-color-danger);
        font-weight: 500;
      }
    }

    .message-time {
      margin-top: 6px;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #9DA3AC;
      line-height: 20px;
    }

    .message-unread-dot {
      position: absolute;
      right: 0;
      top: 5px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #F93260;
    }
  }

  .message-action-line {
    width: 100%;
    height: 1px;
    background: #E8EDF3;
    margin-top: 16px;
  }

  .text {
    padding: 12px 0;
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    font-size: 14px;
    color: #333333;
    line-height: 20px;
  }
}
</style>
