import request from '@/utils/request';

export type UserSource = 'platform' | 'third' | 'zzd';

export interface SystemUser {
  id: number;
  source: UserSource;
  externalId?: string;
  name: string;
  /** 登录认证标识（用户名 / 手机号等，与账号类型对应） */
  authIdentifier?: string;
  /** 账号类型：用户名 / 手机号 / 浙政钉（平台用户创建账号时使用） */
  accountType?: '' | 'name' | 'phone' | 'zzd';
  nickName?: string;
  gender?: string;
  phone?: string;
  email?: string;
  status?: number;
  createTime?: string;
  /** 是否锁定 */
  locked?: boolean;
  /** 锁定截止时间 */
  lockEndTime?: string;
  /** 最后登录时间 */
  lastLoginTime?: string;
  /** 最后登录 IP */
  lastLoginIp?: string;
  orgId?: number | null;
  orgName?: string;
  tenantId?: number | null;
  /** 列表展示用，可由后端拼接 */
  tenantName?: string;
  /** 平台用户绑定的角色 id 列表（角色在角色管理中配置） */
  roleIds?: number[];
  /** 仅外部用户：绑定到的平台用户 id（后端拼接返回） */
  platformUserId?: number | null;
}

export interface SystemUserListParams {
  source?: 'platform' | 'third' | 'zzd' | 'all';
  accountType?: '' | 'name' | 'phone' | 'zzd';
  /** 关键字：后端 mock 会用 keyword 或 name 进行模糊匹配 */
  keyword?: string;
  /** 姓名/昵称等关键词筛选（与 serve 查询参数 name 一致） */
  name?: string;
  orgId?: number;
  tenantId?: number;
  /** 为 true 时仅返回未关联租户的用户 */
  tenantEmpty?: boolean;
  status?: number;
  pageIndex?: number;
  pageSize?: number;
}

export const getSystemUserList = (params: SystemUserListParams) => {
  return request.get<{ list: SystemUser[]; total: number }>('/api/system/users', { params });
};

export const addSystemUser = (
  data: Omit<SystemUser, 'id' | 'source' | 'externalId' | 'createTime'>
) => {
  return request.post<SystemUser>('/api/system/users', data);
};

export const updateSystemUser = (
  id: number,
  data: Partial<Omit<SystemUser, 'id' | 'source' | 'externalId' | 'createTime'>>
) => {
  return request.put(`/api/system/users/${id}`, data);
};

export const deleteSystemUser = (id: number) => {
  return request.delete(`/api/system/users/${id}`);
};

export const bindExternalUser = (data: { externalUserId: number; platformUserId: number }) => {
  return request.post('/api/system/users/bind', data);
};

export const unbindExternalUser = (data: { externalUserId: number }) => {
  return request.post('/api/system/users/unbind', data);
};

/** 解锁账号（清除锁定状态） */
export const unlockSystemUser = (id: number) => {
  return request.post(`/api/system/users/${id}/unlock`);
};

/** 重置密码（仅平台用户名账号） */
export const resetSystemUserPassword = (id: number, data?: { password?: string }) => {
  return request.post(`/api/system/users/${id}/reset-password`, data);
};
