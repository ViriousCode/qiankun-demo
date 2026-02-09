import router from '@/router';
import { useUserStore } from '@/store/user';
import { usePermissionStore } from '@/store/permission';

const whiteList = ['/login', '/404']; // 白名单

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const permissionStore = usePermissionStore();

  if (userStore.token) {
    if (to.path === '/login') {
      next({ path: '/' });
    } else {
      // 核心判断：如果已经登录，但菜单还没生成 (isRoutesLoaded 为 false)
      if (!permissionStore.isRoutesLoaded) {
        try {
          // 1. 获取用户信息 (如果没有的话)
          if (!userStore.roleId) {
            await userStore.getUserInfo();
          }
          
          // 2. [这里调用] 生成菜单
          await permissionStore.generateMenus();
          
          // 3. 继续跳转 (replace: true 确保路由加载完整)
          next({ ...to, replace: true });
        } catch (error) {
          // 出错需重置并回登录页
          userStore.reset();
          next(`/login?redirect=${to.path}`);
        }
      } else {
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

router.afterEach(() => {
});