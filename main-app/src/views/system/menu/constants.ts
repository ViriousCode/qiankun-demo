import type { FormRules } from 'element-plus';

/** 主应用等在界面上的展示名 */
export const APP_DISPLAY_NAME: Record<string, string> = {
  main: '主系统'
};

export const MENU_RULES: FormRules = {
  title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
  permission: [{ required: true, message: '请输入权限标识', trigger: 'blur' }],
  menuForm: [{ required: true, message: '请选择菜单形式', trigger: 'change' }],
  openMode: [{ required: true, message: '请选择打开方式', trigger: 'change' }],
  app: [{ required: true, message: '请选择所属应用', trigger: 'change' }]
};
