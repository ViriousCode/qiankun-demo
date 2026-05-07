<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="故障代码" prop="faultCode">
        <el-input v-model="form.faultCode" placeholder="如 E001、W002" :disabled="!!form.id" />
      </el-form-item>
      <el-form-item label="故障名称" prop="faultName">
        <el-input v-model="form.faultName" placeholder="请输入故障名称" />
      </el-form-item>
      <el-form-item label="故障级别" prop="faultLevel">
        <el-select v-model="form.faultLevel" placeholder="请选择" style="width: 100%">
          <el-option label="提示" value="1">
            <el-tag type="info">提示</el-tag>
          </el-option>
          <el-option label="警告" value="2">
            <el-tag type="warning">警告</el-tag>
          </el-option>
          <el-option label="严重" value="3">
            <el-tag type="danger">严重</el-tag>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="处理建议" prop="suggestion">
        <el-input v-model="form.suggestion" type="textarea" placeholder="请输入处理建议" />
      </el-form-item>
      <el-form-item v-if="form.id == null" label="是否启用" prop="status">
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

  export interface FaultFormModel {
    id: number | undefined;
    faultCode: string;
    faultName: string;
    faultLevel: string;
    status: number;
    suggestion: string;
  }

  defineProps<{
    modelValue: boolean;
    title: string;
    form: FaultFormModel;
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
