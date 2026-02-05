// sub-app/src/api/role.ts
import request from '@/utils/request';

// --- 类型定义 (保持不变) ---
export interface Role {
  id?: string;
  roleName: string;
  roleKey: string;
  description: string;
  permissionIds?: number[];
  createTime?: string;
}

export interface PermissionNode {
  id: number;
  label: string;
  children?: PermissionNode[];
}

export interface RoleListResult {
  list: Role[];
  total: number;
}

// --- API 方法 (使用 axios) ---

// 1. 获取权限树
export const getPermissionTree = () => {
  return request.get<any, PermissionNode[]>('/api/permissions/tree');
};

// 2. 获取角色列表
export const getRoleList = (params?: any) => {
  return request.get<any, RoleListResult>('/api/roles', { params });
};

// 3. 新增角色
export const addRole = (data: Role) => {
  return request.post('/api/roles', data);
};

// 4. 修改角色
export const updateRole = (id: string, data: Role) => {
  return request.put(`/api/roles/${id}`, data);
};

// 5. 删除角色
export const deleteRole = (id: string) => {
  return request.delete(`/api/roles/${id}`);
};