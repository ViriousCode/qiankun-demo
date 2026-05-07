import request from '@/utils/request';

export interface SystemTenant {
  id: number;
  tenantName: string;
  shortName: string;
  tenantCode: string;
  adminName: string;
  status?: number;
  createTime?: string;
  /** 列表由后端聚合 */
  appCount?: number;
  userCount?: number;
}

export interface SystemTenantListParams {
  tenantName?: string;
  status?: number;
  pageIndex?: number;
  pageSize?: number;
}

export const getSystemTenantList = (params: SystemTenantListParams) => {
  return request.get<{ list: SystemTenant[]; total: number }>('/api/system/tenants', { params });
};

export const addSystemTenant = (
  data: Omit<SystemTenant, 'id' | 'createTime' | 'appCount' | 'userCount'>
) => {
  return request.post<SystemTenant>('/api/system/tenants', data);
};

export const updateSystemTenant = (
  id: number,
  data: Partial<Omit<SystemTenant, 'id' | 'createTime' | 'appCount' | 'userCount'>>
) => {
  return request.put(`/api/system/tenants/${id}`, data);
};

export const deleteSystemTenant = (id: number) => {
  return request.delete(`/api/system/tenants/${id}`);
};

export interface TenantAuthorizedApps {
  appIds: number[];
}

export const getTenantAuthorizedApps = (tenantId: number) => {
  return request.get<TenantAuthorizedApps>(`/api/system/tenants/${tenantId}/apps`);
};

export const updateTenantAuthorizedApps = (tenantId: number, appIds: number[]) => {
  return request.put<TenantAuthorizedApps>(`/api/system/tenants/${tenantId}/apps`, { appIds });
};
