import router from '@/router';
import { useUserStore } from '@/store/user';
import { ElMessage } from 'element-plus';

// 白名单：不需要登录就能访问的页面
const whiteList = ['/login', '/404'];

router.beforeEach(async (to, from, next) => {
  // 1. 获取 Store
  const userStore = useUserStore();
  const hasToken = userStore.token;

  // 2. 动态设置页面标题 (可选)
  document.title = (to.meta.title as string) || '微前端主基座';

  if (hasToken) {
    // === 已登录状态 ===
    
    if (to.path === '/login') {
      // 已登录还想去登录页？踢回首页
      next({ path: '/' });
    } else {
      // 检查是否有权限信息 (防止刷新页面后 Store 丢失)
      const hasPermissions = userStore.permissions && userStore.permissions.length > 0;
      
      if (hasPermissions) {
        // 信息齐全，放行
        next();
      } else {
        try {
          // 有 Token 但无权限信息 -> 重新拉取
          console.log('[路由守卫] 重新拉取用户信息...');
          await userStore.login(); // 模拟重新请求接口
          
          // 拉取成功 -> 重新进入当前路由 (replace: true 确保路由被完整解析)
          next({ ...to, replace: true });
        } catch (error) {
          // 拉取失败 (如 Token 过期) -> 清空状态并跳回登录页
          console.error('[路由守卫] 验证失败', error);
          
          // 重置用户状态 (需要 Store 支持 $reset 或手动清空)
          userStore.token = '';
          userStore.permissions = [];
          
          ElMessage.error('身份验证失效，请重新登录');
          next(`/login?redirect=${to.path}`);
        }
      }
    }
  } else {
    // === 未登录状态 ===

    if (whiteList.includes(to.path)) {
      // 在白名单内 -> 放行
      next();
    } else {
      // 不在白名单 -> 全部重定向到登录页
      next(`/login?redirect=${to.path}`);
    }
  }
});