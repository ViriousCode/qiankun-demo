import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue';
import { useUserStore } from '@/store/user';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '控制台' }
      },
       {
        path: '403',
        name: '403',
        component: () => import('@/views/error/403.vue'),
        meta: { title: '无权限访问' }
      },
      {
        path: '404',
        name: '404',
        component: () => import('@/views/error/404.vue'),
        meta: { title: '页面未找到' }
      },
      // 子应用的路由不需要在这里配，那是 Layout 里的 activeRule 的事
      {
        path: '/sub-app/:pathMatch(.*)*',
        component: () => import('@/layout/empty.vue'), // 一个空的 <div /> 组件
        meta: { title: '子应用' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 简单的路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const token = userStore.token;

  if (to.path === '/login') {
    if (token) {
      next('/'); // 已登录则跳转首页
    } else {
      next();
    }
  } else {
    if (token) {
      next();
    } else {
      next('/login'); // 未登录跳转登录页
    }
  }
});

export default router;