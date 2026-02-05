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
            permissions: userStore.permissions,
            token: userStore.token,
          },
          userInfo:{
              userName: userStore.userName,
              roleId: userStore.roleId
            }
        }
      }
    }
  ]);

  start();
};