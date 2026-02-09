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
    path: '/test/list',
    name: 'testView1',
    component: () => import('@/views/TestView1.vue'),
    meta: { title: '订单列表', permission: 'sub:test:list' }
  },
  {
    path: '/test/detail',
    name: 'testView2',
    component: () => import('@/views/TestView2.vue'),
    meta: { title: '订单详情', permission: 'sub:test:detail' }
  },
  {
    path: 'noAuth',
    name: 'noAuth',
    component: () => import('@/views/NoAuth.vue'),
    meta: { title: '管理员专享', permission: 'sub:admin' }
  }
];