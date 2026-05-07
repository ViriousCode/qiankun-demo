<template>
  <div class="card-todo">
    <div class="card-head">
      <div class="card-tabs">
        <div :class="['tab', { active: modelValue === 'pending' }]" @click="onUpdate('pending')">
          待办事项 ({{ pendingCount }})
        </div>
        <div :class="['tab', { active: modelValue === 'done' }]" @click="onUpdate('done')">
          已办事项 ({{ doneCount }})
        </div>
      </div>
    </div>

    <div class="todo-grid">
      <div v-for="(item, i) in todoList" :key="i" class="todo-item" @click="$emit('itemClick', item)">
        <div class="todo-content">
          <div class="todo-meta">
            <div class="item-tag">
              <MenuIcon v-if="todoAppIcon(item)" class="todo-app-icon" :icon="todoAppIcon(item)!" :width="14"
                :height="14" />
              <div v-else class="todo-icon"></div>
              <span class="todo-cat">{{ item.category }}</span>
            </div>
            <span class="todo-time">{{ item.time }}</span>
          </div>
          <p class="todo-desc" :title="item.desc">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MenuIcon from '@/components/MenuIcon.vue';
import { usePermissionStore } from '@/store/permission';
export type TabKey = 'pending' | 'done';

export interface TodoItemData {
  category: string;
  time: string;
  desc: string;
  sourceApp?: string;
}

defineProps<{
  pendingCount: number;
  doneCount: number;
  todoList: TodoItemData[];
  modelValue: TabKey;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: TabKey): void;
  (e: 'itemClick', item: TodoItemData): void;
}>();

const permissionStore = usePermissionStore();
const todoAppIcon = (item: TodoItemData): string | undefined => {
  const key = item.sourceApp || item.category;
  const display = permissionStore.getSubAppDisplayByKey(key);
  return display?.icon;
};

const onUpdate = (v: TabKey) => {
  emit('update:modelValue', v);
};
</script>

<style scoped lang="scss">
.card-todo {
  background: linear-gradient(180deg, #ecf3ff 0%, #f5f9ff 100%);
  box-shadow: 0px 0px 4px 0px rgba(166, 205, 255, 0.25);
  border-radius: 16px;
  border: 2px solid #ffffff;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 26px 24px 30px 24px;
  box-sizing: border-box;
  overflow: hidden;

  .card-head {
    flex-shrink: 0;

    .card-tabs {
      display: flex;
      gap: 0 28px;

      .tab {
        cursor: pointer;
        transition: color 0.2s;
        position: relative;
        font-family:
          PingFangSC,
          PingFang SC;
        color: #333333;
        line-height: 22px;
        text-align: left;
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        margin-top: auto;

        &.active {
          font-weight: 500;
          font-size: 20px;
        }

        &.active::before {
          content: '';
          position: absolute;
          top: calc(100% + 7px);
          left: 50%;
          transform: translateX(-50%);
          width: 48px;
          height: 4px;
          background: linear-gradient(270deg, #009dff 0%, #006cff 100%);
          box-shadow: 0px 2px 20px 0px rgba(0, 62, 134, 0.2);
          border-radius: 8px;
        }

        &:hover:not(.active) {
          color: #1890ff;
        }
      }
    }
  }

  .todo-grid {
    margin-top: 25px;
    padding-right: 6px;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    min-width: 0;
    overflow-y: auto;
    overflow-x: hidden;
    gap: 12px 19px;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      display: none;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(152, 180, 230, 0.85);
      border-radius: 999px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(120, 155, 220, 0.95);
    }

    .todo-item {
      flex: 1 1 calc(50% - 10.5px);
      min-width: 307px;
      max-width: calc(50% - 10.5px);
      max-height: 68px;
      box-sizing: border-box;
      padding: 12px 16px;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #ffffff;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      cursor: pointer;
      transition: all 0.25s;
      box-sizing: border-box;

      .todo-content {
        min-width: 0;
      }

      &:hover {
        background: rgba(226, 236, 255, 0.9);
        box-shadow: 0px 2px 4px 0px rgba(157, 183, 255, 0.5);
        border-radius: 12px;
        border: 1px solid #5f94ff;
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
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
        }

        .todo-cat {
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 500;
          font-size: 12px;
          color: #666666;
          line-height: 17px;
          text-align: left;
          font-style: normal;
          margin-left: 3px;
        }

        .todo-time {
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: #666666;
          line-height: 20px;
          text-align: left;
          font-style: normal;
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
        text-align: left;
        font-style: normal;
      }
    }
  }
}
</style>
