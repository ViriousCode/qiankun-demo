import { createApp } from 'vue';
import '@/assets/base.scss';
import '@npm/azura-icon/style.css';
import App from './App.vue';

import router from './router';
// import { setupRouteGuard } from './router/guard';
import { createPinia } from 'pinia';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import './permission'; // 引入守卫文件

import { vPermission } from '@/directives/permission'; // 👈 1. 引入权限指令

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import '@/assets/case-global-overrides.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

import { vDebounce } from '@/directives/debounce';
import { MENU_ICONFONT_SYMBOL_JS_URL } from '@/config';
import { loadIconfontSymbolScript } from '@/utils/loadIconfontSymbolScript';

loadIconfontSymbolScript(MENU_ICONFONT_SYMBOL_JS_URL).catch((e) => {
  console.warn(
    '[iconfont] Symbol 脚本加载失败，icon-* 将无法通过 <use> 展示。请部署与 iconfont.json 同项目的 iconfont.js，并检查',
    MENU_ICONFONT_SYMBOL_JS_URL,
    e
  );
});

const app = createApp(App);
//----------------- pinia -----------------//
const pinia = createPinia();
app.use(pinia);

app.use(router);
// setupRouteGuard(router);
app.directive('debounce', vDebounce);
app.directive('permission', vPermission);

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
