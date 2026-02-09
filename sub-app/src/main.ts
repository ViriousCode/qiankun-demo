import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { initAuthListener } from '@/utils/auth-listener'; // 引入刚才修改的文件
// 引入指令
import { vPermission } from '@/directives/permission';
import { vDebounce } from '@/directives/debounce';

let app: any;

function render(props: any = {}) {
  const { container } = props;
  app = createApp(App);

  // 1. 注册插件
  const pinia = createPinia();
  app.use(pinia);
  app.use(router);

  // 2. 注册指令
  app.directive('permission', vPermission);
  app.directive('debounce', vDebounce);

  initAuthListener(props, router)

  // 5. 挂载应用
  app.mount(container ? container.querySelector('#sub-app') : '#sub-app');

  // 【关键步骤 B】：挂载完成后，大喊一声：“主应用，最新的权限发我一份！”
  // 这能解决 props 数据陈旧的问题
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    window.dispatchEvent(new Event('sub-app-ask-for-refresh'));
  }
}

renderWithQiankun({
  mount(props) {
    console.log('[子应用] Mount');
    render(props);
  },
  bootstrap() {
    console.log('[子应用] Bootstrap');
  },
  unmount(props: any) {
    console.log('[子应用] Unmount');
    if (app) {
      app.unmount();
      app = null;
    }
  },
  update(props: any) {
    console.log('[子应用] Update');
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}