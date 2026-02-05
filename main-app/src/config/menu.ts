// main-app/src/config/menu.ts

export interface MenuItem {
  path: string;
  title: string;
  icon?: string;
  permission?: string; // 权限标识
  children?: MenuItem[];
}

export const globalMenuConfig: MenuItem[] = [
  {
    path: '/dashboard',
    title: '控制台',
    icon: 'Odometer',
    permission: 'main:dashboard'
  },
  {
    path: '/sub-app',
    title: '订单系统',
    icon: 'Shop',
    permission: 'sub:order:list',
    children: [
      {
        path: '/sub-app/testView1',
        title: '订单列表',
        permission: 'sub:order:list'
      },
      {
        path: '/sub-app/testView2',
        title: '订单详情',
        permission: 'sub:order:detail'
      }
    ]
  },
  {
    path: '/system', // 虚拟路径，用于分组
    title: '系统管理',
    icon: 'Setting', // 使用 Setting 图标
    permission: 'sub:setting',
    children: [
      {
        path: '/sub-app/role', // 对应子应用的 /role 路由
        title: '角色管理',
        permission: 'sub:role:list'
      }
    ]
  }
];