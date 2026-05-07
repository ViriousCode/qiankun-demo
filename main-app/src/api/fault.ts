import request from '@/utils/request';

export interface FaultItem {
  id?: number;
  faultCode: string;
  faultName: string;
  faultLevel: string;
  suggestion?: string;
  status?: number;
  createTime?: string;
}

/** 获取故障码列表 */
export const getFaultList = (params?: {
  faultCode?: string;
  faultCategory?: string;
  faultLevel?: string;
}) => {
  return request.get<FaultItem[]>('/api/fault', { params });
};

/** 新增故障码 */
export const addFault = (data: Omit<FaultItem, 'id' | 'createTime'>) => {
  return request.post<FaultItem>('/api/fault', data);
};

/** 修改故障码 */
export const updateFault = (id: number, data: Partial<FaultItem>) => {
  return request.put(`/api/fault/${id}`, data);
};

/** 删除故障码 */
export const deleteFault = (id: number) => {
  return request.delete(`/api/fault/${id}`);
};
