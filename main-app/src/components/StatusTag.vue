<script setup lang="ts">
  import { computed } from 'vue';
  import type { StatusTagMeta, StatusTagType } from '@/constants/workflowStatus';
  import { getWorkflowStatusMeta } from '@/constants/workflowStatus';
  import {
    getAccountStatusMeta,
    getMenuVisibleMeta,
    getSecurityStatusMeta,
    getTodoCategoryMeta
  } from '@/constants/commonStatus';

  const props = withDefaults(
    defineProps<{
      statusKey: string | number;
      /** 描边 ≈ 设计「状态集合」；实心 ≈ 「状态集合2」 */
      variant?: 'outline' | 'solid';
      /** workflow：流程六态；account：启用/禁用（1/0） */
      source?: 'workflow' | 'account' | 'menuVisible' | 'security' | 'todoCategory';
      /** 自定义文案（不传则使用内置 label） */
      labelOverride?: string;
      /** 是否隐藏图标 */
      hideIcon?: boolean;
      /** 是否显示描边（仅 outline 有效） */
      bordered?: boolean;
      /** 标签形状：胶囊 / 矩形 */
      shape?: 'pill' | 'rect';
      /** 透传 el-tag size */
      tagSize?: 'large' | 'default' | 'small';
      /** 图标尺寸（px） */
      iconSize?: number;
    }>(),
    {
      variant: 'outline',
      source: 'workflow',
      tagSize: 'default',
      hideIcon: false,
      bordered: false,
      shape: 'pill'
    }
  );

  const resolved = computed<StatusTagMeta>(() => {
    const key = String(props.statusKey);
    if (props.source === 'todoCategory') {
      return getTodoCategoryMeta();
    }
    if (props.source === 'menuVisible') {
      const m = getMenuVisibleMeta(key);
      if (m) return m;
      return {
        label: key || '未知',
        tagType: 'info' as StatusTagType
      };
    }

    if (props.source === 'security') {
      const s = getSecurityStatusMeta(key);
      if (s) return s;
      return {
        label: key || '未知',
        tagType: 'info' as StatusTagType
      };
    }

    if (props.source === 'account') {
      const a = getAccountStatusMeta(key);
      if (a) return a;
    } else {
      const w = getWorkflowStatusMeta(key);
      if (w) return w;
      // 兜底：所有启用/禁用（0/1）统一用同一套样式
      const a = getAccountStatusMeta(key);
      if (a) return a;
    }
    return {
      label: key || '未知',
      tagType: 'info' as StatusTagType
    };
  });

  const labelText = computed(() => {
    const override = String(props.labelOverride ?? '').trim();
    return override || resolved.value.label;
  });

  const tagEffect = computed(() => (props.variant === 'outline' ? 'plain' : 'dark'));

  const iconSrc = computed(() => {
    const icon = resolved.value.icon;
    if (!icon) return '';
    return props.variant === 'outline' ? icon.outline : icon.solid;
  });

  const iconStyle = computed(() => {
    const fromProps = props.iconSize;
    const fromMeta = resolved.value.iconSize;
    const size = Number(fromProps ?? fromMeta ?? 9.6);
    const resolvedSize = Number.isFinite(size) && size > 0 ? size : 9.6;
    return { width: `${resolvedSize}px`, height: `${resolvedSize}px` };
  });

  const tagStyle = computed(() => {
    const style: Record<string, string> = {};

    if (props.variant === 'outline') {
      const bg = resolved.value.outlineBg;
      if (bg) {
        style.backgroundColor = bg;
        style.border = 'none';
      }
    }

    if (props.bordered && props.variant === 'outline') {
      const type = resolved.value.tagType;
      const colorVar =
        type === 'danger'
          ? 'var(--el-color-danger)'
          : type === 'warning'
            ? 'var(--el-color-warning)'
            : type === 'success'
              ? 'var(--el-color-success)'
              : type === 'primary'
                ? 'var(--el-color-primary)'
                : 'var(--el-color-info)';
      style.border = `1px solid ${colorVar}`;
      // 保留 outlineBg 的浅色背景（若无则退回白色）
      if (!style.backgroundColor) style.backgroundColor = '#ffffff';
    }

    const extra = resolved.value.style;
    if (extra) {
      if (extra.width) style.width = extra.width;
      if (extra.height) style.height = extra.height;
      if (extra.borderRadius) style.borderRadius = extra.borderRadius;
      if (extra.background) style.background = extra.background;
      if (extra.border) style.border = extra.border;
      if (extra.padding) style.padding = extra.padding;
    }

    return Object.keys(style).length ? style : undefined;
  });
</script>

<template>
  <el-tag
    class="status-tag"
    :class="{
      'status-tag--bordered': bordered && variant === 'outline',
      'status-tag--rect': shape === 'rect'
    }"
    :type="resolved.tagType"
    :effect="tagEffect"
    :size="tagSize"
    :style="tagStyle"
  >
    <span class="status-tag__inner">
      <img v-if="iconSrc && !hideIcon" class="status-tag__img" :src="iconSrc" :style="iconStyle" alt="" />
      <span class="status-tag__label">{{ labelText }}</span>
    </span>
  </el-tag>
</template>

<style scoped lang="scss">
  .status-tag {
    :deep(.el-tag) {
      height: 20px;
      padding: 0 8px;
      border-radius: 11px;
      display: inline-flex;
      align-items: center;
    }

    :deep(.el-tag--plain) {
      border: none;
    }
  }

  .status-tag--bordered {
    :deep(.el-tag--plain) {
      border: 1px solid var(--el-tag-border-color);
    }
  }

  .status-tag--rect {
    :deep(.el-tag) {
      border-radius: 4px;
      padding: 0 8px;
    }
  }

  .status-tag__inner {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    vertical-align: middle;
    justify-content: center;
    width: 100%;
  }

  .status-tag__img {
    flex: 0 0 auto;
    display: inline-block;
  }

  .status-tag__label {
    line-height: 1;
  }
</style>
