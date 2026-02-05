import { watch } from 'vue';
import { asyncRoutes } from '@/router/routes';
import { useUserStore } from '@/store/user';
import type { Router } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

// 权限过滤函数
const filterRoutes = (routes: any[], perms: string[]) => {
  return routes.filter(route => {
    return route.meta?.permission ? perms.includes(route.meta.permission) : true;
  });
};

// 【修改点】：不再接收 props，只接收 router
export function setupGlobalState(router: Router) {
  const userStore = useUserStore();

  // 【核心修改】：监听 Store 内部的权限变化
  // 无论是从 props 初始化的，还是通过事件同步过来的，这里都能响应
  watch(
    () => userStore.permissions,
    async (newPerms) => {
      // 1. 基础检查
      if (!newPerms || !router) return;

      // 2. 过滤路由
      const accessedRoutes = filterRoutes(asyncRoutes, newPerms);
      userStore.dynamicMenus = accessedRoutes; // 更新菜单

      // 3. 动态挂载路由
      const hasLayout = router.hasRoute('LayoutRoot');
      if (hasLayout) {
        accessedRoutes.forEach((route: any) => {
          if (!router.hasRoute(route.name)) {
            // 去掉开头的 /，防止路径叠加
            const routeToMount = { ...route };
            if (routeToMount.path.startsWith('/')) {
              routeToMount.path = routeToMount.path.substring(1);
            }
            router.addRoute('LayoutRoot', routeToMount);
          }
        });
      }

      // 4. 路由纠正逻辑 (解决刷新或动态路由未匹配的问题)
      // 使用 setTimeout 确保路由添加完成后再跳转
      setTimeout(async () => {
        let targetPath = '';

        // A. 获取真实路径
        if (qiankunWindow.__POWERED_BY_QIANKUN__) {
          const rawPath = window.location.pathname;
          // 假设 activeRule 是 '/sub-app'
          targetPath = rawPath.replace(/^\/sub-app/, '');
        } else {
          targetPath = window.location.pathname;
        }

        if (!targetPath) targetPath = '/';

        // B. 检查真实路径是否在刚才添加的路由里
        const isTargetInRoutes = accessedRoutes.some((r: any) => {
          const routePath = r.path.startsWith('/') ? r.path : `/${r.path}`;
          return targetPath === routePath || targetPath.startsWith(`${routePath}/`);
        });

        // 只有当目标路由确实在我们的权限列表里，且 router 还没匹配上时，才强制刷新
        if (isTargetInRoutes) {
          router.replace(targetPath).catch(() => { });
        } else if (
          // 【优化】：只在访问根路径时才跳默认页
          // 如果用户访问的是 /testView2，即使暂时没权限，也先别乱跳，
          // 等几十毫秒后主应用发来最新权限，就会自动显示出来的。
          targetPath === '/'
        ) {
          router.replace('/testView1');
        } else {
          // 【新增】：对于 /testView2 这种深层路径，如果暂时没匹配到，
          // 保持静默，等待 "global-sync-permissions" 事件带来的新数据再次触发匹配
        }
      }, 0);
    },
    { immediate: true, deep: true }
  );
}