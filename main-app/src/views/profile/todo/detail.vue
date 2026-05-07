<template>
  <div class="page-container" v-loading="loading">
    <h2 class="page-title">待办详情</h2>

    <div class="page-card profile-todo-detail-card">
      <div class="detail-header">
        <el-button type="primary" plain class="back-btn" @click="router.push('/profile/todo')">
          返回待办列表
        </el-button>
      </div>

      <template v-if="item">
        <h3 class="detail-title">{{ displayTitle }}</h3>
        <div class="detail-meta">
          <div class="app-tag">
            <MenuIcon
              v-if="sourceDisplay.icon"
              class="app-tag-icon"
              :icon="sourceDisplay.icon"
              :width="12"
              :height="12"
            />
            <span v-else class="app-tag-dot" />
            <span class="app-tag-text">{{ sourceDisplay.title }}</span>
          </div>
        </div>
        <div class="detail-times">
          <span class="time-item">创建时间: {{ item.createTime }}</span>
          <span class="time-item">
            截止时间: {{ item.deadline }}
            <StatusTag
              v-if="isOverdue"
              class="overdue-tag"
              status-key="OVERDUE"
              source="workflow"
              variant="outline"
              tag-size="small"
              hide-icon
              bordered
            />
          </span>
        </div>
        <div class="detail-desc">{{ displayDesc }}</div>
        <el-button v-if="item.status === 'pending'" type="primary" class="action-btn" @click="handleProcess">
          去处理
        </el-button>
      </template>
      <div v-else class="empty-tip">未找到该待办</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MenuIcon from '@/components/MenuIcon.vue';
import { usePermissionStore } from '@/store/permission';
import StatusTag from '@/components/StatusTag.vue';
import { useTodoDetail } from './useTodoDetail';
import { processTodo } from '@/api/todo';

const route = useRoute();
const router = useRouter();
const todoId = computed(() => {
  const value = route.query.id;
  return Array.isArray(value) ? (value[0] ?? '') : String(value ?? '');
});

const { item, loading, isOverdue, displayTitle, displayDesc } = useTodoDetail(todoId);

const permissionStore = usePermissionStore();
const sourceDisplay = computed(() => {
  const it = item.value;
  const key = String(it?.appKey || '').trim() || String(it?.category || '').trim();
  if (!key || key === 'main') {
    return { title: '环保管理平台', icon: '' as string | undefined };
  }
  const resolved = permissionStore.getSubAppDisplayByKey(key);
  return resolved ? { ...resolved } : { title: key, icon: '' as string | undefined };
});

async function handleProcess() {
  if (!item.value?.id) return;
  try {
    await processTodo(item.value.id);
    router.push('/profile/todo');
  } catch {
    router.push('/profile/todo');
  }
}
</script>

<style scoped lang="scss">
.profile-todo-detail-card {
  overflow: auto;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.detail-title {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.detail-meta {
  border-radius: 4px;
  margin-bottom: 12px;
}

  .app-tag {
    height: 20px;
    padding: 0 9px;
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    background: #f5f9ff;
    border-radius: 4px;
    gap: 6px;
  }

  .app-tag-icon {
    flex-shrink: 0;
  }

  .app-tag-dot {
    width: 10px;
    height: 10px;
    background: #009dff;
    flex-shrink: 0;
    border-radius: 2px;
  }

  .app-tag-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    font-size: 12px;
    color: #666666;
    line-height: 17px;
  }

.detail-times {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #666;
}

.time-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.overdue-tag {
  margin-left: 8px;
}

.detail-desc {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 24px;
  white-space: pre-wrap;
}

.action-btn {
  margin-top: 8px;
  align-self: flex-end;
}

.empty-tip {
  padding: 40px;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
</style>
