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
        path: 'system',
        name: 'System',
        meta: { title: '系统管理' },
        // 可以选择使用空 Layout 或直接 Component: undefined (如果只是目录)
        // 这里为了简单，假设它是一个嵌套路由的父级，不需要特定 Component
        children: [
          {
            path: 'menu',
            name: 'MenuManage',
            component: () => import('@/views/system/menu/index.vue'),
            meta: { title: '菜单管理' }
          },
          {
            path: 'role',
            name: 'RoleManage',
            component: () => import('@/views/system/role/index.vue'),
            meta: { title: '角色管理' }
          }
        ]
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

router.afterEach((to) => {
  // 1. 判断是否进入了子应用路径 (假设子应用前缀是 /sub-app)
  if (to.path.startsWith('/sub-app')) {
    // 2. 派发自定义事件，携带最新的路径
    window.dispatchEvent(
      new CustomEvent('micro-app-route-change', {
        detail: { path: to.path }
      })
    );
  }
});

export default router;