import type { FormRules } from 'element-plus';

/** 用户管理表单校验规则 */
export const USER_RULES: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }]
};
