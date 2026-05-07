import type { FormRules } from 'element-plus';

const validateHttpOrHttpsUrl = (
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void
) => {
  const url = value?.trim();
  if (!url) {
    callback();
    return;
  }

  try {
    const parsedUrl = new URL(url);
    const isHttp = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    if (!isHttp || !parsedUrl.hostname) {
      callback(new Error('请输入以 http:// 或 https:// 开头的完整地址'));
      return;
    }
    callback();
  } catch {
    callback(new Error('请输入以 http:// 或 https:// 开头的完整地址'));
  }
};

const validateAppCode = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  const code = value?.trim();
  if (!code) {
    callback();
    return;
  }

  if (!/^[a-z][a-z0-9-]*$/.test(code)) {
    callback(new Error('应用编码仅支持小写英文字母、数字和中划线，且需字母开头'));
    return;
  }
  callback();
};

/** 应用表单校验规则 */
export const APP_RULES: FormRules = {
  name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }],
  shortName: [{ required: true, message: '请输入应用简称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入小写英文编码', trigger: 'blur' },
    { validator: validateAppCode, trigger: 'blur' }
  ],
  entry: [
    { required: true, message: '请输入服务地址', trigger: 'blur' },
    { validator: validateHttpOrHttpsUrl, trigger: 'blur' }
  ],
  container: [{ required: true, message: '请输入挂载容器', trigger: 'blur' }]
};
