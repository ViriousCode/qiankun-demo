<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="520px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" status-icon>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
      </el-form-item>

      <el-form-item label="验证码" prop="code">
        <el-input v-model="form.code" placeholder="请输入短信验证码" maxlength="6">
          <template #suffix>
            <el-button
              type="primary"
              link
              :disabled="codeSendingDisabled"
              @click="handleSendCode"
            >
              {{ sendCodeText }}
            </el-button>
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

type Mode = 'bind' | 'edit';

const visible = ref(false);
const submitting = ref(false);
const mode = ref<Mode>('bind');

const formRef = ref<FormInstance>();
const form = reactive({
  phone: '',
  code: ''
});

const title = computed(() => (mode.value === 'bind' ? '绑定手机' : '修改手机号'));

const phoneReg = /^1\d{10}$/;
const rules = reactive<FormRules>({
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      validator: (_rule, value: string, callback) => {
        if (!value) return callback();
        if (!phoneReg.test(value)) return callback(new Error('手机号格式不正确'));
        callback();
      },
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    {
      validator: (_rule, value: string, callback) => {
        if (!value) return callback();
        if (!/^\d{4,6}$/.test(value)) return callback(new Error('验证码格式不正确'));
        callback();
      },
      trigger: 'blur'
    }
  ]
});

const countdown = ref(0);
let timer: number | undefined;

const codeSendingDisabled = computed(() => countdown.value > 0);
const sendCodeText = computed(() => (countdown.value > 0 ? `${countdown.value}s 后重试` : '获取验证码'));

function stopTimer() {
  if (timer) {
    window.clearInterval(timer);
    timer = undefined;
  }
}

function startCountdown(seconds = 60) {
  stopTimer();
  countdown.value = seconds;
  timer = window.setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      stopTimer();
      countdown.value = 0;
    }
  }, 1000);
}

async function handleSendCode() {
  try {
    await formRef.value?.validateField('phone');
  } catch {
    return;
  }

  ElMessage.success('验证码已发送（模拟），请在 60 秒内输入');
  startCountdown(60);
}

async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  submitting.value = true;
  try {
    await new Promise((r) => window.setTimeout(r, 500));
    ElMessage.success('验证成功（模拟）');
    visible.value = false;
  } finally {
    submitting.value = false;
  }
}

function handleClose() {
  formRef.value?.resetFields();
  stopTimer();
  countdown.value = 0;
}

function open(options?: { mode?: Mode; phone?: string }) {
  mode.value = options?.mode ?? (options?.phone ? 'edit' : 'bind');
  form.phone = options?.phone ?? '';
  form.code = '';
  visible.value = true;
}

defineExpose({ open });

onBeforeUnmount(() => {
  stopTimer();
});
</script>

