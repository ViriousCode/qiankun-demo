import request from '@/utils/request';

export interface Role {
  id?: number;
  roleName: string;
  roleKey: string;
  description?: string;
  permissionIds?: number[];
  createTime?: string;
}

// 获取角色列表
export function getRoleList() {
  return request.get<{ list: Role[]; total: number }>('/api/roles');
}

// 新增角色
export function addRole(data: Role) {
  return request.post('/api/roles', data);
}

// 更新角色
export function updateRole(id: number, data: Role) {
  return request.put(`/api/roles/${id}`, data);
}

// 删除角色
export function deleteRole(id: number) {
  return request.delete(`/api/roles/${id}`);
}

// 获取权限树 (用于配置权限)
export function getPermissionTree() {
  return request.get('/api/permissions/tree');
}