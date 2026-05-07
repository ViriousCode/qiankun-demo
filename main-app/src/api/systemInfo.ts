import request from '@/utils/request';

export interface SystemInfo {
  id: number;
  title: string;
  infoCategory: string;
  infoType: 'internal' | 'external';
  externalLink?: string;
  publisher: string;
  content: string;
  status: number;
  publishTime?: string;
  updateTime?: string;
}

export interface SystemInfoListParams {
  title?: string;
  infoCategory?: string;
  infoType?: 'internal' | 'external';
  status?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface SystemInfoSavePayload {
  title: string;
  infoCategory: string;
  infoType: 'internal' | 'external';
  externalLink?: string;
  publisher: string;
  content: string;
  status: number;
  publishTime?: string;
}

export const getSystemInfoList = (params: SystemInfoListParams) => {
  return request.get<{ list: SystemInfo[]; total: number }>('/api/system/infos', { params });
};

export const getSystemInfoDetail = (id: number) => {
  return request.get<SystemInfo>(`/api/system/infos/${id}`);
};

export const addSystemInfo = (data: SystemInfoSavePayload) => {
  return request.post<SystemInfo>('/api/system/infos', data);
};

export const updateSystemInfo = (id: number, data: Partial<SystemInfoSavePayload>) => {
  return request.put<SystemInfo>(`/api/system/infos/${id}`, data);
};

export const deleteSystemInfo = (id: number) => {
  return request.delete(`/api/system/infos/${id}`);
};
