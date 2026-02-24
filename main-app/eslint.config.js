import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import pluginPrettier from 'eslint-plugin-prettier/recommended';

export default [
  // 1. 指定需要检查的文件格式
  { files: ['**/*.{js,mjs,cjs,ts,vue}'] },

  // 2. 指定浏览器全局变量 (如 window, document)
  { languageOptions: { globals: globals.browser } },

  // 3. 继承核心推荐规范
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  // 4. 针对 Vue 文件的特殊解析配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    }
  },

  // 5. 接入 Prettier 解决格式化冲突 (必须放在最后)
  pluginPrettier,

  // 6. 自定义你的业务规则
  {
    rules: {
      'vue/multi-word-component-names': 'off', // 允许单单词组件名 (如 index.vue)
      '@typescript-eslint/no-explicit-any': 'off', // 允许使用 any
      '@typescript-eslint/no-unused-vars': 'warn', // 未使用变量变警告
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true, // 使用单引号
          semi: true, // 结尾加分号
          printWidth: 100, // 一行最多 100 字符
          trailingComma: 'none' // 对象最后不加逗号
        }
      ]
    }
  }
];
