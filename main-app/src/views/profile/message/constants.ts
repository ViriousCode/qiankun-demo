export type MessageTab = 'unread' | 'read';

export interface ProfileMessageItem {
  id: string;
  title: string;
  summary: string;
  detailContent?: string;
  publishTime: string;
  status: MessageTab;
  level: 'warning' | 'danger';
  category: string;
  /** 来源应用 key（子应用 name/shortName/code；主应用可用 'main'） */
  sourceApp?: string;
}

export const DEFAULT_PAGE_SIZE = 10;
