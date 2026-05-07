import request from '@/utils/request';

/** 待办状态：待处理 | 已处理 */
export type TodoStatus = 'pending' | 'done';

/** 待办单项（与后端接口返回对齐） */
export interface TodoItem {
  id: string;
  category: string;
  /** 来源应用 key（子应用 name/shortName/code；主应用可用 'main'） */
  appKey?: string;
  createTime: string;
  desc: string;
  deadline: string;
  status: TodoStatus;
  assigneeAvatar?: string;
  /** 完成时间（已办事项可能返回） */
  completeTime?: string;
  /** 详情页标题 */
  title?: string;
  /** 详情页长描述 */
  detailDesc?: string;
}

export interface TodoListParams {
  status: TodoStatus;
  pageIndex: number;
  pageSize: number;
  /** 按来源应用筛选 */
  appKey?: string;
  /** 按待办内容筛选（desc/title 模糊匹配） */
  keyword?: string;
}

/** 列表接口返回结构 */
export interface TodoListResult {
  list: TodoItem[];
  total: number;
  /** 待处理总数（可选，后端返回则用于 Tab 展示） */
  pendingCount?: number;
  /** 已处理总数（可选，后端返回则用于 Tab 展示） */
  doneCount?: number;
}

/**
 * 获取待办列表（接口返回 list、total，可选 pendingCount、doneCount）
 */
export const getTodoList = (params: TodoListParams) => {
  return request.get<TodoListResult>('/api/profile/todo/list', { params });
};

/**
 * 获取待办详情（接口返回单条）
 */
export const getTodoDetail = (id: string) => {
  return request.get<TodoItem>(`/api/profile/todo/detail/${id}`);
};

/**
 * 处理待办
 */
export const processTodo = (id: string) => {
  return request.post(`/api/profile/todo/${id}/process`);
};
