// main-app/src/api/workbench.ts
import request from '@/utils/request';

// 定义工作台数据类型
export interface WorkbenchItem {
  id?: number;
  title: string; // 显示名称，如 "测试列表"
  category: string, // 分类
  icon: string; // 图标，如 "List", "Link"
  targetType: 'internal' | 'external'; // 跳转类型：internal(内部子应用) 或 external(外部链接)
  path: string; // 目标地址 (子应用路由或外部http链接)
  description?: string; // 描述信息
  sort?: number; // 排序
  createTime?: string; // 创建时间
}

// 获取工作台列表
export function getWorkbenchList() {
  return request.get<WorkbenchItem[]>('/api/workbench');
}

// 新增工作台卡片
export function addWorkbenchItem(data: WorkbenchItem) {
  return request.post('/api/workbench', data);
}

// 修改工作台卡片
export function updateWorkbenchItem(id: number, data: WorkbenchItem) {
  return request.put(`/api/workbench/${id}`, data);
}

// 删除工作台卡片
export function deleteWorkbenchItem(id: number) {
  return request.delete(`/api/workbench/${id}`);
}
