// // src/core/micro-frontend/apps.ts
// import { reactive, watchEffect } from 'vue';
// import router from '@/router';
// import { useUserStore } from '@/store/user';

// // 1. 抽离共享数据逻辑
// export const useSharedData = () => {
//   const userStore = useUserStore();

//   const globalData = reactive({
//     auth: {
//       permissions: userStore.permissions || [],
//       userInfo: userStore.userInfo || null
//     }
//   });

//   watchEffect(() => {
//     globalData.auth.permissions = userStore.permissions;
//     globalData.auth.userInfo = userStore.userInfo;
//   });

//   return { globalData };
// };

// // 2. 定义子应用列表工厂函数
// export const getSubApps = (globalData: any) => [
//   {
//     name: 'cesium-demo',
//     entry: '//localhost:5173',
//     container: '#sub-container',
//     activeRule: '/cesium-demo',
//     props: {
//       mainNavigate: (path: string) => router.push(path),
//       globalData
//     }
//   },
//   {
//     name: 'three-demo',
//     entry: '//localhost:5174',
//     container: '#sub-container',
//     activeRule: '/three-demo',
//     props: {
//       mainNavigate: (path: string) => router.push(path),
//       globalData
//     }
//   },
//   {
//     name: 'sub-app',
//     entry: '//localhost:5179',
//     container: '#sub-container',
//     activeRule: '/sub-app',
//     props: {
//       mainNavigate: (path: string) => router.push(path),
//       globalData
//     },
//     configuration: {
//       excludeAssetFilter: (assetUrl: string) => assetUrl.includes('virtual:vue-devtools'),
//     },
//   },
// ];