// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  // 可以在此添加其他以 VITE_ 开头的环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
