import request from '@/utils/request';

/** 应用管理分类：平台子应用 / 单点 / 外部 */
export type AppCategory = 'platform' | 'sso' | 'external';

export interface MicroApp {
  id?: number;
  name: string; // 应用名称 (唯一标识)
  shortName?: string; // 应用简称
  code?: string; // 应用编码
  description?: string; // 应用描述
  sort?: number; // 排序
  entry: string; // 入口地址（链接）
  iconName?: string; // 应用图标名称（例如 Element Plus 图标名）
  status?: number; // 状态：1-已上架，0-未上架
  activeRule: string; // 激活规则 (路由前缀)
  container: string; // 挂载容器 (通常是 #sub-app-container)
  showInWorkbench?: boolean; // 是否显示在工作台/我的应用
  createTime?: string;
}

// 列表查询条件
export interface AppQueryParams {
  searchName?: string;
  leader?: string;
  status?: string | number;
  category?: AppCategory;
}

// 获取列表（支持筛选）
export const getAppList = (params?: AppQueryParams) => {
  return request.get<MicroApp[]>('/api/apps', { params });
};

// 新增
export const addApp = (data: MicroApp) => {
  return request.post('/api/apps', data);
};

// 修改
export const updateApp = (id: number, data: MicroApp) => {
  return request.put(`/api/apps/${id}`, data);
};

// 删除
export const deleteApp = (id: number) => {
  return request.delete(`/api/apps/${id}`);
};
