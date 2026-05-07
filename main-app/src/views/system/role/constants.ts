import type { FormRules } from 'element-plus';

export const ROLE_RULES: FormRules = {
  tenantId: [{ required: true, message: '所属租户不能为空', trigger: 'change' }],
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[a-z]+$/, message: '角色编码仅支持小写英文', trigger: 'blur' }
  ]
};
