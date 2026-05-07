// main-app/src/store/permission.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getMenuList, type Menu } from '@/api/menu';
import { getAppList, type MicroApp } from '@/api/app';
import { useUserStore } from './user';
import { setSharedState } from '@/micro/shared';
import router from '@/router';

const modules = import.meta.glob('../views/**/*.vue');

const filterMenus = (menus: Menu[], perms: string[]): Menu[] => {
  const res: Menu[] = [];
  menus.forEach((menu) => {
    const tmp = { ...menu };
    // 仅当节点有 permission 且在 perms 中时才视为“自身有权限”（父子不联动时不展示未勾选节点）
    const hasPermission = !!(tmp.permission && perms.includes(tmp.permission));
    if (tmp.children) {
      tmp.children = filterMenus(tmp.children, perms);
    }
    // 侧栏只展示目录/菜单，不展示按钮；判断“有可见子节点”时只计非 button
    const visibleNonButtonChildren =
      tmp.type === 'directory' ? (tmp.children || []).filter((c: any) => c.type !== 'button') : [];
    const hasVisibleChildren = visibleNonButtonChildren.length > 0;
    if (hasPermission || hasVisibleChildren) {
      if (tmp.type === 'directory' && !hasVisibleChildren) return;
      res.push(tmp);
    }
  });
  return res;
};

export const usePermissionStore = defineStore('permission', () => {
  const isRoutesLoaded = ref(false);
  const menus = ref<any[]>([]); // 给 Sidebar 侧边栏渲染用的（保留层级结构）
  const addedRouteNames = ref<string[]>([]); // 已注入的动态路由 name，用于再次生成前移除
  /** 子应用列表（含 shortName/iconName/activeRule 等），供 UI 映射展示使用 */
  const microApps = ref<MicroApp[]>([]);
  /** 子应用 activeRule 前缀缓存（用于主应用 router.afterEach 派发路由同步事件） */
  const microActiveRules = ref<string[]>([]);
  /** 子应用名称 -> activeRule 映射，供菜单可见性判断使用 */
  const appActiveRuleMap = ref<Record<string, string>>({});

  const normalizeActiveRules = (rules: any[]): string[] => {
    const res: string[] = [];
    (rules || []).forEach((r) => {
      const raw = String(r || '').trim();
      if (!raw) return;
      const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
      const normalized = withSlash.replace(/\/+$/, '');
      if (normalized && !res.includes(normalized)) res.push(normalized);
    });
    return res;
  };

  const normalizePath = (value: any): string => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (raw === '/') return '/';
    const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
    return withSlash.replace(/\/+$/, '');
  };

  const matchesActiveRule = (routePath: string, activeRule?: string): boolean => {
    const normalizedRoutePath = normalizePath(routePath);
    const normalizedActiveRule = normalizePath(activeRule);
    if (!normalizedRoutePath || !normalizedActiveRule) return false;
    return (
      normalizedRoutePath === normalizedActiveRule ||
      normalizedRoutePath.startsWith(`${normalizedActiveRule}/`)
    );
  };

  const getStaticProfileModule = () => ({
    path: '/profile',
    type: 'directory',
    app: 'main',
    meta: { title: '个人中心', icon: 'User' },
    children: [
      {
        path: '/profile/info',
        type: 'menu',
        app: 'main',
        meta: { title: '个人信息', icon: 'User' }
      },
      {
        path: '/profile/apps',
        type: 'menu',
        app: 'main',
        meta: { title: '我的应用', icon: 'Document' }
      },
      {
        path: '/profile/todo',
        type: 'menu',
        app: 'main',
        meta: { title: '我的待办', icon: 'List' }
      },
      {
        path: '/profile/message',
        type: 'menu',
        app: 'main',
        meta: { title: '我的消息', icon: 'Bell' }
      }
    ]
  });

  const resolveMainViewComponent = (routePath: string) => {
    const safePath = routePath.startsWith('/') ? routePath : `/${routePath}`;
    const candidatePaths = [`../views${safePath}/index.vue`, `../views${safePath}.vue`];
    for (const candidatePath of candidatePaths) {
      if (modules[candidatePath]) {
        return modules[candidatePath];
      }
    }
    console.warn(`[动态路由] 找不到对应的 Vue 文件: ${candidatePaths.join(' 或 ')}`);
    return null;
  };

  const generateMenus = async () => {
    try {
      // 再次执行时先移除上次注入的动态路由，避免重复注册导致未同步
      if (isRoutesLoaded.value && addedRouteNames.value.length > 0) {
        addedRouteNames.value.forEach((name) => {
          try {
            router.removeRoute(name);
          } catch (_) {}
        });
        addedRouteNames.value = [];
        isRoutesLoaded.value = false;
      }

      const [menuRes, appRes] = await Promise.all([getMenuList(), getAppList()]);
      const rawMenus = menuRes || [];
      const apps = appRes || [];
      microApps.value = apps;
      const userStore = useUserStore();

      const authedMenus = filterMenus(rawMenus, userStore.permissions);

      const appPrefixMap: Record<string, string> = {};
      // 缓存所有子应用 activeRule，供 router.afterEach 动态匹配使用（避免写死正则）
      microActiveRules.value = normalizeActiveRules(apps.map((a: any) => a?.activeRule));
      appActiveRuleMap.value = {};
      (window as any).__MICRO_ACTIVE_RULES__ = microActiveRules.value;

      apps.forEach((app: any) => {
        const normalizedRule = normalizePath(app.activeRule);
        appPrefixMap[app.name] = normalizedRule;
        appActiveRuleMap.value[app.name] = normalizedRule;
        const rule = normalizedRule;
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
            type: item.type,
            app: item.app,
            children: []
          };

          if (item.children && item.children.length > 0) {
            routeObj.children = processRoutes(item.children);
          }

          if (item.app && item.app !== 'main' && appPrefixMap[item.app] && item.path) {
            const rawPrefix = appPrefixMap[item.app];
            if (!rawPrefix) {
              result.push(routeObj);
              return;
            }
            const prefix = rawPrefix.replace(/\/+$/, '');
            const rawPath = String(item.path).trim();
            const normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;

            // 兼容两种后端数据格式：
            // 1) 绝对路径（如 /case/home）=> 直接使用
            // 2) 相对路径（如 home 或 /home）=> 自动拼 activeRule
            const appNamePrefix = `/${item.app}/`;
            if (
              normalizedPath.startsWith(`${prefix}/`) ||
              normalizedPath === prefix ||
              normalizedPath.startsWith(appNamePrefix)
            ) {
              routeObj.path = normalizedPath;
            } else {
              routeObj.path = `${prefix}${normalizedPath}`;
            }
          } else if (item.app === 'main' || !item.app) {
            // 兼容没有 app 字段的纯目录节点 (!item.app)
            if (item.type === 'menu' && item.path) {
              const component = resolveMainViewComponent(item.path);
              if (component) {
                routeObj.component = component;
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
            flatRoutes.push({
              ...item,
              children: []
            });
          }
        });
      };

      generateFlatRoutes(menus.value);

      // 3. 将拍平后的路由全部注入 Layout
      flatRoutes.forEach((routeObj) => {
        router.addRoute('Layout', routeObj);
        if (routeObj.name) addedRouteNames.value.push(routeObj.name);
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
        addedRouteNames.value.push('WorkbenchDisplay');
      }

      // 4. 兜底 404
      if (!router.hasRoute('NotFound')) {
        router.addRoute('Layout', {
          path: '/:pathMatch(.*)*',
          name: 'NotFound',
          component: () => import('@/views/error/404.vue'),
          meta: { title: '页面不存在', hidden: true }
        });
        addedRouteNames.value.push('NotFound');
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
    addedRouteNames.value.forEach((name) => {
      try {
        router.removeRoute(name);
      } catch (_) {}
    });
    addedRouteNames.value = [];
    menus.value = [];
    isRoutesLoaded.value = false;
  };

  /** 从菜单树中取第一个可跳转的 path（深度优先） */
  const getFirstLeafPath = (menu: any): string | null => {
    if (!menu) return null;
    if (menu.type === 'directory' && menu.children && menu.children.length > 0) {
      for (const child of menu.children) {
        if (child.meta?.hidden) continue;
        const p = getFirstLeafPath(child);
        if (p) return p;
      }
      return null;
    }
    if (menu.path) return menu.path;
    return null;
  };

  /** 根据目录标题（如「个人中心」「管理中心」）查找该模块下第一个菜单的 path */
  const getFirstMenuPathByTitle = (title: string): string | null => {
    if (title === '个人中心') return '/profile/info';
    const find = (list: any[]): any => {
      for (const item of list) {
        if (item.meta?.title === title) return item;
        if (item.type === 'directory' && item.children?.length) {
          const found = find(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    const dir = find(menus.value);
    return dir ? getFirstLeafPath(dir) : null;
  };

  /** 判断某菜单节点及其子节点是否包含给定路径 */
  const subtreeContainsPath = (menu: any, path: string): boolean => {
    if (!menu) return false;
    const normalizedPath = normalizePath(path);
    const p = normalizePath(menu.path);
    if (p && (normalizedPath === p || normalizedPath.startsWith(`${p}/`))) return true;
    if (menu.children?.length) {
      return menu.children.some((child: any) => subtreeContainsPath(child, normalizedPath));
    }
    return false;
  };

  const resolveSubAppMenu = (routePath: string): any | null => {
    const normalizedRoutePath = normalizePath(routePath);
    if (!normalizedRoutePath) return null;

    return (
      menus.value.find((item) => {
        if (!item?.app || item.app === 'main') return false;
        const activeRule = appActiveRuleMap.value[item.app];
        return (
          matchesActiveRule(normalizedRoutePath, activeRule) ||
          subtreeContainsPath(item, normalizedRoutePath)
        );
      }) || null
    );
  };

  const resolveMainModuleMenu = (routePath: string): any | null => {
    const normalizedRoutePath = normalizePath(routePath);
    const mainRoot = menus.value.find((item) => item?.app === 'main' && item.type === 'directory');
    if (!mainRoot?.children?.length) return null;

    return (
      mainRoot.children.find((child: any) => subtreeContainsPath(child, normalizedRoutePath)) ||
      null
    );
  };

  /**
   * 根据当前路由路径，只返回“当前所在模块”的菜单（侧栏只展示该模块及其子项）。
   * 主应用下所有管理菜单平铺在同一层级，侧栏统一展示全部；个人中心单独处理。
   * 进入子应用时：不展示子应用名称，只展示该子应用下的子菜单（返回子节点的 children）。
   */
  const getVisibleMenus = (routePath: string): any[] => {
    const list = menus.value;
    if (!list?.length) return [];
    if (normalizePath(routePath).startsWith('/profile')) return [getStaticProfileModule()];

    const activeSubAppMenu = resolveSubAppMenu(routePath);
    if (activeSubAppMenu?.children?.length) {
      return activeSubAppMenu.children;
    }

    const activeMainModule = resolveMainModuleMenu(routePath);
    if (activeMainModule) {
      const mainRoot = list.find((item: any) => item?.app === 'main' && item.type === 'directory');
      if (mainRoot?.children?.length) return mainRoot.children;
      return [activeMainModule];
    }

    for (const item of list) {
      if (subtreeContainsPath(item, routePath)) {
        // 子应用节点：侧栏只展示其子菜单，不展示子应用名称本身
        if (item.app && item.app !== 'main' && item.children?.length) {
          return item.children;
        }
        return [item];
      }
    }

    return list;
  };

  /**
   * 当前路由若在子应用下，返回该子应用在菜单中的展示信息（名称、图标），用于顶栏蓝色框展示。
   */
  const getCurrentSubAppDisplay = (routePath: string): { title: string; icon?: string } | null => {
    const list = menus.value;
    if (!list?.length) return null;

    const activeSubAppMenu = resolveSubAppMenu(routePath);
    if (activeSubAppMenu) {
      const title = activeSubAppMenu.meta?.title || activeSubAppMenu.title || '';
      return { title, icon: activeSubAppMenu.meta?.icon || activeSubAppMenu.icon };
    }
    return null;
  };

  /** 根据子应用 name/shortName/code/title(兼容) 解析简称+图标（用于消息来源 tag） */
  const getSubAppDisplayByKey = (key: string): { title: string; icon?: string } | null => {
    const k = String(key || '').trim();
    if (!k) return null;

    const app =
      microApps.value.find(
        (a) =>
          a?.name === k ||
          a?.shortName === k ||
          a?.code === k ||
          String(a?.name || '').includes(k) ||
          String(a?.shortName || '').includes(k)
      ) || null;

    if (app) return { title: app.shortName || app.name, icon: app.iconName };

    // 兜底：从菜单树里按 meta.title 匹配子应用节点
    const subMenu =
      menus.value.find((m: any) => m?.app && m.app !== 'main' && (m.meta?.title === k || m.title === k)) ||
      null;
    if (subMenu) {
      const title = subMenu.meta?.title || subMenu.title || '';
      return { title, icon: subMenu.meta?.icon || subMenu.icon };
    }

    return null;
  };

  return {
    menus,
    microApps,
    isRoutesLoaded,
    addedRouteNames,
    generateMenus,
    reset,
    getFirstMenuPathByTitle,
    getVisibleMenus,
    getCurrentSubAppDisplay,
    getSubAppDisplayByKey,
    getMicroActiveRules: () => microActiveRules.value
  };
});
