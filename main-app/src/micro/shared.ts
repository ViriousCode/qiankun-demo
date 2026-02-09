// main-app/src/micro/shared.ts
import { ref } from 'vue';

// 定义共享状态类型
export interface SharedState {
  token: string;
  user: any;
  permissions: string[];
  menus: any[];
}

// 内部状态
const state = ref<SharedState>({
  token: '',
  user: null,
  permissions: [],
  menus: []
});

// 订阅者列表
const listeners: Array<(state: SharedState) => void> = [];

/**
 * 改变状态并通知订阅者
 */
export const setSharedState = (newState: Partial<SharedState>) => {
  // 更新状态
  state.value = { ...state.value, ...newState };
  
  // 通知所有订阅者
  listeners.forEach(listener => listener(state.value));
};

/**
 * 获取当前状态快照
 */
export const getSharedState = () => state.value;

/**
 * 订阅状态变化
 * @param callback 状态变更时的回调
 * @returns 取消订阅的函数
 */
export const onSharedStateChange = (callback: (state: SharedState) => void) => {
  listeners.push(callback);
  // 返回取消订阅函数
  return () => {
    const index = listeners.indexOf(callback);
    if (index !== -1) listeners.splice(index, 1);
  };
};

// 导出给 props 使用的对象
export const sharedProps = {
  getSharedState,
  onSharedStateChange
};