import type { FormRules } from 'element-plus';

const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const LINK_RULES: FormRules = {
  name: [{ required: true, message: '请输入链接名称', trigger: 'blur' }],
  url: [
    { required: true, message: '请输入链接地址', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        const url = String(value || '').trim();
        if (!url) {
          callback(new Error('请输入链接地址'));
          return;
        }
        if (!isValidHttpUrl(url)) {
          callback(new Error('链接地址格式不正确，请输入 http(s):// 开头的完整地址'));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }
  ]
};
