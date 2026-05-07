import request from '@/utils/request';

export interface LinkItem {
  id?: number;
  name: string;
  url: string;
  sort: number;
  status?: number;
  createTime?: string;
}

export const getLinkList = (params?: { name?: string; status?: number | string }) => {
  return request.get<LinkItem[]>('/api/link', { params });
};

export const addLink = (data: Omit<LinkItem, 'id' | 'createTime'>) => {
  return request.post<LinkItem>('/api/link', data);
};

export const updateLink = (id: number, data: Partial<LinkItem>) => {
  return request.put(`/api/link/${id}`, data);
};

export const deleteLink = (id: number) => {
  return request.delete(`/api/link/${id}`);
};

export const batchDeleteLink = (ids: number[]) => {
  return request.delete('/api/link/batch', { data: { ids } });
};
