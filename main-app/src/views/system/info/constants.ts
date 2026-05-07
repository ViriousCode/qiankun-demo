import type { FormRules } from 'element-plus';
import type { InfoFormModel } from './useInfoForm';

export const INFO_CLASSIFY_OPTIONS = ['平台资讯', '政策资讯', '行业资讯', '环保资讯'] as const;
export const INFO_TYPE_OPTIONS = [
  { label: '内部', value: 'internal' },
  { label: '外部', value: 'external' }
] as const;

const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const INFO_RULES: FormRules<InfoFormModel> = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  infoCategory: [{ required: true, message: '请选择资讯分类', trigger: 'change' }],
  infoType: [{ required: true, message: '请选择资讯类型', trigger: 'change' }],
  publisher: [{ required: true, message: '请输入发布人', trigger: 'blur' }],
  content: [{ required: true, message: '请输入资讯内容', trigger: 'blur' }],
  externalLink: [
    {
      validator: (_rule, value, callback) => {
        const url = String(value || '').trim();
        if (!url) {
          callback();
          return;
        }
        if (!isValidHttpUrl(url)) {
          callback(new Error('请输入 http(s):// 开头的完整链接地址'));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }
  ]
};
