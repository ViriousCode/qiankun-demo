import request from '@/utils/request';

export type OrgSource = 'platform' | 'zzd';

export interface OrgNode {
  id: number;
  parentId: number | null;
  orgCode?: string;
  name: string;
  leader?: string;
  phone?: string;
  status?: number;
  sort?: number;
  updateTime?: string;
  children?: OrgNode[];
}

export interface OrgQueryParams {
  source?: OrgSource;
  orgCode?: string;
  name?: string;
  status?: number | string;
  tenantId?: number;
}

export const getOrgTree = (params: OrgQueryParams = {}) => {
  return request.get<OrgNode[]>('/api/system/org/tree', { params });
};

export const addOrgNode = (data: {
  parentId: number | null;
  name: string;
  sort?: number;
  orgCode?: string;
  leader?: string;
  phone?: string;
  status?: number;
}) => {
  return request.post<OrgNode>('/api/system/org/node', data);
};

export const updateOrgNode = (
  id: number,
  data: Partial<Pick<OrgNode, 'name' | 'sort' | 'orgCode' | 'leader' | 'phone' | 'status'>>
) => {
  return request.put(`/api/system/org/node/${id}`, data);
};

export const deleteOrgNode = (id: number) => {
  return request.delete(`/api/system/org/node/${id}`);
};

export const updateOrgContact = (id: number, data: { leader?: string; phone?: string }) => {
  return request.put(`/api/system/org/contact/${id}`, data);
};

export const getOrgPersonnel = (id: number) => {
  return request.get<{ userIds: number[]; list: { id: number; name: string; nickName: string }[] }>(
    `/api/system/org/personnel/${id}`
  );
};

export const updateOrgPersonnel = (id: number, userIds: number[]) => {
  return request.put(`/api/system/org/personnel/${id}`, { userIds });
};

export const getOrgUserOptions = () => {
  return request.get<
    {
      id: number;
      name: string;
      nickName: string;
      orgId?: number | null;
      orgName?: string;
    }[]
  >('/api/system/org/users');
};

export const importZzdOrg = () => {
  return request.post<{ importedAt: string }>('/api/system/org/import/zzd');
};
