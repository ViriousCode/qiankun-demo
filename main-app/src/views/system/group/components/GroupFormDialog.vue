<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="所属租户" prop="tenantId">
        <el-input :model-value="tenantName" disabled />
      </el-form-item>
      <el-form-item label="群组名称" prop="groupName">
        <el-input v-model="form.groupName" placeholder="请输入群组名称" />
      </el-form-item>
      <el-form-item label="群组编码" prop="groupCode">
        <el-input v-model="form.groupCode" placeholder="小写英文编码" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="群组描述" prop="description">
        <el-input v-model="form.description" type="textarea" placeholder="请输入群组描述" />
      </el-form-item>
      <el-form-item v-if="!isEdit" label="是否启用" prop="status">
        <div class="switch-row">
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

  export interface GroupFormModel {
    id?: number;
    tenantId: number | null;
    groupName: string;
    groupCode: string;
    description?: string;
    isDefault: boolean;
    status: number;
  }

  defineProps<{
    modelValue: boolean;
    title: string;
    tenantName: string;
    isEdit: boolean;
    form: GroupFormModel;
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
  .switch-row {
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }
</style>
