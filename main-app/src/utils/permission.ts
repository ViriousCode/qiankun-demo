import router from '@/router';
import { useUserStore } from '@/store/user';
import { ElMessage } from 'element-plus';

// 白名单：不需要登录就能访问的页面
const whiteList = ['/login', '/404'];

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const hasToken = userStore.token;

  if (hasToken) {
    if (to.path === '/login') {
      // 已登录，跳转首页
      next({ path: '/' });
    } else {
      // 【核心逻辑】：判断是否已有权限数据
      const hasRoles = userStore.permissions && userStore.permissions.length > 0;
      
      if (hasRoles) {
        // 1. 如果有权限，直接通过
        next();
      } else {
        try {
          // 2. 如果没权限（比如刷新了页面），调用 getUserInfo 补全数据
          await userStore.getUserInfo();
          
          // 3. 拉取成功，重新进入路由 (replace: true 确保路由被完整解析，避免 404)
          next({ ...to, replace: true });
        } catch (error) {
          // 4. 拉取失败 (Token可能过期了)，强制登出
          userStore.reset();
          ElMessage.error('身份验证失效，请重新登录');
          next(`/login?redirect=${to.path}`);
        }
      }
    }
  } else {
    // 无 Token
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next(`/login?redirect=${to.path}`);
    }
  }
});

router.afterEach(() => {
});