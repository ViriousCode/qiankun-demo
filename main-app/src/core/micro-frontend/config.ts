// src/core/micro-frontend/config.ts
import { reactive, watch } from 'vue'; // 确保引入 watch
import router from '@/router';
import { useUserStore } from '@/store/user';

// 在函数外部定义，确保全局单例，防止引用丢失
const globalData = reactive({
  auth: {
    permissions: [] as string[],
    userInfo: null as any
  },
  // 用于接收子应用传回的菜单
  subAppMenus: [] as any[],
  setMenus: (menus: any[]) => {
    globalData.subAppMenus = menus;
  }
});
let isLinked = false;
export const useMicroConfig = () => {
  const userStore = useUserStore();
  if (!isLinked) {
    // 监听主应用 Store 变化
    watch(
      () => userStore.permissions,
      (newVal) => {
        // 只有当有实际权限数据时，才同步给子应用，避免退出时的清空动作导致子应用路由崩溃
        if (newVal && newVal.length > 0) {
          globalData.auth.permissions = [...newVal];
          globalData.auth.userInfo = userStore.userInfo;
        // } else {
        //   // 退出登录时，清空菜单
        //   globalData.auth.permissions = [];
        //   globalData.subAppMenus = [];
        }
      },
      { deep: true, immediate: true }
    );
    isLinked = true;
  }

  const subApps = [
    {
      name: 'cesium-demo',
      entry: '//localhost:5173',
      container: '#sub-container',
      activeRule: '/cesium-demo',
      props: {
        mainNavigate: (path: string) => router.push(path),
        globalData, // 传递单例引用
        setMenus: globalData.setMenus,
      }
    },
    {
      name: 'three-demo',
      entry: '//localhost:5174',
      container: '#sub-container',
      activeRule: '/three-demo',
      props: {
        mainNavigate: (path: string) => router.push(path),
        globalData,
        setMenus: globalData.setMenus,
      }
    },
    {
      name: 'sub-app',
      entry: '//localhost:5179',
      container: '#sub-container',
      activeRule: '/sub-app',
      props: {
        mainNavigate: (path: string) => router.push(path),
        globalData,
        setMenus: globalData.setMenus,
      }
    },
  ];

  return { subApps, globalData };
};