import { watch, nextTick } from 'vue';
import type { Router } from 'vue-router';
import { useUserStore } from '@/store/user';
import { usePermissionStore } from '@/store/permission';
import { asyncRoutes } from '@/router/routes'; // 确保这里能导入
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

// 定义从 Main App 传来的 Props 接口
interface SharedState {
  token: string;
  user: any;
  permissions: string[];
  menus: any[];
}

interface QiankunProps {
  getSharedState?: () => SharedState;
  onSharedStateChange?: (callback: (state: SharedState) => void) => () => void;
  [key: string]: any;
}

/**
 * 递归过滤路由
 */
const filterAsyncRoutes = (routes: any[], perms: string[]) => {
  const res: any[] = [];
  routes.forEach((route) => {
    const tmp = { ...route };
    // 1. 权限判断: 如果有 meta.permission，则必须包含在 perms 中
    const hasPermission = !tmp.meta?.permission || perms.includes(tmp.meta.permission);

    if (hasPermission) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, perms);
      }
      res.push(tmp);
    }
  });
  return res;
};

/**
 * 初始化认证监听器
 */
export function initAuthListener(props: any, router: Router) {
  const userStore = useUserStore();
  const permissionStore = usePermissionStore();

  // 1. 启动动态路由监听 (监听 permissions 变化)
  setupDynamicRoutes(router, userStore);

  // 2. 接收数据
  if (!props || !props.getSharedState) return;

  const initialState = props.getSharedState();
  if (initialState) {
    handleStateChange(initialState, userStore, permissionStore, router);
  }

  props.onSharedStateChange((state: SharedState) => {
    handleStateChange(state, userStore, permissionStore, router);
  });
}

/**
 * 设置动态路由监听
 * 当 store 中的 permissions 变化时，自动计算并挂载路由
 */
function setupDynamicRoutes(router: ReturnType<typeof useRouter>, userStore: any) {
  watch(
    () => userStore.permissions,
    async (newPerms) => {
      if (!newPerms) return;

      // 过滤本地路由表 (过滤函数 filterAsyncRoutes 请自行保留或引入)
      // 这里的逻辑是：主应用控制“你能看什么(permission字符串)”，
      // 子应用根据这个字符串，决定“加载哪些本地组件”。
      const accessedRoutes = filterAsyncRoutes(asyncRoutes, newPerms);

      // 动态添加路由
      const hasLayout = router.hasRoute('LayoutRoot');
      accessedRoutes.forEach((route: any) => {
        if (!router.hasRoute(route.name)) {
          if (hasLayout) router.addRoute('LayoutRoot', route);
          else router.addRoute(route);
        }
      });

      // 4. 处理 Qiankun 下的刷新/深链接问题
      // 路由添加完后，需要手动触发一次跳转，否则当前页可能还是白屏
      await nextTick();

      // 获取当前路径
      const currentPath = qiankunWindow.__POWERED_BY_QIANKUN__
        ? window.location.pathname.replace('/sub-app', '') // 去掉主应用前缀
        : window.location.pathname;

      // 如果当前就在某个动态路由页面上，replace 一下触发匹配
      if (currentPath !== '/' && currentPath !== '/login') {
        router.replace(currentPath).catch(err => {
          // 忽略重定向错误
          if (err.name !== 'NavigationDuplicated') console.error(err);
        });
      }
    },
    { immediate: true } // 立即执行一次，防止初始就有权限但没触发
  );
}

async function handleStateChange(
  state: SharedState,
  userStore: any,
  permissionStore: any,
  router: Router
) {
  // A. Token & User
  if (state.token) userStore.token = state.token;
  if (state.user) userStore.setUserInfo(state.user);

  // B. Permissions (驱动路由生成)
  if (state.permissions) {
    userStore.setPermissions(state.permissions);
  }

  // C. Menus (驱动侧边栏渲染) [!code focus]
  // 不再调用 generateMenus，而是直接存入 Store
  if (state.menus) {
    // 可选：如果主应用给的是全量菜单，这里过滤出子应用需要的
    // const myMenus = state.menus.find(item => item.path === '/sub-app')?.children || [];
    // permissionStore.setMenus(myMenus);

    permissionStore.setMenus(state.menus);
  }

  // D. 登出处理
  if (!state.token) {
    userStore.reset();
    permissionStore.reset();
    router.push('/login');
  }
}