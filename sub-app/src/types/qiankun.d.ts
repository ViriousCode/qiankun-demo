// types/qiankun.d.ts
declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean;
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string;
    CESIUM_BASE_URL?: string;
    __IS_STANDALONE__?: boolean;
  }
}

export interface QiankunProps {
  container?: HTMLElement;
  getPublicPath?: () => string;
  setGlobalState?: (state: Record<string, any>) => void;
  onGlobalStateChange?: (
    callback: (state: Record<string, any>, prevState: Record<string, any>) => void
  ) => void;
  getGlobalState?: () => Record<string, any>;
}

export interface CesiumResourceConfig {
  url: string;
  headers?: Record<string, string>;
  queryParameters?: Record<string, any>;
  retryAttempts?: number;
  retryDelay?: number;
}