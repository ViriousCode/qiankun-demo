<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="https://element-plus.org/images/element-plus-logo.svg" alt="logo" class="logo" />
        <h2 class="title">微前端主基座</h2>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
      >
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名: admin" prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码: 任意字符"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>

        <div class="tips">
          <span>提示: 用户名输入 admin 可模拟管理员权限</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/store/user';
  import { ElMessage } from 'element-plus';
  import type { FormInstance, FormRules } from 'element-plus';

  const router = useRouter();
  const userStore = useUserStore();

  const loginFormRef = ref<FormInstance>();
  const loading = ref(false);

  // 表单数据
  const loginForm = reactive({
    username: 'admin',
    password: ''
  });

  // 表单校验规则
  const loginRules = reactive<FormRules>({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
  });
  // main-app/src/views/login/index.vue

  const handleLogin = async () => {
    if (!loginFormRef.value) return;

    await loginFormRef.value.validate(async (valid) => {
      if (valid) {
        loading.value = true;
        try {
          // 1. 获取 Token
          await userStore.login({
            username: loginForm.username,
            password: loginForm.password
          });

          // 【✨ 优化点 ✨】
          // 主动在这里等待权限返回，而不是交给路由守卫去“悄悄”加载。
          // 这样 Loading 动画会一直持续，用户就知道系统还在处理中。
          await userStore.getUserInfo();

          ElMessage.success('登录成功');

          // 2. 权限到位了，跳转会非常快（守卫会直接放行）
          router.push('/dashboard');
        } catch (error) {
          console.error(error);
          ElMessage.error('登录失败，请重试');
        } finally {
          loading.value = false;
        }
      }
    });
  };
</script>

<style scoped lang="scss">
  .login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #2d3a4b; // 深色背景
    background-image: radial-gradient(#414e5f 1px, transparent 1px);
    background-size: 30px 30px;

    .login-box {
      width: 400px;
      padding: 40px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

      .login-header {
        text-align: center;
        margin-bottom: 30px;

        .logo {
          height: 40px;
          margin-bottom: 10px;
        }

        .title {
          margin: 0;
          font-size: 24px;
          color: #333;
          font-weight: 600;
        }
      }

      .login-btn {
        width: 100%;
      }

      .tips {
        font-size: 12px;
        color: #909399;
        text-align: center;
        margin-top: 10px;
      }
    }
  }
</style>
