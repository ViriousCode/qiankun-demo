import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import qiankun from 'vite-plugin-qiankun';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const plugins = [
    vue(),
    qiankun('test-sub-app', {
      useDevMode: true
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
      ],
      dts: 'src/auto-imports.d.ts',  // 生成类型声明文件
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      dts: 'src/components.d.ts',  // 生成组件类型声明
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass',  // 使用 sass
        }),
      ],
    }),
  ]
  // if (env.VITE_SHOW_DEVTOOLS === 'true' && mode !== 'production') {
  //   console.log('🚀 Vue DevTools 插件已启用');
  //   plugins.push(vueDevTools());
  // }
  return {
    base: '/test-sub-app/',
    plugins,
    server: {
      port: 5179,
      strictPort: true,
      cors: true, // 必须允许跨域
      // 如果有静态资源（图片），需要强制指定 origin，否则在主应用下加载会 404
      origin: 'http://localhost:5179',
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000', // 后端地址
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, '') // 如果后端路由没有 /api 前缀，就开启这行
        }
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
