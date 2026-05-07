import request from '@/utils/request';

export interface SystemGroup {
  id?: number;
  tenantId?: number | null;
  groupName: string;
  /** 群组编码（小写英文编码） */
  groupCode: string;
  description?: string;
  /** 0 禁用 / 1 启用 */
  status?: number;
  /** 是否默认群组（同租户唯一） */
  isDefault?: boolean;
  roleIds?: number[];
  userIds?: number[];
  /** 列表展示聚合字段 */
  roleCount?: number;
  userCount?: number;
  updateTime?: string;
}

export interface SystemGroupListParams {
  /** 群组关键字：名称、编码、描述 */
  keyword?: string;
  /** 0 禁用 / 1 启用 */
  status?: number | '' | null;
  /** 管理员可切换租户 */
  tenantId?: number | null;
}

export const getSystemGroupList = (params?: SystemGroupListParams) => {
  return request.get<{ list: SystemGroup[]; total: number }>('/api/system/groups', { params });
};

export const addSystemGroup = (data: SystemGroup) => {
  return request.post('/api/system/groups', data);
};

export const updateSystemGroup = (id: number, data: Partial<SystemGroup>) => {
  return request.put(`/api/system/groups/${id}`, data);
};

export const deleteSystemGroup = (id: number) => {
  return request.delete(`/api/system/groups/${id}`);
};

export const getGroupRoles = (groupId: number) => {
  return request.get<{ roleIds: number[] }>(`/api/system/groups/${groupId}/roles`);
};

export const updateGroupRoles = (groupId: number, roleIds: number[]) => {
  return request.put<{ roleIds: number[] }>(`/api/system/groups/${groupId}/roles`, { roleIds });
};

export const getGroupUsers = (groupId: number) => {
  return request.get<{ userIds: number[] }>(`/api/system/groups/${groupId}/users`);
};

export const updateGroupUsers = (groupId: number, userIds: number[]) => {
  return request.put<{ userIds: number[] }>(`/api/system/groups/${groupId}/users`, { userIds });
};
