import type { FormRules } from 'element-plus';

export const FAULT_RULES: FormRules = {
  faultCode: [{ required: true, message: '故障代码不能为空', trigger: 'blur' }],
  faultName: [{ required: true, message: '故障名称不能为空', trigger: 'blur' }],
  faultLevel: [{ required: true, message: '请选择故障级别', trigger: 'change' }]
};

type TagType = 'success' | 'primary' | 'warning' | 'info' | 'danger';

export const LEVEL_LABEL_MAP: Record<string, string> = {
  '1': '提示',
  '2': '警告',
  '3': '严重'
};

export const LEVEL_TYPE_MAP: Record<string, TagType> = {
  '1': 'info',
  '2': 'warning',
  '3': 'danger'
};

export const getLevelLabel = (level: string) => LEVEL_LABEL_MAP[level] || '未知';
export const getLevelType = (level: string): TagType => LEVEL_TYPE_MAP[level] || 'info';
