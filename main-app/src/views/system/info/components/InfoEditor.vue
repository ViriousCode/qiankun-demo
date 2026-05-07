<template>
  <div ref="wrapperRef" class="editor-wrapper">
    <Toolbar
      class="editor-toolbar"
      :editor="editorRef"
      :default-config="toolbarConfig"
      mode="default"
    />
    <Editor
      v-model="htmlValue"
      class="editor-content"
      :default-config="editorConfig"
      mode="default"
      @on-created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
  import '@wangeditor/editor/dist/css/style.css';
  import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue';
  import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
  import type { IDomEditor } from '@wangeditor/editor';

  const props = defineProps<{
    modelValue: string;
    placeholder?: string;
  }>();

  const emit = defineEmits<{
    (event: 'update:modelValue', value: string): void;
  }>();

  const wrapperRef = shallowRef<HTMLElement | null>(null);
  const editorRef = shallowRef<IDomEditor | null>(null);
  const appMainRef = shallowRef<HTMLElement | null>(null);
  let fullscreenObserver: MutationObserver | null = null;
  const toolbarConfig = {};
  const editorConfig = computed(() => ({
    placeholder: props.placeholder || '请输入内容'
  }));

  const updateFullscreenBounds = () => {
    const base =
      wrapperRef.value?.closest('.page-container') ||
      (document.querySelector('.app-main') as HTMLElement | null);
    if (!base) return;
    const rect = base.getBoundingClientRect();
    document.documentElement.style.setProperty(
      '--info-editor-fullscreen-top',
      `${Math.round(rect.top)}px`
    );
    document.documentElement.style.setProperty(
      '--info-editor-fullscreen-left',
      `${Math.round(rect.left)}px`
    );
    document.documentElement.style.setProperty(
      '--info-editor-fullscreen-width',
      `${Math.round(rect.width)}px`
    );
    document.documentElement.style.setProperty(
      '--info-editor-fullscreen-height',
      `${Math.round(rect.height)}px`
    );
  };

  const htmlValue = computed({
    get: () => props.modelValue || '',
    set: (value: string) => emit('update:modelValue', value)
  });

  const handleCreated = (editor: IDomEditor) => {
    editorRef.value = editor;
  };

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateFullscreenBounds);
    appMainRef.value?.removeEventListener('scroll', updateFullscreenBounds);
    if (fullscreenObserver) {
      fullscreenObserver.disconnect();
      fullscreenObserver = null;
    }
    if (editorRef.value != null) {
      editorRef.value.destroy();
      editorRef.value = null;
    }
  });

  onMounted(() => {
    appMainRef.value = document.querySelector('.app-main') as HTMLElement | null;
    updateFullscreenBounds();
    window.addEventListener('resize', updateFullscreenBounds);
    appMainRef.value?.addEventListener('scroll', updateFullscreenBounds);
    // 全屏容器挂到全局层，监听其出现/变化后刷新边界
    fullscreenObserver = new MutationObserver(() => {
      updateFullscreenBounds();
    });
    fullscreenObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  });
</script>

<style scoped>
  .editor-wrapper {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    overflow: hidden;
  }

  .editor-toolbar {
    border-bottom: 1px solid var(--el-border-color);
  }

  .editor-content {
    min-height: 320px;
    height: 100%;
  }
</style>

<style>
  .w-e-full-screen-container {
    position: fixed !important;
    top: var(--info-editor-fullscreen-top, 66px) !important;
    left: var(--info-editor-fullscreen-left, 0px) !important;
    width: var(
      --info-editor-fullscreen-width,
      calc(100vw - var(--info-editor-fullscreen-left, 0px))
    ) !important;
    height: var(
      --info-editor-fullscreen-height,
      calc(100vh - var(--info-editor-fullscreen-top, 66px))
    ) !important;
    z-index: 1200 !important;
  }
</style>
