// main-app/src/config/menu.ts

export interface MenuItem {
  path: string;
  title: string;
  icon?: string;
  permission?: string; // 权限标识
  children?: MenuItem[];
}