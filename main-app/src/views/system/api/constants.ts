import type { FormRules } from 'element-plus';
import type { ApiMethod } from '@/api/systemApi';

export const API_METHOD_OPTIONS: Array<{ label: ApiMethod; value: ApiMethod }> = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' }
  // { label: 'PUT', value: 'PUT' },
  // { label: 'DELETE', value: 'DELETE' }
];

export const API_BOOLEAN_OPTIONS = [
  { label: '是', value: true },
  { label: '否', value: false }
];

export const API_ENABLED_OPTIONS = [
  { label: '启用', value: true },
  { label: '禁用', value: false }
];

/** 接口路径前缀（参考菜单管理前缀模式） */
export const API_PATH_PREFIX_MAP: Record<string, string> = {
  主系统: '/platform'
};

export const API_FORM_RULES: FormRules = {
  name: [{ required: true, message: '请输入 API 名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入接口路径', trigger: 'blur' }],
  method: [{ required: true, message: '请选择请求方式', trigger: 'change' }]
};
