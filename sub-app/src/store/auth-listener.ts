import { watch } from 'vue';
import { asyncRoutes } from '@/router/routes';
import { useUserStore } from '@/store/user'; // 子应用的 store

// 简单的权限过滤函数
const filterRoutes = (routes: any[], perms: string[]) => {
  return routes.filter(route => {
    return route.meta?.permission ? perms.includes(route.meta.permission) : true;
  });
};

export function setupGlobalState(props: any, router: any) {
  const userStore = useUserStore();

  watch(
    () => props.globalData?.auth?.permissions,
    async (newPerms) => {
      if (!newPerms || !router) return;

      console.log('[子应用] 接收到权限:', newPerms);
      
      // 1. 过滤路由
      const accessedRoutes = filterRoutes(asyncRoutes, newPerms);
      
      // 2. 同步到 Store (触发菜单上报)
      userStore.dynamicMenus = accessedRoutes;

      // 3. 动态挂载
      const hasLayout = router.hasRoute('LayoutRoot');
      if (hasLayout) {
        accessedRoutes.forEach((route: any) => {
          if (!router.hasRoute(route.name)) {
            // 【关键】：深拷贝并去掉开头的 /
            const routeToMount = { ...route };
            if (routeToMount.path.startsWith('/')) {
              routeToMount.path = routeToMount.path.substring(1);
            }
            router.addRoute('LayoutRoot', routeToMount);
          }
        });
      }

      // 4. 解决 Loading/404 卡死与路径纠正
      if (!props.isSilent) {
        await router.isReady();
        const currentPath = router.currentRoute.value.fullPath;
        
        // 如果卡在 Loading，或者误读了主应用的 dashboard 路径
        if (
            router.currentRoute.value.name === 'NotFound' || 
            currentPath === '/' || 
            currentPath.includes('/dashboard')
        ) {
          console.log('[子应用] 路径纠正 -> /testView1');
          router.replace('/testView1');
        }
      }
    },
    { immediate: true, deep: true }
  );
}