<template>
  <el-dialog :model-value="modelValue" :title="title" width="600px"
    @update:model-value="$emit('update:modelValue', $event)">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="关联用户" prop="linkedUserId">
        <el-select v-model="form.linkedUserId" placeholder="请选择关联用户" filterable clearable style="width: 100%"
          :disabled="isEdit">
          <el-option v-for="item in userOptions" :key="item.id" :label="item.label" :value="item.id">
            <div class="user-option">
              <span class="user-option__name">{{ item.label }}</span>
              <el-tag v-if="item.tenantShortName" type="primary" effect="plain">
                {{ item.tenantShortName }}
              </el-tag>
              <el-tag v-else type="primary" effect="plain">无租户</el-tag>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="账号类型" prop="accountType">
        <el-select v-model="form.accountType" placeholder="请选择账号类型" style="width: 100%" :disabled="isEdit">
          <el-option label="用户名" value="name" />
          <el-option label="手机号" value="phone" />
          <el-option label="浙政钉" value="zzd" />
        </el-select>
      </el-form-item>
      <el-form-item label="认证标识" prop="authIdentifier">
        <el-input v-model="form.authIdentifier" :placeholder="authPlaceholder" />
      </el-form-item>
      <el-form-item v-if="!isEdit" label="是否启用" prop="status">
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
import { computed, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { AccountFormModel, AccountUserOption } from '../useAccountForm';

const props = defineProps<{
  modelValue: boolean;
  title: string;
  form: AccountFormModel;
  userOptions: AccountUserOption[];
  rules: FormRules;
  loading?: boolean;
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  submit: [];
}>();

const formRef = ref<FormInstance>();

const authPlaceholder = computed(() => {
  const t = props.form.accountType;
  if (t === 'phone') return '请输入手机号';
  if (t === 'zzd') return '请输入浙政钉标识';
  return '请输入登录用户名';
});

const isEdit = computed(() => props.isEdit === true);

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
.user-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.user-option__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
