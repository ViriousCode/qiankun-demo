<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <template v-if="form.id == null">
        <el-form-item label="上级组织">
          <el-input :model-value="parentOrgName" disabled />
        </el-form-item>
      </template>
      <el-form-item label="组织代码" prop="orgCode">
        <el-input v-model="form.orgCode" placeholder="如 ORG-004" :disabled="form.id != null" />
      </el-form-item>
      <el-form-item label="组织名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入组织名称" />
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

  export interface OrgFormModel {
    id: number | undefined;
    parentId: number | null;
    orgCode: string;
    name: string;
    leader: string;
    phone: string;
    status: number;
  }

  defineProps<{
    modelValue: boolean;
    title: string;
    form: OrgFormModel;
    rules: FormRules;
    parentOrgName: string;
    orgLevelLabel: string;
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
