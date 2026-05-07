<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item v-if="isPlatformCategory" label="应用类型">
        <el-input :model-value="appTypeLabel" disabled />
      </el-form-item>
      <el-form-item prop="name" label="应用名称">
        <el-input v-model="form.name" placeholder="请输入应用名称" />
      </el-form-item>
      <el-form-item label="应用简称" prop="shortName">
        <el-input v-model="form.shortName" placeholder="请输入应用简称" />
      </el-form-item>
      <el-form-item label="应用编码" prop="code">
        <el-input v-model="form.code" placeholder="请输入小写英文编码" :disabled="isEditMode" />
      </el-form-item>
      <el-form-item v-if="isPlatformCategory" label="访问路由" prop="activeRule">
        <el-input v-model="form.activeRule" placeholder="将根据应用编码自动生成" disabled />
      </el-form-item>
      <el-form-item :label="entryLabel" prop="entry">
        <el-input v-model="form.entry" :placeholder="entryPlaceholder" />
      </el-form-item>
      <el-form-item label="应用图标" prop="iconName">
        <IconSelect v-model="form.iconName" />
      </el-form-item>
      <el-form-item v-if="!isEditMode" label="是否上架" prop="status">
        <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import type { FormInstance, FormRules } from 'element-plus';
  import type { AppCategory, MicroApp } from '@/api/app';

  const props = defineProps<{
    modelValue: boolean;
    title: string;
    category: AppCategory;
    form: MicroApp;
    rules: FormRules;
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    submit: [];
  }>();

  const formRef = ref<FormInstance>();
  const isPlatformCategory = computed(() => props.category === 'platform');
  const isEditMode = computed(() => props.form.id != null);
  const appTypeLabel = computed(() => {
    if (props.category === 'sso') return '单点应用';
    if (props.category === 'external') return '外部应用';
    return '子应用';
  });
  const entryLabel = computed(() => (isPlatformCategory.value ? '服务地址' : '应用链接'));
  const entryPlaceholder = computed(() =>
    isPlatformCategory.value
      ? '请输入服务地址，如：http://localhost:7101'
      : '请输入应用链接，如：https://example.com'
  );

  watch(
    () => props.form.code,
    (code) => {
      const normalizedCode = (code || '').trim();
      props.form.activeRule = normalizedCode ? `/${normalizedCode}` : '';
    }
  );

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate();
      emit('submit');
    } catch {
      // validation failed
    }
  };
</script>
