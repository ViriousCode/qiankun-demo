import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia'
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
  ],
  server: {
      port: 6789,
      origin: 'http://localhost:6789'
    },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
