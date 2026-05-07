<template>
  <el-dialog
    :model-value="modelValue"
    title="设置联系人"
    width="520px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" label-width="100px">
      <el-form-item label="当前组织">
        <el-input :model-value="form.orgName" disabled />
      </el-form-item>
      <el-form-item label="负责人" prop="leader">
        <el-input v-model="form.leader" placeholder="请输入负责人" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入联系电话" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit')">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  defineProps<{
    modelValue: boolean;
    form: { orgId: number; orgName: string; leader: string; phone: string };
    loading?: boolean;
  }>();

  defineEmits<{
    'update:modelValue': [value: boolean];
    submit: [];
  }>();
</script>

<style scoped lang="scss">
  .el-dialog {
    :deep(.el-form-item) {
      margin-bottom: 18px;
    }
  }
</style>
