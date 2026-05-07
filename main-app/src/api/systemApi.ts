import request from '@/utils/request';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// 单条 API 定义
export interface ApiItem {
  id: number;
  name: string; // API 名称
  path: string; // 接口路径
  method: ApiMethod; // 请求方式
  permissionCode: string; // 权限标识
  appName: string; // 所属应用
  needAuth: boolean; // 是否鉴权
  isCommon: boolean; // 是否通用
  enabled: boolean; // 是否启用
  status?: number; // 兼容旧字段
  moduleName?: string; // 兼容旧字段
  description?: string; // 兼容旧字段
  createUser?: string;
  createTime?: string;
}

// 查询参数
export interface ApiQuery {
  name?: string;
  path?: string;
  method?: ApiMethod;
  permissionCode?: string;
  appName?: string;
  needAuth?: boolean;
  isCommon?: boolean;
  enabled?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

export interface ApiListResult {
  list: ApiItem[];
  total: number;
}

// 获取 API 列表
export const getApiList = (params?: ApiQuery) => {
  return request.get<ApiListResult>('/api/apis', { params });
};

// 新增
export const addApi = (data: Omit<ApiItem, 'id' | 'createTime'>) => {
  return request.post('/api/apis', data);
};

// 修改
export const updateApi = (id: number, data: Partial<ApiItem>) => {
  return request.put(`/api/apis/${id}`, data);
};

// 删除
export const deleteApi = (id: number) => {
  return request.delete(`/api/apis/${id}`);
};
