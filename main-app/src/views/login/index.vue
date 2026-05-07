<template>
  <div class="login-container">
    <Logo class="logo" />
    <div class="login-box">
      <button class="login-mode-switch" type="button" @click="toggleLoginMode">
        <img
          :src="loginMode === 'password' ? iconCode : iconPassword"
          class="login-mode-icon"
          alt="switch"
        />
      </button>
      <Transition name="login-mode" mode="out-in">
        <div v-if="loginMode === 'password'" key="password">
          <div class="login-header">
            <div>欢迎登录</div>
            <div>环保管理平台</div>
          </div>

          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
            <el-form-item prop="username" class="login-form-account">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入您的帐号"
                prefix-icon="User"
              />
            </el-form-item>

            <el-form-item prop="password" class="login-form-password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入您的密码"
                prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <el-form-item prop="code" class="login-form-code">
              <el-input
                v-model="loginForm.code"
                placeholder="请输入验证码"
                prefix-icon="Key"
                maxlength="4"
                @keyup.enter="handleLogin"
              >
                <template #suffix>
                  <img
                    class="captcha-img"
                    :src="captchaDataUrl"
                    alt="captcha"
                    @click="() => refreshCaptcha(clearCode)"
                  />
                </template>
              </el-input>
            </el-form-item>

            <div class="login-form-extra">
              <el-checkbox v-model="rememberPassword">记住密码</el-checkbox>
              <el-link
                type="primary"
                :underline="false"
                class="forgot-link"
                @click="handleForgotPassword"
              >
                忘记密码？
              </el-link>
            </div>

            <el-form-item>
              <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">
                <span class="login-btn-text">{{ loading ? '登录中...' : '登 录' }}</span>
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-else key="qr" class="qr-login">
          <div class="qr-title">欢迎登录</div>
          <div class="qr-subtitle">请使用浙政钉移动端扫描二维码</div>
          <div class="qr-code-wrap">
            <div>二维码占位</div>
          </div>
          <div class="qr-brand">
            <img src="@/assets/image/login/logo_qrcode.webp" alt="专有钉钉" class="qr-brand-img" />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/store/user';
  import { useThemeStore } from '@/store/theme';
  import { ElMessage } from 'element-plus';
  import type { FormInstance, FormRules } from 'element-plus';
  import { LOGIN_FORM_MESSAGES } from './constants';
  import { useLoginCaptcha } from './useLoginCaptcha';
  import { useRememberPassword } from './useRememberPassword';
  import iconCode from '@/assets/image/login/icon_code.webp';
  import iconPassword from '@/assets/image/login/icon_password.webp';
  import Logo from '@/components/Logo.vue';
  import { alertInAppMain } from '@/utils/messageBox';

  const router = useRouter();
  const userStore = useUserStore();
  const themeStore = useThemeStore();

  const loginFormRef = ref<FormInstance>();
  const loading = ref(false);
  const loginMode = ref<'password' | 'qr'>('password');

  const loginForm = reactive({
    username: '',
    password: '',
    code: ''
  });

  const { captchaDataUrl, refreshCaptcha, createCodeValidator } = useLoginCaptcha();
  const { rememberPassword, loadSavedCredentials, saveCredentials } =
    useRememberPassword(loginForm);

  const clearCode = () => {
    loginForm.code = '';
  };

  const loginRules = reactive<FormRules>({
    username: [{ required: true, message: LOGIN_FORM_MESSAGES.usernameRequired, trigger: 'blur' }],
    password: [{ required: true, message: LOGIN_FORM_MESSAGES.passwordRequired, trigger: 'blur' }],
    code: [
      { required: true, message: LOGIN_FORM_MESSAGES.codeRequired, trigger: 'blur' },
      { validator: createCodeValidator(), trigger: 'blur' }
    ]
  });

  const handleForgotPassword = () => {
    alertInAppMain('请联系管理员重置密码。', '忘记密码', {
      confirmButtonText: '知道了',
      type: 'info'
    });
  };

  const toggleLoginMode = () => {
    loginMode.value = loginMode.value === 'password' ? 'qr' : 'password';
  };

  const handleLogin = async () => {
    if (!loginFormRef.value) return;

    await loginFormRef.value.validate(async (valid) => {
      if (!valid) return;
      loading.value = true;
      try {
        await userStore.login({
          username: loginForm.username,
          password: loginForm.password
        });

        saveCredentials();

        await userStore.getUserInfo();
        await themeStore.fetchAndApplyBasicConfig();

        ElMessage.success('登录成功');
        router.push('/workbench');
      } catch (error) {
        console.error(error);
        refreshCaptcha(clearCode);
      } finally {
        loading.value = false;
      }
    });
  };

  onMounted(() => {
    loadSavedCredentials();
    refreshCaptcha(clearCode);
  });
</script>

<style scoped lang="scss">
  .login-container {
    height: 100vh;
    height: 100dvh;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 24px;
    background: url('@/assets/image/login/bg_login.webp') center / cover no-repeat;
    position: relative;
    box-sizing: border-box;
    overflow: hidden;

    .logo {
      position: absolute;
      top: 13px;
      left: 44px;
    }

    .login-box {
      width: 480px;
      height: 548px;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.48) 0%,
        rgba(255, 255, 255, 0.5) 100%
      );
      border-radius: 16px;
      border: 1px solid #ffffff;
      backdrop-filter: blur(6px);
      margin-right: clamp(24px, 11vw, 360px);
      padding: 56px 48px 60px 47px;
      position: relative;
      z-index: 1;

      .login-mode-switch:focus,
      .login-mode-switch:focus-visible {
        outline: none;
      }

      .login-mode-switch:active {
        transform: scale(0.96);
      }

      .login-mode-switch {
        position: absolute;
        top: 0;
        right: 0;
        width: 70px;
        height: 70px;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
        z-index: 2;
      }

      .login-mode-icon {
        width: 70px;
        height: 70px;
        display: block;
        user-select: none;
        -webkit-user-drag: none;
      }

      .login-mode-enter-active,
      .login-mode-leave-active {
        transition:
          opacity 0.25s ease,
          transform 0.25s ease;
      }

      .login-mode-enter-from,
      .login-mode-leave-to {
        opacity: 0;
        transform: translateX(8px);
      }

      .qr-login {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;

        .qr-title {
          width: 96px;
          height: 33px;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 500;
          font-size: 24px;
          color: #333333;
          line-height: 33px;
          font-style: normal;
        }

        .qr-subtitle {
          width: 252px;
          height: 25px;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          font-size: 18px;
          color: #333333;
          line-height: 25px;
          font-style: normal;
          margin-top: 10px;
        }

        .qr-code-wrap {
          width: 214px;
          height: 214px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 71px;
        }

        .qr-brand {
          line-height: 0;
        }

        .qr-brand-img {
          width: 122px;
          height: 24px;
          margin-top: 44px;
        }
      }

      .login-header {
        > div:first-child {
          width: 96px;
          height: 33px;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 500;
          font-size: 24px;
          color: #333333;
          line-height: 33px;
          text-align: left;
          font-style: normal;
        }

        > div:last-child {
          width: 108px;
          height: 25px;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          font-size: 18px;
          color: #333333;
          line-height: 25px;
          text-align: left;
          font-style: normal;
          margin-top: 10px;
        }
      }

      .login-form-account,
      .login-form-password,
      .login-form-code {
        margin: 36px 0;
        width: 380px;
        height: 44px;
        border-radius: 8px;
      }

      .login-form-account {
        margin-top: 32px;
      }

      .login-form-code {
        margin-bottom: 0;
      }

      .captcha-img {
        width: 96px;
        height: 32px;
        cursor: pointer;
        border-radius: 6px;
        margin-left: 8px;
        display: block;
      }

      .login-form-extra {
        width: 380px;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: #999999;
        line-height: 20px;
        text-align: left;
        font-style: normal;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 19px 0 40px 0;
        height: 20px;
      }

      .login-btn:focus,
      .login-btn:focus-visible {
        outline: none;
      }

      .login-btn {
        width: 100%;
        height: 48px;
        background: linear-gradient(270deg, #009dff 0%, #006cff 100%);
        border-radius: 8px;

        .login-btn-text {
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 500;
          font-size: 20px !important;
          color: #ffffff;
          line-height: 28px;
          font-style: normal;
        }
      }
    }
  }

  @media (max-width: 480px) {
    .login-container {
      padding: 16px;
      justify-content: center;

      .login-box {
        margin-right: 0;
        padding: 24px 18px;
      }
    }
  }

  @media (max-width: 1200px) {
    .login-container {
      justify-content: center;

      .login-box {
        margin-right: 0;
      }
    }
  }
</style>
