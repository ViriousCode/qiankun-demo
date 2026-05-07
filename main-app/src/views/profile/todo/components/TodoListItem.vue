<template>
  <div class="todo-list-item">
    <div class="todo-content">
      <div class="todo-meta">
        <div class="item-tag">
          <MenuIcon
            v-if="appDisplay.icon"
            class="todo-app-icon"
            :icon="appDisplay.icon"
            :width="10"
            :height="10"
          />
          <div v-else class="todo-icon"></div>
          <span class="todo-cat">{{ item.category }}</span>
        </div>
        <span class="todo-time">{{ item.createTime }}</span>
      </div>
      <p class="todo-desc" :title="item.desc">{{ item.desc }}</p>
    </div>
    <div class="item-right">
      <span class="item-deadline">截止: {{ item.deadline }}</span>
      <span v-if="isOverdue" class="overdue-tag">逾期</span>
      <el-avatar
        v-if="item.assigneeAvatar"
        class="item-avatar"
        :src="item.assigneeAvatar"
        :size="24"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import MenuIcon from '@/components/MenuIcon.vue';
  import { usePermissionStore } from '@/store/permission';
  import type { ProfileTodoItem } from '../constants';

  const props = defineProps<{
    item: ProfileTodoItem;
  }>();

  const permissionStore = usePermissionStore();
  const appDisplay = computed(() => {
    const resolved = permissionStore.getSubAppDisplayByKey(props.item.category);
    return resolved ? { ...resolved } : { title: props.item.category, icon: '' as string | undefined };
  });

  const isOverdue = computed(() => {
    if (props.item.status !== 'pending') return false;
    const deadline = props.item.deadline;
    if (!deadline) return false;
    const t = new Date(deadline.replace(/-/g, '/')).getTime();
    return !Number.isNaN(t) && Date.now() > t;
  });
</script>

<style scoped lang="scss">
  .todo-list-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #ffffff;
    box-sizing: border-box;
    cursor: pointer;
    transition: all 0.25s;
    background: rgba(241, 246, 255, 0.9);
    border: 1px solid #9bbcffcf;
    margin-bottom: 12px;

    &:hover {
      background: rgba(226, 236, 255, 0.9);
      box-shadow: 0px 2px 4px 0px rgba(157, 183, 255, 0.5);
      border-radius: 12px;
      border: 1px solid #5f94ff;
    }
  }

  .todo-content {
    min-width: 0;
    flex: 1;
  }

  .todo-meta {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 6px;

    .item-tag {
      height: 20px;
      padding: 0 9px;
      display: flex;
      align-items: center;
      background: #f5f9ff;

      .todo-app-icon {
        flex-shrink: 0;
      }

      .todo-icon {
        width: 10px;
        height: 10px;
        background: #009dff;
        flex-shrink: 0;
      }

      .todo-cat {
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        font-size: 12px;
        color: #666666;
        line-height: 17px;
        margin-left: 3px;
      }
    }

    .todo-time {
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #666666;
      line-height: 20px;
    }
  }

  .todo-desc {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 400;
    font-size: 17px;
    color: #333333;
    line-height: 24px;
  }

  .item-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    align-self: flex-start;
  }

  .overdue-tag {
    padding: 2px 8px;
    font-family:
      PingFangSC,
      PingFang SC;
    font-size: 12px;
    color: var(--el-color-danger);
    background: rgba(245, 34, 45, 0.1);
    border-radius: 4px;
    flex-shrink: 0;
  }

  .item-deadline {
    font-family:
      PingFangSC,
      PingFang SC;
    font-size: 12px;
    color: #666666;
  }

  .item-avatar {
    flex-shrink: 0;
  }
</style>
