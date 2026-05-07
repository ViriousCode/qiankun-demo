import request from '@/utils/request';

export type MessageStatus = 'unread' | 'read';
export type MessageLevel = 'warning' | 'danger';
export type MessageType = MessageLevel;

export interface MessageItem {
  id: string;
  title: string;
  summary: string;
  detailContent?: string;
  publishTime: string;
  status: MessageStatus;
  level: MessageLevel;
  /** message display type; prefer this in UI */
  type?: MessageType;
  /** message source micro-app key (name/shortName/code) */
  sourceApp?: string;
  category: string;
}

export interface MessageListParams {
  status: MessageStatus;
  pageIndex: number;
  pageSize: number;
  /** 来源应用 key（子应用 name/shortName/code；主应用可用 'main'）；不传/空表示全部 */
  sourceApp?: string;
}

export interface MessageListResult {
  list: MessageItem[];
  total: number;
  unreadCount?: number;
  readCount?: number;
}

export const getMessageList = (params: MessageListParams) => {
  return request.get<MessageListResult>('/api/profile/message/list', { params });
};

export const getMessageDetail = (id: string) => {
  return request.get<MessageItem>(`/api/profile/message/detail/${id}`);
};

export const markMessageRead = (id: string) => {
  return request.post(`/api/profile/message/${id}/read`);
};

export const deleteMessage = (id: string) => {
  return request.delete(`/api/profile/message/${id}`);
};
