<template>
  <div
    class="app-item"
    :class="{
      'is-clickable': clickable,
      'is-disabled': !clickable
    }"
    @click="onClick"
  >
    <div class="app-icon" :class="targetType">
      <AzuraIcon
        v-if="iconName"
        :width="48"
        :height="48"
        class="app-icon-symbol"
        :icon="iconName"
        :url-icon-base-url="MENU_URL_ICON_BASE_URL"
      />
      <div v-else class="app-icon-fallback" />
    </div>
    <span class="app-name">{{ title }}</span>
  </div>
</template>

<script setup lang="ts">
  import { AzuraIcon } from '@npm/azura-icon';
  import { MENU_URL_ICON_BASE_URL } from '@/config';

  const props = withDefaults(
    defineProps<{
      title: string;
      iconName?: string;
      targetType?: 'internal' | 'external';
      clickable?: boolean;
    }>(),
    {
      iconName: '',
      targetType: 'internal',
      clickable: true
    }
  );

  const emit = defineEmits<{
    (e: 'click'): void;
  }>();

  const onClick = () => {
    if (!props.clickable) return;
    emit('click');
  };
</script>

<style scoped lang="scss">
  .app-item {
    width: 145px;
    height: 98px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    transition:
      background 0.2s,
      box-shadow 0.2s,
      border-color 0.2s;
    border: 1px solid transparent;

    &.is-clickable {
      cursor: pointer;

      &:hover {
        background: rgba(226, 236, 255, 0.9);
        box-shadow: 0px 2px 4px 0px rgba(157, 183, 255, 0.5);
        border-color: #5f94ff;
      }
    }

    &.is-disabled {
      cursor: default;
    }

    .app-icon {
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;

      .app-icon-symbol {
        width: 48px;
        height: 48px;
        display: inline-flex;
        align-items: center;
        justify-content: center;

        :deep(.azura-icon),
        :deep(.azura-icon--url) {
          width: 48px !important;
          height: 48px !important;
          margin-right: 0 !important;
        }

        :deep(.azura-icon__img) {
          width: 100%;
          height: 100%;
        }
      }

      .app-icon-fallback {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: rgba(24, 144, 255, 0.08);
      }
    }

    .app-name {
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 500;
      font-size: 14px;
      color: #666666;
      line-height: 20px;
      text-align: right;
      font-style: normal;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }
  }
</style>
