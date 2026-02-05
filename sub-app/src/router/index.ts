import { createRouter, createWebHistory } from 'vue-router';
import { constantRoutes } from './routes';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

const router = createRouter({
  // 【关键】：强制指定 /sub-app/，防止 URL 解析错误
  history: createWebHistory(
    qiankunWindow.__POWERED_BY_QIANKUN__ ? '/sub-app' : '/'
  ),
  routes: constantRoutes
});

export default router;