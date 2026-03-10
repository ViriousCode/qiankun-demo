import request from '@/utils/request';

export interface DictItem {
  id?: number;
  dictName: string;
  dictType: string;
  status?: number;
  remark?: string;
  createTime?: string;
}

/** 获取字典列表 */
export const getDictList = () => {
  return request.get<DictItem[]>('/api/dict');
};

/** 新增字典 */
export const addDict = (data: DictItem) => {
  return request.post('/api/dict', data);
};

/** 修改字典 */
export const updateDict = (id: number, data: Partial<DictItem>) => {
  return request.put(`/api/dict/${id}`, data);
};

/** 删除字典 */
export const deleteDict = (id: number) => {
  return request.delete(`/api/dict/${id}`);
};
