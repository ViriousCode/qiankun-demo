<template>
  <el-dialog
    :model-value="modelValue"
    title="重置密码"
    width="520px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="认证标识">
        <el-input :model-value="authIdentifier" disabled />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          show-password
          placeholder="请输入新密码"
          autocomplete="new-password"
        />
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

  export interface ResetPasswordForm {
    newPassword: string;
  }

  defineProps<{
    modelValue: boolean;
    authIdentifier: string;
    form: ResetPasswordForm;
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
