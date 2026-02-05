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
    path: '/sub-app', // 一级菜单路径
    title: '订单系统',
    icon: 'Shop',
    permission: 'sub:order:list', // 只要有列表权限，就显示这个父菜单
    children: [
      {
        path: '/sub-app/testView1', // 注意：路径要写全 /sub-app/xxx
        title: '订单列表',
        permission: 'sub:order:list'
      },
      {
        path: '/sub-app/testView2',
        title: '订单详情',
        permission: 'sub:order:detail'
      }
    ]
  }
];