import request from '@/utils/request';

export type MenuFormKind = 'route' | 'link';
export type MenuOpenMode = 'current' | 'other';

export interface Menu {
  id?: number;
  parentId?: number | null;
  title: string;
  path: string;
  icon?: string;
  sort?: number;
  permission?: string;
  type?: 'directory' | 'menu' | 'button';
  app?: string;
  hidden?: boolean;
  /** 关联的 API ID 列表 */
  apiIds?: number[];
  /** 菜单形式：路由 / 链接 */
  menuForm?: MenuFormKind;
  /** 打开方式：本页面 / 某页面 */
  openMode?: MenuOpenMode;
  name?: string;
  menuName?: string;
  disabled?: boolean;
  children?: Menu[];
}

/** 权限录入固定前缀（展示用） */
export const PERMISSION_PLATFORM_PREFIX = 'platform:';

/** 编辑时拆出后缀输入框内容：platform: 开头则去前缀，否则保留整段（兼容旧数据） */
export function permissionToSuffix(permission?: string): string {
  if (!permission) return '';
  if (permission.startsWith(PERMISSION_PLATFORM_PREFIX)) {
    return permission.slice(PERMISSION_PLATFORM_PREFIX.length);
  }
  return permission;
}

/** 保存时：无冒号的短码补全 platform:；含冒号且非 platform: 前缀的视为旧格式原样保存 */
export function suffixToPermission(suffix: string): string {
  const s = suffix.trim();
  if (!s) return '';
  if (s.startsWith(PERMISSION_PLATFORM_PREFIX)) return s;
  if (s.includes(':')) return s;
  return `${PERMISSION_PLATFORM_PREFIX}${s}`;
}

// 获取菜单列表
export const getMenuList = () => {
  return request.get<Menu[]>('/api/menus');
};

// 新增菜单
export const addMenu = (data: Menu) => {
  return request.post<Menu>('/api/menus', data);
};

// 更新菜单
export const updateMenu = (id: number, data: Partial<Menu>) => {
  return request.put<any>(`/api/menus/${id}`, data);
};

// 删除菜单
export const deleteMenu = (id: number) => {
  return request.delete<any>(`/api/menus/${id}`);
};
