<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="租户名称" prop="tenantName">
        <el-input v-model="form.tenantName" placeholder="请输入租户名称" />
      </el-form-item>
      <el-form-item label="租户简称" prop="shortName">
        <el-input v-model="form.shortName" placeholder="请输入租户简称" />
      </el-form-item>
      <el-form-item label="租户编码" prop="tenantCode">
        <el-input v-model="form.tenantCode" placeholder="请输入字母或者数字" />
      </el-form-item>
      <el-form-item label="租户管理员" prop="adminName">
        <el-input v-model="form.adminName" placeholder="请输入租户管理员" />
      </el-form-item>
      <el-form-item v-if="form.id == null" label="是否启用" prop="status">
        <div class="status-switch">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </div>
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

  export interface TenantFormModel {
    id: number | undefined;
    tenantName: string;
    shortName: string;
    tenantCode: string;
    adminName: string;
    status: number;
  }

  defineProps<{
    modelValue: boolean;
    title: string;
    form: TenantFormModel;
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

<style scoped>
  .status-switch {
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }
</style>
