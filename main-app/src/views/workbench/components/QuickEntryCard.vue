<template>
  <div class="card-quick">
    <div class="card-head">
      <span class="card-title">快速入口</span>
      <span v-if="showConfig" class="btn-config" @click="$emit('configClick')">入口配置 ></span>
    </div>

    <div v-if="entries.length > 0" class="quick-grid">
      <div
        v-for="(entry, i) in entries"
        :key="entry.key ?? i"
        :class="['quick-item', { disabled: entry.disabled }]"
        :title="entry.name"
        @click="$emit('entryClick', entry)"
      >
        <div class="quick-icon"></div>
        <span class="quick-name">{{ entry.name }}</span>
      </div>
    </div>

    <div v-else class="quick-empty">暂无入口</div>
  </div>
</template>

<script setup lang="ts">
  export interface QuickEntry {
    key?: string | number;
    name: string;
    url?: string;
    iconUrl?: string;
    disabled?: boolean;
  }

  withDefaults(
    defineProps<{
      entries: QuickEntry[];
      showConfig?: boolean;
    }>(),
    {
      showConfig: true
    }
  );

  defineEmits<{
    (e: 'configClick'): void;
    (e: 'entryClick', entry: QuickEntry): void;
  }>();
</script>

<style scoped lang="scss">
  .card-quick {
    background: linear-gradient(180deg, #ecf3ff 0%, #f5f9ff 100%);
    box-shadow: 0px 0px 4px 0px rgba(166, 205, 255, 0.25);
    border-radius: 16px;
    border: 2px solid #ffffff;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 26px 24px 35px 24px;
    box-sizing: border-box;
    overflow: hidden;

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

      .btn-config {
        cursor: pointer;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: #434961;
        line-height: 20px;

        &:hover {
          color: #1890ff;
        }
      }
    }

    .quick-grid {
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

      margin-top: 28px;
      flex: 1;
      min-height: 0;
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      gap: 12px 21px;
      min-width: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding-right: 6px;
    }

    .quick-item {
      flex: 1 1 calc(50% - 10.5px);
      min-width: 220px;
      max-width: calc(50% - 10.5px);
      height: 68px;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #ffffff;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.25s;
      overflow: hidden;
      padding: 0 30px 0 59px;

      &:hover:not(:disabled) {
        background: rgba(226, 236, 255, 0.9);
        box-shadow: 0px 2px 4px 0px rgba(157, 183, 255, 0.5);
        border-radius: 12px;
        border: 1px solid #5f94ff;
      }

      &.disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .quick-icon {
        width: 36px;
        height: 36px;
        background: rgb(95, 148, 255);
        flex-shrink: 0;
        margin-right: 14px;
      }

      .quick-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        font-size: 16px;
        color: #333333;
        line-height: 22px;
        font-style: normal;
      }
    }

    .quick-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(67, 73, 97, 0.65);
      font-size: 14px;
    }
  }
</style>
