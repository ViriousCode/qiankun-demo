import request from '@/utils/request';

export interface MicroApp {
  id?: number;
  name: string;       // 应用名称 (唯一标识)
  entry: string;      // 入口地址
  activeRule: string; // 激活规则 (路由前缀)
  container: string;  // 挂载容器 (通常是 #sub-app-container)
  createTime?: string;
}

// 获取列表
export function getAppList() {
  return request.get<MicroApp[]>('/api/apps');
}

// 新增
export function addApp(data: MicroApp) {
  return request.post('/api/apps', data);
}

// 修改
export function updateApp(id: number, data: MicroApp) {
  return request.put(`/api/apps/${id}`, data);
}

// 删除
export function deleteApp(id: number) {
  return request.delete(`/api/apps/${id}`);
}