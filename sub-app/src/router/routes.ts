import type { RouteRecordRaw } from 'vue-router';

// 静态路由：定义好父节点 LayoutRoot
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'LayoutRoot', // 必须叫这个名字，addRoute 要用
    component: () => import('@/layout/index.vue'), // 子应用的布局组件
    redirect: '/testView1',
    children: [] // 初始为空
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/loading.vue') // Loading页
  }
];

// 动态路由
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: 'testView1',
    name: 'testView1',
    component: () => import('@/views/TestView1.vue'),
    meta: { title: '订单列表', permission: 'sub:order:list' }
  },
  {
    path: 'testView2',
    name: 'testView2',
    component: () => import('@/views/TestView2.vue'),
    meta: { title: '订单详情', permission: 'sub:order:detail' }
  },
  // 【新增】：角色管理路由
  {
    path: 'role', // 这里不需要写 /sub-app/，因为 Base 已经是 /sub-app/ 了
    name: 'RoleManage',
    component: () => import('@/views/Setting/RoleView/index.vue'), // 确保你之前创建了这个文件
    meta: { title: '角色管理', permission: 'sub:role:list' }
  },
  {
    path: 'noAuth',
    name: 'noAuth',
    component: () => import('@/views/NoAuth.vue'),
    meta: { title: '管理员专享', permission: 'sub:admin' }
  }
];