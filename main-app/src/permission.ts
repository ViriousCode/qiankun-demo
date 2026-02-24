import router from '@/router';
import { useUserStore } from '@/store/user';
import { usePermissionStore } from '@/store/permission';

// 登录白名单
const whiteList = ['/login'];

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const permissionStore = usePermissionStore();

  if (userStore.token) {
    if (to.path === '/login') {
      next({ path: '/' });
    } else {
      // 如果还没加载过动态路由
      if (!permissionStore.isRoutesLoaded) {
        try {
          if (!userStore.userInfo.roleId) await userStore.getUserInfo();

          // 获取并动态注入路由
          await permissionStore.generateMenus();

          // replace: true 确保路由完整替换，触发重新解析
          next({ ...to, replace: true });
        } catch (error) {
          console.error('路由拦截发生错误:', error)
          userStore.reset();
          next(`/login?redirect=${to.path}`);
        }
      } else {
        // 路由已加载，直接放行！
        // 如果用户在地址栏手动输入无权限的路径：
        // 因为动态路由里没挂载它，Vue Router 会自动将它匹配到我们在 store 里最后注入的 NotFound 路由，完美隔离！
        next();
      }
    }
  } else {
    // 没有 Token
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next(`/login?redirect=${to.path}`);
    }
  }
});

router.afterEach(() => { });
