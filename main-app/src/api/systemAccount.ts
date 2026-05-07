import request from '@/utils/request';
import type { SystemUser } from './systemUser';

/** 新增账号：为已有关联的平台用户创建外部登录身份并绑定 */
export interface AddSystemAccountBody {
  platformUserId: number;
  accountType: 'name' | 'phone' | 'zzd';
  authIdentifier: string;
  status?: 0 | 1;
}

export const addSystemAccount = (data: AddSystemAccountBody) => {
  return request.post<SystemUser>('/api/system/accounts', data);
};
