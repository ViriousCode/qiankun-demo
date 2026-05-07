import type { FormRules } from 'element-plus';

/** 层级中文名（一级～十级，更深为 N级） */
export const LEVEL_NAMES = [
  '一级',
  '二级',
  '三级',
  '四级',
  '五级',
  '六级',
  '七级',
  '八级',
  '九级',
  '十级'
] as const;

/** 组织表单校验规则 */
export const ORG_RULES: FormRules = {
  orgCode: [{ required: true, message: '请输入组织代码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入组织名称', trigger: 'blur' }]
};
