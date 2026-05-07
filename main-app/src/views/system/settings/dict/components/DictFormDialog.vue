<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="所属分类" prop="categoryCode">
        <el-select v-model="form.categoryCode" filterable placeholder="请选择分类" style="width: 100%">
          <el-option
            v-for="c in categories"
            :key="c.id || c.categoryCode"
            :label="c.categoryName"
            :value="c.categoryCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="代码" prop="code">
        <el-input v-model="form.code" placeholder="请输入代码（用于 value）" />
      </el-form-item>
      <el-form-item label="值" prop="value">
        <el-input-number v-model="form.value" :min="0" :step="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" :step="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="扩展" prop="ext">
        <el-input v-model="form.ext" type="textarea" placeholder="扩展（可选）" />
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

  export interface DictFormModel {
    id: number | undefined;
    categoryCode: string;
    name: string;
    code: string;
    value: number;
    sort: number;
    status: number;
    ext: string;
    description: string;
  }

  defineProps<{
    modelValue: boolean;
    title: string;
    form: DictFormModel;
    categories: { id?: number; categoryName: string; categoryCode: string }[];
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
