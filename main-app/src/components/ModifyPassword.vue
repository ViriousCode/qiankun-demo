<template>
  <el-dialog
    v-model="visible"
    title="修改密码"
    width="480px"
    @close="handleClose"
    :close-on-click-modal="false"
    :teleported="false"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" status-icon>
      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="formData.oldPassword" type="password" placeholder="请输入当前使用的密码" show-password />
      </el-form-item>

      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="formData.newPassword" type="password"
          :placeholder="`请输入至少 ${systemStore.passwordPolicy.minLength} 位新密码`" show-password />
        <div class="password-tip">复杂度要求：包含 {{ complexityText }}</div>
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="formData.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">确定修改</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { modifyOwnPwdApi } from '@/api/user';
import { useUserStore } from '@/store/user';
import { useSystemStore } from '@/store/system';
import { validateDynamicPassword } from '@/utils/reg';

// 1. 定义组件的显示/隐藏状态
const visible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();
const userStore = useUserStore();
const systemStore = useSystemStore();

// 2. 表单数据
const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 3. 翻译复杂度文字
const complexityText = computed(() => {
  const map: Record<string, string> = {
    uppercase: '大写字母',
    lowercase: '小写字母',
    number: '数字',
    special: '特殊字符'
  };
  return systemStore.passwordPolicy.complexity.map((key) => map[key] || key).join('、');
});

// 4. 校验逻辑
const validateConfirm = (_rule: any, value: any, callback: any) => {
  if (value !== formData.newPassword) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules = reactive<FormRules>({
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { validator: validateDynamicPassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
});

// 🌟 暴露给外部的方法
const open = async () => {
  // 打开前拉取最新策略
  await systemStore.fetchPasswordPolicy();
  visible.value = true;
};

const handleClose = () => {
  formRef.value?.resetFields();
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await modifyOwnPwdApi({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        });
        ElMessage.success('密码修改成功，请重新登录');
        visible.value = false;
        // 修改成功后强制退出
        userStore.reset();
        window.location.reload();
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    }
  });
};

defineExpose({ open });
</script>

<style scoped>
.password-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
