/** 登录页本地存储 key */
export const LOGIN_STORAGE_KEYS = {
  remember: 'login-remember',
  username: 'login-username',
  password: 'login-password'
} as const;

/** 验证码配置 */
export const CAPTCHA_CONFIG = {
  chars: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  length: 4
} as const;

/** 表单校验文案（可选，便于多语言或统一修改） */
export const LOGIN_FORM_MESSAGES = {
  usernameRequired: '请输入用户名',
  passwordRequired: '请输入密码',
  codeRequired: '请输入验证码',
  codeInvalid: '验证码不正确'
} as const;
