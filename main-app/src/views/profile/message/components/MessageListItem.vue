<template>
  <div class="message-box">
    <div class="message-item" :class="type">
      <div class="message-icon">
        <img class="message-icon-img" :src="iconSrc" alt="" />
      </div>
      <div class="message-body">
        <div class="message-title">
          <div class="message-title-row">
            <span v-if="item.status === 'unread'" class="message-title-unread-dot" />
            <span class="message-title-text" :title="taskStatusText">{{ taskStatusText }}</span>
            <span class="message-title-tag" :class="{ 'no-icon': isSystemNotice }">
              <MenuIcon v-if="!isSystemNotice && sourceDisplay.icon" class="tag-app-icon" :icon="sourceDisplay.icon"
                :width="12" :height="12" />
              <span v-else-if="!isSystemNotice" class="tag-icon" />
              <span class="tag-text">{{ sourceDisplay.title }}</span>
            </span>
            <span class="message-ops" @click.stop>
              <button class="message-delete-btn" type="button" aria-label="delete" @click="handleDelete">
                <img class="message-delete-img" :src="iconMsgDeleteUrl" alt="" />
              </button>
            </span>
          </div>
        </div>

        <div class="message-content">
          <MessageRichSummary :summary="item.summary" :level="type" />
        </div>

        <div class="message-footer">
          <span class="message-time">{{ footerTimeText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { ProfileMessageItem } from '../constants';
import MenuIcon from '@/components/MenuIcon.vue';
import MessageRichSummary from './MessageRichSummary.vue';
import { usePermissionStore } from '@/store/permission';
import iconMsgDangerUrl from '@/assets/image/navbar/icon_msg_danger.svg';
import iconMsgWarningUrl from '@/assets/image/navbar/icon_msg_warning.svg';
import iconMsgDeleteUrl from '@/assets/image/navbar/icon_msg_delete.svg';

const props = defineProps<{
  item: ProfileMessageItem;
}>();

const emit = defineEmits<{
  (e: 'delete', item: ProfileMessageItem): void;
}>();

const permissionStore = usePermissionStore();
const router = useRouter();

type MsgType = 'warning' | 'danger';
const type = computed<MsgType>(() => {
  const raw = props.item.level;
  return raw === 'danger' ? 'danger' : 'warning';
});

const taskStatusText = computed(() => {
  return type.value === 'danger' ? '任务已逾期' : '任务即将到期';
});

const iconSrc = computed(() => (type.value === 'danger' ? iconMsgDangerUrl : iconMsgWarningUrl));

const sourceDisplay = computed(() => {
  const fallback = { title: props.item.category || '', icon: '' as string | undefined };
  const key = props.item.sourceApp || props.item.category;
  if (props.item.category === '系统通知' || key === 'main') {
    return { title: '环保管理平台', icon: '' as string | undefined };
  }
  const resolved = permissionStore.getSubAppDisplayByKey(key);
  return resolved ? { ...resolved } : fallback;
});

const isSystemNotice = computed(() => {
  const key = props.item.sourceApp || '';
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

const pad2 = (n: number) => String(n).padStart(2, '0');

const footerTimeText = computed(() => {
  const d = parsePublishTime(props.item.publishTime);
  if (!d) return props.item.publishTime;

  const hm = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThatDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((startOfToday.getTime() - startOfThatDay.getTime()) / 86400000);

  if (diffDays <= 0) return `今天 ${hm}`;
  if (diffDays === 1) return `昨天 ${hm}`;
  return `${diffDays}天前 ${hm}`;
});

function goDetail() {
  router.push({
    path: '/profile/message/detail',
    query: { id: props.item.id }
  });
}

const handleDelete = () => {
  emit('delete', props.item);
};
</script>

<style scoped lang="scss">
.message-box {
  width: 100%;
  background: rgba(255, 255, 255, 1);
  border-radius: 8px;
  border-bottom: 1px solid rgba(232, 237, 243, 1);
  box-sizing: border-box;
  transition: all 0.25s;
  padding: 22px 27px 20px 20px;
  cursor: pointer;

  &:hover {
    background: #f7f9fe;
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

  .message-title-unread-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #f93260;
    flex: 0 0 auto;
    margin-right: 6px;
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
    text-align: left;
    font-style: normal;
  }

  /** 参考稿：即将到期标题用正文主色；已逾期标题用警示粉 */
  &.warning .message-title-text {
    color: #333333;
  }

  &.danger .message-title-text {
    color: rgba(249, 50, 96, 1);
  }

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
  }

  .message-footer {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .message-time {
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    font-size: 14px;
    color: #9da3ac;
    line-height: 20px;
    flex-shrink: 0;
  }

  .message-delete-btn {
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    position: absolute;
    right: 0;
    top: 0;
    opacity: 0.9;
  }

  .message-delete-img {
    width: 12px;
    height: 13.5px;
    display: block;
  }
}
</style>
