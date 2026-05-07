import request from '@/utils/request';

export interface Role {
  id?: number;
  /** mock 里仍保留，用于权限树过滤；角色管理页不再暴露该字段 */
  app?: string;
  /** 多租户 */
  tenantId?: number | null;
  roleName: string;
  /** 角色编码（小写英文编码） */
  roleCode: string;
  description?: string;
  /** 0 禁用 / 1 启用 */
  status?: number;
  permissionIds?: number[];
  updateTime?: string;
}

export interface RoleListParams {
  /** 角色关键字：角色名称、编码、描述 */
  keyword?: string;
  /** 0 禁用 / 1 启用 */
  status?: number | '' | null;
  /** 管理员可切换租户 */
  tenantId?: number | null;
}

// 获取角色列表
export const getRoleList = (params?: RoleListParams) => {
  return request.get<{ list: Role[]; total: number }>('/api/roles', { params });
};

// 新增角色
export const addRole = (data: Role) => {
  return request.post('/api/roles', data);
};

// 更新角色
export const updateRole = (id: number, data: Partial<Role>) => {
  return request.put(`/api/roles/${id}`, data);
};

// 删除角色
export const deleteRole = (id: number) => {
  return request.delete(`/api/roles/${id}`);
};

// 获取权限树（可选按所属应用过滤，用于分配权限）
export const getPermissionTree = (params?: { app?: string }) => {
  return request.get('/api/permissions/tree', { params });
};
