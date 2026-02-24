// main-app/src/micro/index.ts
import { registerMicroApps, start } from 'qiankun';
import { sharedProps } from './shared'; // [!code ++]
import { getAppList } from '@/api/app';
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
      props: { ...sharedProps }
    }));

    if (apps.length > 0) {
      registerMicroApps(apps);
      start();
      console.log('[Qiankun] Apps registered:', apps);
    }
  } catch (error) {
    console.error('[Qiankun] Failed to load app config:', error);
    ElMessage.error('微应用配置加载失败');
  }
};
