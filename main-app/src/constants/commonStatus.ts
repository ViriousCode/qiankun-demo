import type { StatusTagMeta } from '@/constants/workflowStatus';
import iconVisibleDot from '@/assets/image/tag/icon_tag_visible_dot.svg';
import iconHiddenDot from '@/assets/image/tag/icon_tag_hidden_dot.svg';

const ACCOUNT_STATUS_MAP: Record<'0' | '1', StatusTagMeta> = {
  '1': {
    label: '启用',
    tagType: 'success',
    outlineBg: 'rgba(240, 249, 235, 1)',
    style: {
      width: '49px',
      height: '24px',
      background: '#F0F9EB',
      borderRadius: '0px!important',
      border: '1px solid #E1F3D8',
      padding: '0'
    }
  },
  '0': {
    label: '禁用',
    tagType: 'danger',
    outlineBg: 'rgba(244, 244, 245, 1)',
    style: {
      width: '49px',
      height: '24px',
      background: '#FEF0F0',
      borderRadius: '0px!important',
      border: '1px solid #FDE2E2',
      padding: '0'
    }
  }
};

export function getAccountStatusMeta(key: string | number): StatusTagMeta | null {
  const k = String(key);
  if (k === '0' || k === '1') {
    return ACCOUNT_STATUS_MAP[k];
  }
  return null;
}

const MENU_VISIBLE_MAP: Record<'0' | '1', StatusTagMeta> = {
  '1': {
    label: '展示',
    tagType: 'success',
    icon: { solid: iconVisibleDot, outline: iconVisibleDot },
    iconSize: 8,
    outlineBg: 'rgba(240, 249, 235, 1)',
    style: {
      height: '20px',
      borderRadius: '999px',
      padding: '0 12px'
    }
  },
  '0': {
    label: '隐藏',
    tagType: 'info',
    icon: { solid: iconHiddenDot, outline: iconHiddenDot },
    iconSize: 8,
    outlineBg: 'rgba(244, 244, 245, 1)',
    style: {
      height: '20px',
      borderRadius: '999px',
      padding: '0 12px'
    }
  }
};

export function getMenuVisibleMeta(key: string | number): StatusTagMeta | null {
  const k = String(key);
  if (k === '0' || k === '1') {
    return MENU_VISIBLE_MAP[k];
  }
  return null;
}

const SECURITY_STATUS_MAP: Record<'SET' | 'BOUND' | 'UNBOUND', StatusTagMeta> = {
  SET: {
    label: '已设置',
    tagType: 'success',
    icon: { solid: iconVisibleDot, outline: iconVisibleDot },
    iconSize: 8,
    outlineBg: 'rgba(240, 249, 235, 1)',
    style: {
      height: '20px',
      borderRadius: '999px',
      padding: '0 12px'
    }
  },
  BOUND: {
    label: '已绑定',
    tagType: 'success',
    icon: { solid: iconVisibleDot, outline: iconVisibleDot },
    iconSize: 8,
    outlineBg: 'rgba(240, 249, 235, 1)',
    style: {
      height: '20px',
      borderRadius: '999px',
      padding: '0 12px'
    }
  },
  UNBOUND: {
    label: '未绑定',
    tagType: 'info',
    icon: { solid: iconHiddenDot, outline: iconHiddenDot },
    iconSize: 8,
    outlineBg: 'rgba(244, 244, 245, 1)',
    style: {
      height: '20px',
      borderRadius: '999px',
      padding: '0 12px'
    }
  }
};

export function getSecurityStatusMeta(key: string | number): StatusTagMeta | null {
  const k = String(key) as keyof typeof SECURITY_STATUS_MAP;
  if (k in SECURITY_STATUS_MAP) return SECURITY_STATUS_MAP[k];
  return null;
}

/**
 * 个人中心 - 待办详情页「类别」Tag 元信息
 * 文案由调用方通过 StatusTag 的 labelOverride 传入
 */
export function getTodoCategoryMeta(): StatusTagMeta {
  return {
    label: '',
    tagType: 'primary',
    outlineBg: 'rgba(237, 244, 255, 1)',
    style: {
      height: '22px',
      borderRadius: '6px',
      padding: '0 10px'
    }
  };
}
