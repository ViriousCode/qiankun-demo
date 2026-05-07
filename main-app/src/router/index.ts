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
    name: 'Layout',
    redirect: '/workbench',
    children: [
      {
        path: '/profile/info',
        name: 'ProfileInfo',
        component: () => import('@/views/profile/info/index.vue'),
        meta: { title: '个人中心', hidden: true }
      },
      {
        path: '/profile/apps',
        name: 'ProfileApps',
        component: () => import('@/views/profile/apps/index.vue'),
        meta: { title: '我的应用', hidden: true }
      },
      {
        path: '/profile/todo',
        name: 'ProfileTodo',
        component: () => import('@/views/profile/todo/index.vue'),
        meta: { title: '我的待办', hidden: true }
      },
      {
        path: '/profile/message',
        name: 'ProfileMessage',
        component: () => import('@/views/profile/message/index.vue'),
        meta: { title: '我的消息', hidden: true }
      },
      {
        path: '/profile/message/detail',
        name: 'ProfileMessageDetail',
        component: () => import('@/views/profile/message/detail.vue'),
        meta: { title: '消息详情', hidden: true }
      },
      {
        path: '/profile/todo/detail',
        name: 'ProfileTodoDetail',
        component: () => import('@/views/profile/todo/detail.vue'),
        meta: { title: '待办详情', hidden: true }
      },
      {
        path: '/:pathMatch(.*)*',
        component: () => import('@/views/error/404.vue'), // 一个空的 <div /> 组件
        meta: { title: '页面不存在', hidden: true }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 简单的路由守卫
router.beforeEach((to, _from, next) => {
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

router.afterEach((to) => {
  // 动态匹配微应用前缀：由权限/菜单加载时写入 window.__MICRO_ACTIVE_RULES__
  // 避免在这里 import permissionStore 导致 router<->store 循环依赖
  const prefixes = ((window as any).__MICRO_ACTIVE_RULES__ as string[]) || [];
  const hit = prefixes.some((p) => to.path === p || to.path.startsWith(`${p}/`));
  if (hit) {
    // 2. 派发自定义事件，携带最新的路径
    window.dispatchEvent(
      new CustomEvent('micro-app-route-change', {
        detail: { path: to.path }
      })
    );
  }
});

export default router;
