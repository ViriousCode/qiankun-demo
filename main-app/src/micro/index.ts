// main-app/src/micro/index.ts
import { registerMicroApps, start } from 'qiankun';
import { sharedProps } from './shared'; // [!code ++]

const apps = [
  {
    name: 'sub-app',
    entry: import.meta.env.VITE_QIAANKUN_ENTRY_SUB_APP,
    container: '#sub-app-container',
    activeRule: '/sub-app',
    props: { ...sharedProps } // [!code ++] 将自定义的状态管理方法传给子应用
  }
];
export const initQiankun = () => {
  registerMicroApps(apps);
  start();
}
