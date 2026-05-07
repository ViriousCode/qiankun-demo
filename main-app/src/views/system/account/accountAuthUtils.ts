import type { SystemUser } from '@/api/systemUser';

const isMobile = (value?: string) => /^1\d{10}$/.test(String(value || '').trim());

/** 是否为浙政钉来源 */
function isZzdSource(row: SystemUser): boolean {
  return row.source === 'zzd' || String(row.externalId || '').startsWith('ZZD_');
}

/**
 * 认证方式（用户名 / 手机号 / 浙政钉），与列表标签业务判断一致。
 * 平台用户仅用 name、phone 判断，不混入 externalId，避免与第三方账号混淆。
 */
export function getAccountAuthKind(row: SystemUser): '用户名' | '手机号' | '浙政钉' {
  if (isZzdSource(row)) return '浙政钉';

  if (row.source === 'platform') {
    if (isMobile(row.name) || isMobile(row.phone)) return '手机号';
    return '用户名';
  }

  // 第三方等外部账号：可用 externalId / phone 辅助判断手机号形态
  if (isMobile(row.name) || isMobile(row.externalId) || isMobile(row.phone)) return '手机号';
  return '用户名';
}

/** @deprecated 使用 getAccountAuthKind */
export function getAccountAuthLabel(row: SystemUser): '用户名' | '手机号' | '浙政钉' {
  return getAccountAuthKind(row);
}

/** 认证标识展示值（与标签分列） */
export function getAccountAuthValue(row: SystemUser): string {
  const kind = getAccountAuthKind(row);
  if (kind === '浙政钉') {
    return row.name || row.externalId || '-';
  }
  if (kind === '手机号') {
    if (row.source === 'platform') {
      return isMobile(row.name) ? String(row.name).trim() : row.phone || '-';
    }
    if (isMobile(row.name)) return String(row.name).trim();
    if (isMobile(row.externalId)) return String(row.externalId).trim();
    return row.phone || '-';
  }
  return row.name || '-';
}

export type AccountAuthIconKind = 'user' | 'phone' | 'grid';

export function getAccountAuthIconKind(row: SystemUser): AccountAuthIconKind {
  const kind = getAccountAuthKind(row);
  if (kind === '浙政钉') return 'grid';
  if (kind === '手机号') return 'phone';
  return 'user';
}

/** 用户名类型且未锁定显示重置密码 */
export function showAccountResetPassword(row: SystemUser): boolean {
  return getAccountAuthKind(row) === '用户名' && row.locked !== true;
}

export function showAccountUnlock(row: SystemUser): boolean {
  return row.locked === true;
}
