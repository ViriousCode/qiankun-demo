import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

import router from './router';
// import { setupRouteGuard } from './router/guard';
import { createPinia } from 'pinia';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import './permission'; // 引入守卫文件

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

import { vDebounce } from '@/directives/debounce';

const app = createApp(App);
//----------------- pinia -----------------//
const pinia = createPinia();
app.use(pinia);

app.use(router);
// setupRouteGuard(router);
app.directive('debounce', vDebounce);

app.use(ElementPlus, {
  locale: zhCn, // 设置语言
  // 其他全局配置
  size: 'default', // 组件尺寸: large | default | small
  zIndex: 2000 // 弹窗初始 z-index
});

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.mount('#app');
