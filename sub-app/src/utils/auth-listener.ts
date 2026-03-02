// sub-app/src/utils/auth-listener.ts
import type { Router } from 'vue-router';
import { useUserStore } from '@/store/user';
import { usePermissionStore } from '@/store/permission';

let onStateChangeCallback: any = null;

interface SharedState {
  token: string;
  user: any; // 这里接收的就是主应用的 userInfo 对象
  permissions: string[];
  menus: any[];
}

export function clearAuthListener(props?: any) {
  if (props && props.offGlobalStateChange && onStateChangeCallback) {
    try {
      props.offGlobalStateChange();
    } catch (e) {
      console.warn('取消全局状态监听失败', e);
    }
    onStateChangeCallback = null;
  }
}

export function initAuthListener(props: any, router: Router) {
  const userStore = useUserStore();
  const permissionStore = usePermissionStore();

  clearAuthListener(props);

  if (!props || !props.getSharedState) return;

  // 1. 初始化时手动拉取一次
  const initialState = props.getSharedState();
  console.log('initialState', initialState);
  if (initialState) {
    handleStateChange(initialState, userStore, permissionStore, router);
  }

  // 2. 注册监听，实时接收变更
  onStateChangeCallback = (state: SharedState) => {
    handleStateChange(state, userStore, permissionStore, router);
  };
  props.onSharedStateChange(onStateChangeCallback);
}

async function handleStateChange(
  state: SharedState,
  userStore: any,
  permissionStore: any,
  router: Router
) {
  // 同步 Token
  if (state.token) {
    userStore.token = state.token; // 或 userStore.setToken(state.token)
  }

  // 🚨 同步用户信息：直接把 state.user (即 userInfo 对象) 塞给 Store
  if (state.user) {
    userStore.setUserInfo(state.user);
  }

  // 同步权限
  if (state.permissions) {
    userStore.setPermissions(state.permissions);
  }

  // 同步菜单
  if (state.menus) {
    permissionStore.generateRoutes(state.menus);
  }

  // 如果 Token 为空，说明主应用退出了，子应用也清理门户
  if (!state.token) {
    userStore.reset();
    permissionStore.reset();
    // 只有在非登录页才跳转，防止死循环
    if (router.currentRoute.value.path !== '/login') {
      router.push('/login');
    }
  }
}