import request from '@/utils/request';
import type { FormDefinition, FormDefinitionListParams, FormSubmission } from '@/types/formBuilder';

export const getFormDefinitionList = (params: FormDefinitionListParams) => {
  return request.get<{ list: FormDefinition[]; total: number }>('/api/system/form-definitions', {
    params
  });
};

export const addFormDefinition = (
  data: Omit<FormDefinition, 'id' | 'createTime' | 'updateTime'>
) => {
  return request.post<FormDefinition>('/api/system/form-definitions', data);
};

export const getFormDefinitionDetail = (id: number) => {
  return request.get<FormDefinition>(`/api/system/form-definitions/${id}`);
};

export const updateFormDefinition = (
  id: number,
  data: Partial<Omit<FormDefinition, 'id' | 'createTime' | 'updateTime'>>
) => {
  return request.put<FormDefinition>(`/api/system/form-definitions/${id}`, data);
};

export const deleteFormDefinition = (id: number) => {
  return request.delete(`/api/system/form-definitions/${id}`);
};

export interface FormSubmissionListParams {
  pageIndex?: number;
  pageSize?: number;
}

export const getFormSubmissionList = (formId: number, params: FormSubmissionListParams) => {
  return request.get<{ list: FormSubmission[]; total: number }>(
    `/api/system/form-definitions/${formId}/submissions`,
    { params }
  );
};

export const addFormSubmission = (formId: number, payload: Record<string, any>) => {
  return request.post<FormSubmission>(`/api/system/form-definitions/${formId}/submissions`, {
    payload
  });
};
