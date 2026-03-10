import request from '@/utils/request';

// --- 类型定义 ---
export interface BasicConfig {
  systemName: string;
  logo: string;
  themeColor: string;
  layout: string;
}

export interface SecurityConfig {
  defaultPassword: string;
  minLength: number;
  complexity: string[];
  expireDays: number;
  maxFailures: number;
}

// --- 接口请求 ---

// 获取基础设置
export const getBasicSettings = () => {
  return request.get<BasicConfig>('/api/settings/basic');
};

// 更新基础设置
export const updateBasicSettings = (data: BasicConfig) => {
  return request.put<any>('/api/settings/basic', data);
};

// 获取安全策略
export const getSecuritySettings = () => {
  return request.get<SecurityConfig>('/api/settings/security');
};

// 更新安全策略
export const updateSecuritySettings = (data: SecurityConfig) => {
  return request.put<any>('/api/settings/security', data);
};

// Logo 上传（base64 + filename，返回 { url }）
export const uploadLogoApi = (data: { base64: string; filename: string }) => {
  return request.post<{ url: string }>('/api/upload', data);
};
