<template>
  <el-dialog :model-value="modelValue" :title="title" width="600px" @update:model-value="$emit('update:modelValue', $event)">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="分类名称" prop="categoryName">
        <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="分类代码" prop="categoryCode">
        <el-input v-model="form.categoryCode" placeholder="请输入分类代码（用于绑定）" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" :step="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
      </el-form-item>
      <el-form-item v-if="form.id == null" label="是否启用" prop="status">
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
import { ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

export interface CategoryFormModel {
  id: number | undefined;
  categoryName: string;
  categoryCode: string;
  sort: number;
  status: number;
  description: string;
}

defineProps<{
  modelValue: boolean;
  title: string;
  form: CategoryFormModel;
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

