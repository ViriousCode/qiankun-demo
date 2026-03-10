import request from '@/utils/request';

export interface FaultItem {
  id?: number;
  faultCode: string;
  faultName: string;
  level: string;
  status?: number;
  updateTime?: string;
  remark?: string;
  createTime?: string;
}

/** 获取故障码列表（支持 name、level 筛选） */
export const getFaultList = (params?: { name?: string; level?: string }) => {
  return request.get<FaultItem[]>('/api/fault', { params });
};

/** 新增故障码 */
export const addFault = (data: Omit<FaultItem, 'id' | 'createTime' | 'updateTime'>) => {
  return request.post<FaultItem>('/api/fault', data);
};

/** 修改故障码（含状态切换） */
export const updateFault = (id: number, data: Partial<FaultItem>) => {
  return request.put(`/api/fault/${id}`, data);
};

/** 删除故障码 */
export const deleteFault = (id: number) => {
  return request.delete(`/api/fault/${id}`);
};

/** 批量删除故障码 */
export const batchDeleteFault = (ids: number[]) => {
  return request.post('/api/fault/batch-delete', { ids });
};
