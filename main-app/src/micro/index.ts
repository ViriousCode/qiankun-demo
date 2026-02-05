import { registerMicroApps, start } from 'qiankun';
import { useUserStore } from '@/store/user';

export const initQiankun = () => {
  const userStore = useUserStore();

  registerMicroApps([
    {
      name: 'sub-app',
      entry: 'http://localhost:5179',
      container: '#sub-app-container',
      activeRule: '/sub-app',
      props: {
        globalData: {
          auth: {
            permissions: userStore.permissions
          }
        }
        // 【关键修复】：删除下面这行 setMenus！
        // 因为主应用现在自己管菜单了，不需要子应用上报了。
        // setMenus: (menus: any[]) => userStore.setSubMenus(menus) 
      }
    }
  ]);

  start();
};