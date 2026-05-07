import type { FormRules } from 'element-plus';

export const DICT_CATEGORY_RULES: FormRules = {
  categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  categoryCode: [{ required: true, message: '请输入分类代码', trigger: 'blur' }]
};

