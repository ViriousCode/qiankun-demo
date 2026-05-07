<template>
  <div class="page-container" v-loading="loading">
    <h2 class="page-title">消息详情</h2>

    <div class="page-card profile-message-detail-card">
      <div class="detail-header">
        <el-button type="primary" plain class="back-btn" @click="router.push('/profile/message')">
          返回消息列表
        </el-button>
      </div>

      <template v-if="item">
        <h3 class="detail-title">
          <MessageRichSummary :summary="item.summary" :level="item.level" />
        </h3>
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
        <div class="detail-desc">{{ displayDesc }}</div>
      </template>
      <div v-else class="empty-tip">未找到该消息</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import MenuIcon from '@/components/MenuIcon.vue';
  import { usePermissionStore } from '@/store/permission';
  import { useMessageDetail } from './useMessageDetail';
  import MessageRichSummary from './components/MessageRichSummary.vue';

  const route = useRoute();
  const router = useRouter();
  const messageId = computed(() => {
    const value = route.query.id;
    return Array.isArray(value) ? (value[0] ?? '') : String(value ?? '');
  });

  const { item, loading, displayDesc } = useMessageDetail(messageId);

  const permissionStore = usePermissionStore();
  const sourceDisplay = computed(() => {
    const it = item.value;
    const key = String(it?.sourceApp || '').trim() || String(it?.category || '').trim();
    if (!key || key === 'main' || it?.category === '系统通知') {
      return { title: '环保管理平台', icon: '' as string | undefined };
    }
    const resolved = permissionStore.getSubAppDisplayByKey(key);
    return resolved ? { ...resolved } : { title: it?.category || key, icon: '' as string | undefined };
  });
</script>

<style scoped lang="scss">
  .profile-message-detail-card {
    overflow: auto;
  }

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 16px;
  }

  .detail-title {
    margin: 0 0 16px;
    font-size: 20px;
    font-weight: 600;
    color: #333333;
  }

  .detail-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
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

  .detail-desc {
    font-size: 14px;
    color: #333333;
    line-height: 1.7;
    white-space: pre-wrap;
  }

  .empty-tip {
    padding: 40px;
    text-align: center;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
</style>
