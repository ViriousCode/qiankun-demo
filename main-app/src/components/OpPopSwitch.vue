<script setup lang="ts">
  import { computed } from 'vue';
  import { WarningFilled } from '@element-plus/icons-vue';

  const props = withDefaults(
    defineProps<{
      modelValue: boolean;
      title: string;
      width?: string | number;
      confirmButtonText?: string;
      cancelButtonText?: string;
      loading?: boolean;
      showStatusText?: boolean;
      activeText?: string;
      inactiveText?: string;
      /** el-switch 宽度（开启 inline-prompt 时建议 >= 50） */
      switchWidth?: number;
    }>(),
    {
      width: 220,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      loading: false,
      showStatusText: true,
      activeText: '启用',
      inactiveText: '禁用',
      switchWidth: undefined
    }
  );

  const emit = defineEmits<{ confirm: [] }>();

  const resolvedSwitchWidth = computed(() => {
    if (!props.showStatusText) return undefined;
    if (typeof props.switchWidth === 'number' && Number.isFinite(props.switchWidth))
      return props.switchWidth;
    const a = String(props.activeText || '');
    const b = String(props.inactiveText || '');
    const maxLen = Math.max(a.length, b.length);
    // 粗略估算：中文 2 字场景给到 ~54px；更长文案稍微放大一点
    return Math.min(90, Math.max(54, 40 + maxLen * 8));
  });
</script>

<template>
  <el-popconfirm
    :title="title"
    :width="width"
    :confirm-button-text="confirmButtonText"
    :cancel-button-text="cancelButtonText"
    :icon="WarningFilled"
    icon-color="#E6A23C"
    confirm-button-type="primary"
    @confirm="emit('confirm')"
  >
    <template #reference>
      <span class="op-pop-switch">
        <el-switch
          :model-value="modelValue"
          :loading="loading"
          :inline-prompt="showStatusText"
          :active-text="activeText"
          :inactive-text="inactiveText"
          :width="resolvedSwitchWidth"
        />
        <span class="op-pop-switch__hit" aria-hidden="true" />
      </span>
    </template>
  </el-popconfirm>
</template>

<style scoped>
  .op-pop-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
  }

  .op-pop-switch__hit {
    position: absolute;
    inset: 0;
    z-index: 1;
    cursor: pointer;
  }
</style>
