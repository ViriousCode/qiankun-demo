// plugins/vite-plugin-iconfont.ts
import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

export default function vitePluginIconfont(): Plugin {
  return {
    // 插件的名称，方便调试时识别
    name: 'vite-plugin-parse-iconfont',

    // 💡 关键点：挂载到 buildStart 钩子
    // 这个钩子会在 Vite 开发服务器启动时（dev）和开始打包时（build）自动触发一次
    buildStart() {
      // process.cwd() 获取的是项目根目录，比 __dirname 在 ESM 模块中更安全
      const CSS_FILE_PATH = path.resolve(process.cwd(), 'src/assets/iconfont/iconfont.css');
      const OUTPUT_FILE_PATH = path.resolve(process.cwd(), 'src/config/iconfont-data.ts');

      try {
        // 1. 如果没找到 css 文件，不阻断程序，抛出警告即可
        if (!fs.existsSync(CSS_FILE_PATH)) {
          console.warn('\x1B[33m[Vite Iconfont]\x1B[0m ⚠️ 未找到 iconfont.css，跳过解析。');
          return;
        }

        // 2. 读取并正则匹配
        const cssContent = fs.readFileSync(CSS_FILE_PATH, 'utf-8');
        const regex = /\.(icon-[a-zA-Z0-9_-]+)::?before/g;

        const icons: string[] = [];
        let match;
        while ((match = regex.exec(cssContent)) !== null) {
          icons.push(match[1]);
        }

        const uniqueIcons = [...new Set(icons)];

        // 3. 组装 TS 文件内容
        const tsContent = `// ⚠️ 该文件由 Vite 插件自动生成，请勿手动修改！\n\nexport const iconfontList: string[] = ${JSON.stringify(uniqueIcons, null, 2)};\n`;

        // 4. 确保输出目录存在并写入
        const outputDir = path.dirname(OUTPUT_FILE_PATH);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(OUTPUT_FILE_PATH, tsContent, 'utf-8');

        // 在终端打印一句漂亮的绿色提示
        console.log(
          `\x1B[32m[Vite Iconfont]\x1B[0m 🎉 成功拦截并解析了 ${uniqueIcons.length} 个自定义图标！`
        );
      } catch (error) {
        console.error('\x1B[31m[Vite Iconfont]\x1B[0m ❌ 解析失败：', error);
      }
    }
  };
}
