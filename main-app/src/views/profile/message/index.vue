<template>
  <div class="page-container" v-loading="loading">
    <h2 class="page-title">我的消息</h2>

    <div class="page-card">
      <el-form :model="{}" class="message-filters" @submit.prevent>
        <el-row :gutter="20">
          <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
            <el-form-item label="来源应用">
              <el-select v-model="sourceAppKey" placeholder="全部应用" clearable style="width: 100%">
                <el-option v-for="opt in appOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="18" :xs="24" :sm="12" :md="16" :lg="18" :xl="18" class="query-btns">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
      <div class="message-tabs-container">
        <el-tabs v-model="activeTab" class="message-tabs" @tab-change="handleTabChange">
          <el-tab-pane name="unread">
            <template #label>
              <span>未读消息 ({{ unreadCount }})</span>
            </template>
            <div class="message-content">
              <div v-for="group in groupedUnreadList" :key="group.dateKey" class="message-day-group">
                <div class="message-day-header">
                  <div class="message-day-toggle" @click="toggleDateFold(group.dateKey)">
                    <span class="fold-indicator">{{ foldedDateKeys.has(group.dateKey) ? '▸' : '▾' }}</span>
                    <span class="message-day-label">{{ group.label }}</span>
                    <span class="message-day-count">({{ group.items.length }})</span>
                  </div>
                  <el-button type="default" class="mark-day-read-btn" :loading="markingDateKeys.has(group.dateKey)"
                    @click.stop="handleMarkDayRead(group.dateKey, group.items)">
                    <img class="mark-day-read-icon" :src="iconReadUrl" alt="" />
                    全部已读
                  </el-button>
                </div>
                <div v-for="item in group.items" :key="item.id" class="message-item-clickable"
                  v-show="!foldedDateKeys.has(group.dateKey)" @click="goDetail(item.id)">
                  <MessageListItem :item="item" @delete="handleDelete" />
                </div>
              </div>
              <div v-if="list.length === 0" class="empty-tip">暂无未读消息</div>
            </div>
          </el-tab-pane>
          <el-tab-pane name="read">
            <template #label>
              <span>已读消息 ({{ readCount }})</span>
            </template>
            <div class="message-content">
              <div v-for="item in list" :key="item.id" class="message-item-clickable" @click="goDetail(item.id)">
                <MessageListItem :item="item" @delete="handleDelete" />
              </div>
              <div v-if="list.length === 0" class="empty-tip">暂无已读消息</div>
            </div>
          </el-tab-pane>
        </el-tabs>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { deleteMessage, markMessageRead } from '@/api/message';
import MessageListItem from './components/MessageListItem.vue';
import { useMessageList } from './useMessageList';
import type { ProfileMessageItem } from './constants';
import { computed, ref } from 'vue';
import { usePermissionStore } from '@/store/permission';
import { useMessageUnreadCount } from './useMessageUnreadCount';
import iconReadUrl from '@/assets/image/common/icon_yidu.svg';
import { confirmInAppMain } from '@/utils/messageBox';

const router = useRouter();
const {
  loading,
  activeTab,
  sourceAppKey,
  unreadCount,
  readCount,
  list,
  fetchData,
  handleTabChange
} = useMessageList();

const permissionStore = usePermissionStore();
const { refreshUnreadCount } = useMessageUnreadCount();
const markingDateKeys = ref(new Set<string>());
const foldedDateKeys = ref(new Set<string>());

function parsePublishDate(raw: string) {
  const normalized = String(raw || '').trim().replace(/-/g, '/');
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateLabel(dateKey: string) {
  const now = new Date();
  const today = formatDateKey(now);
  const yesterdayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterday = formatDateKey(yesterdayDate);
  if (dateKey === today) return '今天';
  if (dateKey === yesterday) return '昨天';
  return dateKey;
}

const groupedUnreadList = computed(() => {
  if (activeTab.value !== 'unread') return [];
  const map = new Map<string, ProfileMessageItem[]>();
  list.value.forEach((item) => {
    const d = parsePublishDate(item.publishTime);
    const key = d ? formatDateKey(d) : '未知日期';
    const arr = map.get(key) || [];
    arr.push(item);
    map.set(key, arr);
  });
  return Array.from(map.entries()).map(([dateKey, items]) => ({
    dateKey,
    label: formatDateLabel(dateKey),
    items
  }));
});
const appOptions = computed(() => {
  const options = [
    { value: '', label: '全部应用' },
    { value: 'main', label: '环保管理平台' }
  ];
  const apps = (permissionStore.microApps || []) as any[];
  apps.forEach((a) => {
    if (!a?.name) return;
    options.push({ value: a.name, label: a.shortName || a.name });
  });
  const uniq = new Map<string, string>();
  options.forEach((o) => {
    if (!uniq.has(o.value)) uniq.set(o.value, o.label);
  });
  return Array.from(uniq.entries()).map(([value, label]) => ({ value, label }));
});

function handleSearch() {
  fetchData();
}

function resetQuery() {
  sourceAppKey.value = '';
  fetchData();
}

function goDetail(id: string) {
  router.push({
    path: '/profile/message/detail',
    query: {
      id
    }
  });
}

async function handleMarkDayRead(dateKey: string, items: ProfileMessageItem[]) {
  if (!items.length) return;
  const next = new Set(markingDateKeys.value);
  next.add(dateKey);
  markingDateKeys.value = next;
  try {
    await Promise.allSettled(items.map((item) => markMessageRead(item.id)));
    ElMessage.success('该天消息已全部标记为已读');
    await fetchData();
    await refreshUnreadCount();
  } finally {
    const done = new Set(markingDateKeys.value);
    done.delete(dateKey);
    markingDateKeys.value = done;
  }
}

function toggleDateFold(dateKey: string) {
  const next = new Set(foldedDateKeys.value);
  if (next.has(dateKey)) next.delete(dateKey);
  else next.add(dateKey);
  foldedDateKeys.value = next;
}

function handleDelete(item: ProfileMessageItem) {
  confirmInAppMain('确定删除该消息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await deleteMessage(item.id);
      ElMessage.success('删除成功');
      await fetchData();
      await refreshUnreadCount();
    })
    .catch(() => undefined);
}
</script>

<style scoped lang="scss">
.page-container {
  height: calc(100vh - 66px);
  min-height: calc(100vh - 66px);
  display: flex;
  flex-direction: column;
}

.message-filters {
  background: #F6F7FB;
  border-radius: 4px;
  width: 100%;
  padding: 20px 32px 20px 24px;
  margin-top: 5px;
  margin-bottom: 20px;
  flex: 0 0 auto;

  .el-form-item--default {
    margin-bottom: 0;
  }
}

.message-tabs-container {
  flex: 1;
  min-height: 0;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #E9E9EB;
  padding: 24px 32px 24px 32px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.message-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.message-tabs :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
}

.message-tabs :deep(.el-tab-pane) {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.message-content {
  flex: 1;
  margin-top: 6px;
  min-height: 200px;
  max-height: none;
  overflow: auto;
  padding-right: 4px;
  padding-bottom: 14px;
}

.message-item-clickable {
  cursor: pointer;
}

.message-day-group+.message-day-group {
  margin-top: 8px;
}

.message-day-header {
  height: 41px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F5F7FA;
  padding: 0 20px 0 12px;
}

.message-day-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.fold-indicator {
  width: 10px;
  color: #909399;
  font-size: 12px;
}

.message-day-label {
  font-size: 12px;
  color: #909399;
  line-height: 18px;
}

.message-day-count {
  font-size: 12px;
  color: #c0c4cc;
}

.mark-day-read-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.mark-day-read-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  display: block;
  margin-right: 6px;
}

.empty-tip {
  padding: 40px;
  text-align: center;
  font-size: 14px;
  color: #666666;
}
</style>
