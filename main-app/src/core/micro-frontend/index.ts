// // src/core/micro-frontend/index.ts
// import { registerMicroApps, start } from 'qiankun';
// import { useSharedData, getSubApps } from './apps';

// export const setupMicroApp = () => {
//   const { globalData } = useSharedData();
//   const subApps = getSubApps(globalData);

//   registerMicroApps(subApps, {
//     beforeLoad: [async (app) => console.log('before load', app.name)],
//     beforeMount: [async (app) => console.log('before mount', app.name)],
//   });

//   start({
//     sandbox: {
//       experimentalStyleIsolation: true
//     }
//   });
// };