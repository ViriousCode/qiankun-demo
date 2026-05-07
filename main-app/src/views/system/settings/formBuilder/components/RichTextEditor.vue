<template>
  <div class="editor-wrapper">
    <Toolbar
      class="editor-toolbar"
      :editor="editorRef"
      :default-config="toolbarConfig"
      mode="default"
    />
    <Editor
      v-model="htmlValue"
      class="editor-content"
      :style="{ minHeight: minHeightPx }"
      :default-config="editorConfig"
      mode="default"
      @on-created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
  import '@wangeditor/editor/dist/css/style.css';
  import { computed, onBeforeUnmount, shallowRef } from 'vue';
  import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
  import type { IDomEditor } from '@wangeditor/editor';

  const props = defineProps<{
    modelValue: string;
    placeholder?: string;
    disabled?: boolean;
    minHeight?: number;
  }>();

  const emit = defineEmits<{
    (event: 'update:modelValue', value: string): void;
  }>();

  const editorRef = shallowRef<IDomEditor | null>(null);
  const toolbarConfig = {};

  const editorConfig = computed(() => ({
    placeholder: props.placeholder || '请输入内容',
    readOnly: !!props.disabled
  }));

  const minHeightPx = computed(() => `${Math.max(160, Number(props.minHeight || 320))}px`);

  const htmlValue = computed({
    get: () => props.modelValue || '',
    set: (value: string) => emit('update:modelValue', value)
  });

  const handleCreated = (editor: IDomEditor) => {
    editorRef.value = editor;
  };

  onBeforeUnmount(() => {
    if (editorRef.value != null) {
      editorRef.value.destroy();
      editorRef.value = null;
    }
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
    height: 100%;
  }
</style>
