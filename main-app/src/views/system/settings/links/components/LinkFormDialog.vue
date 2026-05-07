<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="链接名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入链接名称" />
      </el-form-item>
      <el-form-item label="链接地址" prop="url">
        <el-input v-model="form.url" placeholder="请输入链接地址" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="1" :max="9999" style="width: 100%" />
      </el-form-item>
      <el-form-item v-if="form.id == null" label="是否启用">
        <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import type { FormInstance, FormRules } from 'element-plus';

  export interface LinkFormModel {
    id: number | undefined;
    name: string;
    url: string;
    sort: number;
    status: number;
  }

  defineProps<{
    modelValue: boolean;
    title: string;
    form: LinkFormModel;
    rules: FormRules;
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    submit: [];
  }>();

  const formRef = ref<FormInstance>();

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate();
      emit('submit');
    } catch {
      // validation failed
    }
  };
</script>
