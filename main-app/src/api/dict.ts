import request from '@/utils/request';

export interface DictItem {
  id?: number;
  name: string;
  code: string;
  value?: number;
  sort?: number;
  categoryId?: number | null;
  categoryName?: string;
  categoryCode: string;
  status?: number;
  ext?: string;
  description?: string;
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

export interface DictCategory {
  id?: number;
  categoryName: string;
  categoryCode: string;
  status?: number;
  sort?: number;
  description?: string;
  createTime?: string;
}

export const getDictCategoryList = () => {
  return request.get<DictCategory[]>('/api/dict-category');
};

export const addDictCategory = (data: DictCategory) => {
  return request.post('/api/dict-category', data);
};

export const updateDictCategory = (id: number, data: Partial<DictCategory>) => {
  return request.put(`/api/dict-category/${id}`, data);
};

export const deleteDictCategory = (id: number) => {
  return request.delete(`/api/dict-category/${id}`);
};
