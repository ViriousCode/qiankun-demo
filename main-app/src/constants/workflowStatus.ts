export type StatusTagIcon = {
  outline: string;
  solid: string;
};

import iconTagOverdue from '@/assets/image/tag/icon_tag_overdue.svg';
import iconTagOverdueLine from '@/assets/image/tag/icon_tag_overdue_line.svg';
import iconTagTerminated from '@/assets/image/tag/icon_tag_terminated.svg';
import iconTagTerminatedLine from '@/assets/image/tag/icon_tag_terminated_line.svg';
import iconTagProgress from '@/assets/image/tag/icon_tag_progress.svg';
import iconTagProgressLine from '@/assets/image/tag/icon_tag_progress_line.svg';
import iconTagNotStart from '@/assets/image/tag/icon_tag_notstart.svg';
import iconTagNotStartLine from '@/assets/image/tag/icon_tag_notstart_line.svg';
import iconTagCompleted from '@/assets/image/tag/icon_tag_completed.svg';
import iconTagCompletedLine from '@/assets/image/tag/icon_tag_completed_line.svg';
import iconTagReject from '@/assets/image/tag/icon_tag_reject.svg';
import iconTagRejectLine from '@/assets/image/tag/icon_tag_reject_line.svg';

/** 与 el-tag `type` 一致 */
export type StatusTagType = 'success' | 'primary' | 'warning' | 'info' | 'danger';

export interface StatusTagMeta {
  label: string;
  tagType: StatusTagType;
  /** 使用 src/assets/image/tag 下的图标 */
  icon?: StatusTagIcon;
  /** 图标尺寸（px），不填则用组件默认值 */
  iconSize?: number;
  /** 描边态（outline）背景色，按设计稿固定值 */
  outlineBg?: string;
  /** 个别业务（如账号启用/禁用）需要固定尺寸/边框 */
  style?: {
    width?: string;
    height?: string;
    borderRadius?: string;
    background?: string;
    border?: string;
    padding?: string;
  };
}

/** 与设计/后端约定的流程状态 key */
export const WORKFLOW_STATUS_KEYS = [
  'OVERDUE',
  'TERMINATED',
  'IN_PROGRESS',
  'NOT_STARTED',
  'COMPLETED',
  'RETURNED',
  // 运行状态
  'RUN_DISABLED',
  'RUNNING',
  // 处置状态
  'DISPOSAL_PROCESSING',
  'DISPOSAL_PENDING',
  'DISPOSAL_DONE',
  // 发布状态
  'PUBLISHED',
  'DRAFT',
  // 应用状态（平台/单点/外部应用）
  'APP_PUBLISHED',
  'APP_UNPUBLISHED'
] as const;

export type WorkflowStatusKey = (typeof WORKFLOW_STATUS_KEYS)[number];

const WORKFLOW_STATUS_MAP: Record<WorkflowStatusKey, StatusTagMeta> = {
  OVERDUE: {
    label: '已逾期',
    tagType: 'danger',
    icon: { solid: iconTagOverdue, outline: iconTagOverdueLine },
    outlineBg: 'rgba(254, 240, 240, 1)'
  },
  TERMINATED: {
    label: '已终止',
    tagType: 'info',
    icon: { solid: iconTagTerminated, outline: iconTagTerminatedLine },
    outlineBg: 'rgba(244, 244, 245, 1)'
  },
  IN_PROGRESS: {
    label: '进行中',
    tagType: 'warning',
    icon: { solid: iconTagProgress, outline: iconTagProgressLine },
    outlineBg: 'rgba(252, 246, 236, 1)'
  },
  NOT_STARTED: {
    label: '未开始',
    tagType: 'info',
    icon: { solid: iconTagNotStart, outline: iconTagNotStartLine },
    outlineBg: 'rgba(244, 244, 245, 1)'
  },
  COMPLETED: {
    label: '已完成',
    tagType: 'success',
    icon: { solid: iconTagCompleted, outline: iconTagCompletedLine },
    outlineBg: 'rgba(240, 249, 235, 1)'
  },
  RETURNED: {
    label: '被退回',
    tagType: 'danger',
    icon: { solid: iconTagReject, outline: iconTagRejectLine },
    outlineBg: 'rgba(255, 238, 239, 1)'
  },

  // ===== 红框：运行状态 / 处置状态 / 发布状态 =====
  RUN_DISABLED: {
    label: '已停用',
    tagType: 'info',
    icon: { solid: iconTagTerminated, outline: iconTagTerminatedLine },
    outlineBg: 'rgba(244, 244, 245, 1)'
  },
  RUNNING: {
    label: '运行中',
    tagType: 'warning',
    icon: { solid: iconTagProgress, outline: iconTagProgressLine },
    outlineBg: 'rgba(252, 246, 236, 1)'
  },

  DISPOSAL_PROCESSING: {
    label: '处置中',
    tagType: 'warning',
    icon: { solid: iconTagProgress, outline: iconTagProgressLine },
    outlineBg: 'rgba(252, 246, 236, 1)'
  },
  DISPOSAL_PENDING: {
    label: '待处置',
    tagType: 'info',
    icon: { solid: iconTagNotStart, outline: iconTagNotStartLine },
    outlineBg: 'rgba(244, 244, 245, 1)'
  },
  DISPOSAL_DONE: {
    label: '已处置',
    tagType: 'success',
    icon: { solid: iconTagCompleted, outline: iconTagCompletedLine },
    outlineBg: 'rgba(240, 249, 235, 1)'
  },

  PUBLISHED: {
    label: '已发布',
    tagType: 'success',
    icon: { solid: iconTagCompleted, outline: iconTagCompletedLine },
    outlineBg: 'rgba(240, 249, 235, 1)'
  },
  DRAFT: {
    label: '草稿',
    tagType: 'info',
    icon: { solid: iconTagNotStart, outline: iconTagNotStartLine },
    outlineBg: 'rgba(244, 244, 245, 1)'
  },

  APP_PUBLISHED: {
    label: '已上架',
    tagType: 'success',
    icon: { solid: iconTagCompleted, outline: iconTagCompletedLine },
    outlineBg: 'rgba(240, 249, 235, 1)'
  },
  APP_UNPUBLISHED: {
    label: '未上架',
    tagType: 'info',
    icon: { solid: iconTagNotStart, outline: iconTagNotStartLine },
    outlineBg: 'rgba(244, 244, 245, 1)'
  }
};

export function getWorkflowStatusMeta(key: string): StatusTagMeta | null {
  if (!(key in WORKFLOW_STATUS_MAP)) return null;
  return WORKFLOW_STATUS_MAP[key as WorkflowStatusKey];
}
