import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { watch } from 'vue';
import App from './App.vue';
import router from './router';
import { setupGlobalState } from '@/store/auth-listener';
import { useUserStore } from '@/store/user';

function render(props: any = {}) {
  const { container } = props;
  const app = createApp(App);
  app.use(createPinia());
  app.use(router);
  app.mount(container ? container.querySelector('#app') : '#app');
  return { app, router };
}

const initQiankun = () => {
  renderWithQiankun({
    mount(props) {
      console.log('[子应用] Mount');
      const { router: routerInstance } = render(props);
      
      // 1. 启动权限监听
      setupGlobalState(props, routerInstance);

      // 2. 监听 Store 变化，上报菜单
      const userStore = useUserStore();
      watch(
        () => userStore.dynamicMenus,
        (menus) => {
          if (menus.length > 0 && props.setMenus) {
            // 包装成侧边栏需要的格式
            const sidebarMenu = [{
              path: 'sub-order', // 唯一ID
              meta: { title: '订单系统(子)', icon: 'Shop' },
              children: menus // 过滤后的页面
            }];
            props.setMenus(sidebarMenu);
          }
        },
        { immediate: true }
      );
    },
    bootstrap() { console.log('[子应用] Bootstrap'); },
    update(newProps) {
      console.log('[子应用] update', newProps);
    },
    unmount(props) {
      console.log('[子应用] Unmount');
      const { container } = props;
      if (container) container.innerHTML = ''; // 清理 DOM
    }
  });
};

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
} else {
  initQiankun();
}