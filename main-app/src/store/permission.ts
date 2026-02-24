// main-app/src/store/permission.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getMenuList, type Menu } from '@/api/menu';
import { getAppList } from '@/api/app';
import { useUserStore } from './user';
import { setSharedState } from '@/micro/shared';
import router from '@/router';

const modules = import.meta.glob('../views/**/*.vue');

const filterMenus = (menus: Menu[], perms: string[]): Menu[] => {
  const res: Menu[] = [];
  menus.forEach((menu) => {
    const tmp = { ...menu };
    if (tmp.children) {
      tmp.children = filterMenus(tmp.children, perms);
    }
    const hasPermission = !tmp.permission || perms.includes(tmp.permission);
    if (hasPermission || (tmp.children && tmp.children.length > 0)) {
      if (tmp.type === 'directory' && (!tmp.children || tmp.children.length === 0)) return;
      res.push(tmp);
    }
  });
  return res;
};

export const usePermissionStore = defineStore('permission', () => {
  const isRoutesLoaded = ref(false);
  const menus = ref<any[]>([]); // 给 Sidebar 侧边栏渲染用的（保留层级结构）

  const generateMenus = async () => {
    try {
      const [menuRes, appRes] = await Promise.all([getMenuList(), getAppList()]);
      const rawMenus = menuRes || [];
      const apps = appRes || [];
      const userStore = useUserStore();

      const authedMenus = filterMenus(rawMenus, userStore.permissions);

      const appPrefixMap: Record<string, string> = {};
      apps.forEach((app: any) => {
        appPrefixMap[app.name] = app.activeRule;
        const rule = app.activeRule.endsWith('/') ? app.activeRule.slice(0, -1) : app.activeRule;
        if (!router.hasRoute(app.name)) {
          // ⚠️ 这里强制注入到 'Layout' 下
          router.addRoute('Layout', {
            path: `${rule}/:pathMatch(.*)*`,
            name: app.name,
            component: () => import('@/layout/empty.vue'),
            meta: { title: app.name }
          });
        }
      });

      const processRoutes = (menuList: any[]) => {
        const result: any[] = [];

        menuList.forEach((item) => {
          if (item.type === 'button') return;

          const uniquePath =
            item.path || `/dir-${item.id || Math.random().toString(36).substring(2, 8)}`;

          // 【核心修复】：优先读取 meta.title，全面兼容各种后端返回格式
          const metaTitle =
            item.meta?.title || item.title || item.menuName || item.name || '未命名菜单';
          const metaIcon = item.meta?.icon || item.icon;
          const metaHidden = item.meta?.hidden || item.hidden || false;

          const routeObj: any = {
            path: uniquePath,
            // 保证 name 的唯一性
            name: item.name || uniquePath.replace(/^\//, '').replace(/\//g, '-'),
            meta: {
              title: metaTitle,
              icon: metaIcon,
              hidden: metaHidden
            },
            app: item.app,
            children: []
          };

          if (item.children && item.children.length > 0) {
            routeObj.children = processRoutes(item.children);
          }

          if (item.app && item.app !== 'main' && appPrefixMap[item.app] && item.path) {
            const prefix = appPrefixMap[item.app];
            const relativePath = item.path.startsWith('/') ? item.path : `/${item.path}`;
            routeObj.path = `${prefix}${relativePath}`;
          } else if (item.app === 'main' || !item.app) {
            // 兼容没有 app 字段的纯目录节点 (!item.app)
            if (item.type === 'menu' && item.path) {
              const safePath = item.path.startsWith('/') ? item.path : `/${item.path}`;
              const componentPath = `../views${safePath}/index.vue`;
              if (modules[componentPath]) {
                routeObj.component = modules[componentPath];
              } else {
                console.warn(`[动态路由] 找不到对应的 Vue 文件: ${componentPath}`);
              }
            }
          }

          // 无论是不是 main，都推进去保证能在侧边栏渲染
          result.push(routeObj);
        });
        return result;
      };

      // 1. 生成树形结构，交给侧边栏去漂亮地渲染
      menus.value = processRoutes(authedMenus);
      // 2. 将树形菜单拍平为一维数组，再注入给 Vue Router
      // 这样所有的页面组件都会直接挂在 Layout 下，避免嵌套 Router-View 渲染失败的问题
      const flatRoutes: any[] = [];
      const generateFlatRoutes = (routeTree: any[]) => {
        routeTree.forEach((item) => {
          if (item.children && item.children.length > 0) {
            generateFlatRoutes(item.children);
          }
          // 只要这个节点有 component，说明它是真实的业务页面，提取出来
          if (item.component && item.app === 'main') {
            flatRoutes.push(item);
          }
        });
      };

      generateFlatRoutes(menus.value);

      // 3. 将拍平后的路由全部注入为 Layout 的儿子
      flatRoutes.forEach((routeObj) => {
        router.addRoute('Layout', routeObj);
      });

      if (!router.hasRoute('WorkbenchDisplay')) {
        router.addRoute('Layout', {
          path: '/workbench',
          name: 'WorkbenchDisplay',
          // ⚠️ 请确保这里 import 的路径跟你上一步创建“展示组件”的实际路径一致！
          component: () => import('@/views/workbench/index.vue'),
          meta: {
            title: '我的工作台',
            icon: 'Monitor',
            hidden: true // hidden 为 true 代表不让它自动在左侧菜单栏里渲染出一个多余的项
          }
        });
      }

      // 4. 兜底 404
      if (!router.hasRoute('NotFound')) {
        router.addRoute('Layout', {
          path: '/:pathMatch(.*)*',
          name: 'NotFound',
          component: () => import('@/views/error/404.vue'),
          meta: { title: '页面不存在', hidden: true }
        });
      }

      isRoutesLoaded.value = true;

      setSharedState({
        token: userStore.token,
        permissions: userStore.permissions,
        menus: menus.value // 把最新生成的全量菜单发给子应用
      });
    } catch (error) {
      console.error('动态生成路由失败', error);
      menus.value = [];
      isRoutesLoaded.value = false;
      throw error;
    }
  };

  const reset = () => {
    menus.value = [];
    isRoutesLoaded.value = false;
  };

  return { menus, isRoutesLoaded, generateMenus, reset };
});
