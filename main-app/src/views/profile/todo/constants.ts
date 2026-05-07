/** 待办 Tab：待处理 | 已处理 */
export type TodoTab = 'pending' | 'done';

/** 个人中心待办单项 */
export interface ProfileTodoItem {
  id: string;
  category: string;
  /** 来源应用 key（子应用 name/shortName/code；主应用可用 'main'） */
  appKey?: string;
  createTime: string;
  desc: string;
  deadline: string;
  /** 完成时间（已办事项可能返回） */
  completeTime?: string;
  status: TodoTab;
  assigneeAvatar?: string;
  /** 详情页标题，不填则用 desc */
  title?: string;
  /** 详情页长描述，不填则用 desc */
  detailDesc?: string;
}

/** 默认每页条数 */
export const DEFAULT_PAGE_SIZE = 10;
