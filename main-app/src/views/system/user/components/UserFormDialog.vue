<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="所属租户" prop="tenantId">
        <el-select
          v-model="form.tenantId"
          placeholder="不选择则为无租户"
          style="width: 100%"
          clearable
          filterable
        >
          <el-option
            v-for="item in tenantOptions"
            :key="item.id"
            :label="item.tenantName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="form.nickName" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
          <el-option label="男" value="male" />
          <el-option label="女" value="female" />
        </el-select>
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
  import type { SystemTenant } from '@/api/systemTenant';

  export interface UserFormModel {
    id: number | undefined;
    tenantId: number | undefined;
    name: string;
    nickName: string;
    gender: 'male' | 'female';
    status: number;
  }

  defineProps<{
    modelValue: boolean;
    title: string;
    form: UserFormModel;
    tenantOptions: SystemTenant[];
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
