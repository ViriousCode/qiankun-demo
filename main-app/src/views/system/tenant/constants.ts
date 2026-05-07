import type { FormRules } from 'element-plus';

export const TENANT_RULES: FormRules = {
  tenantName: [{ required: true, message: '请输入租户名称', trigger: 'blur' }],
  shortName: [{ required: true, message: '请输入租户简称', trigger: 'blur' }],
  tenantCode: [
    { required: true, message: '请输入租户编码', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9]+$/,
      message: '仅支持字母或数字',
      trigger: 'blur'
    }
  ],
  adminName: [{ required: true, message: '请输入租户管理员', trigger: 'blur' }]
};
