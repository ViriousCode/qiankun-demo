// main-app/src/micro/index.ts
import { addGlobalUncaughtErrorHandler, registerMicroApps, start } from 'qiankun';
import { sharedProps } from './shared';
import { getAppList } from '@/api/app';
import { ElLoading, ElMessage } from 'element-plus';
let loadingInstance: any = null;
export const initQiankun = async () => {
  try {
    // 1. 从后端获取应用列表
    const res = await getAppList();
    const appData = res || [];

    // 2. 转换为 Qiankun 需要的格式
    const apps = appData.map((item: any) => ({
      name: item.name,
      entry: item.entry,
      container: item.container,
      activeRule: item.activeRule,
      props: { ...sharedProps },
      loader: (loading: boolean) => {
        if (loading) {
          // 在创建新 Loading 前，强制干掉可能残留的旧实例
          if (loadingInstance) {
            loadingInstance.close();
          }
          loadingInstance = ElLoading.service({
            target: '.app-main', // 挂在主内容区
            text: '正在加载应用资源，请稍候...',
            background: 'rgba(255, 255, 255, 0.7)'
          });
        } else {
          // 等待 Element Plus 的生成动画彻底结束后再销毁，完美避开卡死 Bug
          setTimeout(() => {
            if (loadingInstance) {
              loadingInstance.close();
              loadingInstance = null;
            }
          }, 300);
        }
      }
    }));

    if (apps.length > 0) {
      registerMicroApps(apps);
      addGlobalUncaughtErrorHandler((event: any) => {
        console.error('[Qiankun Error]', event);
        const errorMsg = event?.message || '';
        if (
          errorMsg.includes('died in status LOADING_SOURCE_CODE') ||
          errorMsg.includes('Failed to fetch')
        ) {
          if (loadingInstance) {
            loadingInstance.close();
            loadingInstance = null;
          }
          ElMessage.error('子应用加载失败，请检查服务是否启动！');
        }
      });
      start({
        prefetch: 'all',
        sandbox: {
          experimentalStyleIsolation: true
        }
      });
      console.log('[Qiankun] Apps registered:', apps);
    }
  } catch (error) {
    console.error('[Qiankun] Failed to load app config:', error);
    ElMessage.error('微应用配置加载失败');
  }
};
