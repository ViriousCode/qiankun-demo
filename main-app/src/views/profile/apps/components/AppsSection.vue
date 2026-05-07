<template>
  <section class="apps-section">
    <div class="section-head">
      <div class="section-title-wrap">
        <div class="section-title">{{ title }}</div>
        <el-tooltip placement="top" trigger="hover">
          <template #content>
            <span class="hint-content">{{ hintContent }}</span>
          </template>
          <div class="hint-icon info-icon" />
        </el-tooltip>
      </div>
      <div class="section-head-right">
        <slot name="head-action" />
      </div>
    </div>
    <Draggable
      v-if="sectionType === 'my' && editMode"
      v-model="draggableApps"
      item-key="id"
      class="app-grid"
      :animation="150"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <div class="click-wrapper click-wrapper--my" @click="onMyClick(element)">
          <AppItem
            class="app-item"
            :title="element.title"
            :icon-name="element.iconName"
            :target-type="element.targetType"
            :clickable="false"
          />
          <span class="remove-icon" aria-hidden="true">
            <el-icon>
              <Remove />
            </el-icon>
          </span>
        </div>
      </template>
    </Draggable>
    <div
      v-else
      class="app-grid"
      :class="{
        'is-edit-my': editMode && sectionType === 'my',
        'is-edit-all': editMode && sectionType === 'all'
      }"
    >
      <template v-if="sectionType === 'all' && editMode">
        <div
          v-for="item in apps"
          :key="getKey(item)"
          class="click-wrapper click-wrapper--all"
          @click="$emit('appClick', item)"
        >
          <AppItem
            class="app-item"
            :title="item.title"
            :icon-name="item.iconName"
            :target-type="item.targetType"
            :clickable="false"
          />
          <span v-if="isAdded(item)" class="added-tag">已添加</span>
          <span class="add-icon" aria-hidden="true">
            <el-icon>
              <Plus />
            </el-icon>
          </span>
        </div>
      </template>
      <template v-else-if="sectionType === 'all'">
        <div
          v-for="item in apps"
          :key="getKey(item)"
          class="item-wrapper"
          @click="$emit('appClick', item)"
        >
          <AppItem
            class="app-item"
            :title="item.title"
            :icon-name="item.iconName"
            :target-type="item.targetType"
          />
          <span v-if="isAdded(item)" class="added-tag">已添加</span>
        </div>
      </template>
      <template v-else>
        <AppItem
          v-for="item in apps"
          :key="getKey(item)"
          class="app-item"
          :title="item.title"
          :icon-name="item.iconName"
          :target-type="item.targetType"
          @click="$emit('appClick', item)"
        />
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { Remove, Plus } from '@element-plus/icons-vue';
  import type { WorkbenchItem } from '@/api/workbench';
  import Draggable from 'vuedraggable';

  const props = withDefaults(
    defineProps<{
      title: string;
      apps: WorkbenchItem[];
      editMode?: boolean;
      sectionType?: 'my' | 'all';
      /** 已添加到「我的应用」的 key 列表，用于「所有应用」显示「已添加」标签 */
      addedKeys?: string[];
    }>(),
    { editMode: false, sectionType: 'all', addedKeys: () => [] }
  );

  function isAdded(item: WorkbenchItem): boolean {
    return props.addedKeys.includes(getKey(item));
  }

  const hintContent = computed(() => {
    if (props.sectionType === 'my') {
      return '编辑模式下点击下方应用可移出工作台展示';
    }
    return '编辑模式下点击下方应用可加入工作台展示';
  });

  const emit = defineEmits<{
    (e: 'appClick', item: WorkbenchItem): void;
    (e: 'reorderMy', apps: WorkbenchItem[]): void;
  }>();

  const draggableApps = computed({
    get: () => props.apps,
    set: (next) => {
      emit('reorderMy', next);
    }
  });

  const dragging = ref(false);
  function onDragStart() {
    dragging.value = true;
  }
  function onDragEnd() {
    // 避免拖拽结束抬手触发 click（不同浏览器存在差异）
    window.setTimeout(() => {
      dragging.value = false;
    }, 0);
  }

  function onMyClick(item: WorkbenchItem) {
    if (dragging.value) return;
    emit('appClick', item);
  }

  function getKey(item: WorkbenchItem): string {
    return item.id != null ? String(item.id) : item.title;
  }
</script>

<style scoped lang="scss">
  .apps-section {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 20px;
    border-bottom: 1px solid #e5e5e5;
    padding-bottom: 15px;

    .section-title-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .section-title {
      font-weight: 500;
      font-size: 18px;
      color: #333;
    }

    .section-head-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hint-icon {
      font-size: 16px;
      color: var(--el-text-color-secondary);
      cursor: pointer;
    }

    .section-icon {
      font-size: 16px;
      color: var(--el-text-color-secondary);
      cursor: default;
    }
  }

  .hint-content {
    white-space: pre-line;
  }

  .app-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 145px);
    justify-content: start;
    gap: 24px 26px;
  }

  .app-item {
    border: 1px solid #e5e5e5;
  }

  .click-wrapper {
    cursor: pointer;
    position: relative;
    outline: none;

    .edit-hint {
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      color: var(--el-color-primary);
      white-space: nowrap;
    }
  }

  .click-wrapper--my {
    .remove-icon {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 1;
      opacity: 0;
      transition: opacity 0.2s;

      :deep(.el-icon) {
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    &:hover {
      .remove-icon {
        opacity: 1;
      }

      :deep(.app-item) {
        filter: grayscale(1);
        opacity: 0.9;
        background: #e8e8e8 !important;
      }
    }
  }

  .click-wrapper--all {
    .add-icon {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 1;
      opacity: 0;
      transition: opacity 0.2s;

      :deep(.el-icon) {
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    &:hover {
      .add-icon {
        opacity: 1;
      }

      :deep(.app-item) {
        filter: grayscale(1);
        opacity: 0.9;
        background: #e8e8e8 !important;
      }
    }
  }

  .item-wrapper {
    position: relative;
    cursor: pointer;
  }

  .added-tag {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    line-height: 1.4;
    background: rgba(24, 144, 255, 0.15);
    color: #1890ff;
    z-index: 1;
  }
</style>
