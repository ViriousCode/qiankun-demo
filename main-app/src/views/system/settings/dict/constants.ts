import type { FormRules } from 'element-plus';

export const DICT_RULES: FormRules = {
  categoryCode: [{ required: true, message: '请选择所属分类', trigger: 'change' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入代码', trigger: 'blur' }],
  value: [
    { required: true, message: '请输入值', trigger: 'change' },
    { type: 'number', message: '值必须为数值', trigger: 'change' }
  ]
};
