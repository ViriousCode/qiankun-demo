import type { FormRules } from 'element-plus';

export const GROUP_RULES: FormRules = {
  tenantId: [{ required: true, message: '所属租户不能为空', trigger: 'change' }],
  groupName: [{ required: true, message: '请输入群组名称', trigger: 'blur' }],
  groupCode: [
    { required: true, message: '请输入群组编码', trigger: 'blur' },
    { pattern: /^[a-z]+$/, message: '群组编码仅支持小写英文', trigger: 'blur' }
  ]
};
