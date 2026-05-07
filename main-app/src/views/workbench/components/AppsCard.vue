<template>
  <div class="card-apps">
    <div class="card-head">
      <span class="card-title">我的应用</span>
      <span class="btn-more" @click="$emit('moreClick')">更多应用 ></span>
    </div>

    <div class="app-grid">
      <AppItem
        v-for="item in apps"
        :key="item.id ?? item.title"
        :title="item.title"
        :icon-name="item.iconName"
        :target-type="item.targetType"
        @click="$emit('appClick', item)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { WorkbenchItem } from '@/api/workbench';

  defineProps<{
    apps: WorkbenchItem[];
  }>();

  defineEmits<{
    (e: 'appClick', item: WorkbenchItem): void;
    (e: 'moreClick'): void;
  }>();
</script>

<style scoped lang="scss">
  .card-apps {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 27px 24px 45px 24px;
    box-sizing: border-box;
    background: linear-gradient(180deg, #ecf3ff 0%, #f5f9ff 100%);
    box-shadow: 0px 0px 4px 0px rgba(166, 205, 255, 0.25);
    border-radius: 16px;
    border: 2px solid #ffffff;

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;

      .card-title {
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        font-size: 20px;
        color: #333333;
        line-height: 22px;
        text-align: left;
        font-style: normal;
      }

      .btn-more {
        &:hover {
          color: #1890ff;
        }

        cursor: pointer;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: #434961;
        line-height: 20px;
        text-align: left;
        font-style: normal;
      }
    }

    .app-grid {
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, 145px);
      justify-content: start;
      align-content: start;
      margin-top: 30px;
      gap: 24px 26px;
      padding: 0 32px;
    }
  }
</style>
