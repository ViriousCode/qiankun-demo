import { watchEffect } from 'vue';
import type { Directive } from 'vue';
import { useUserStore } from '@/store/user';

export const permission: Directive = {
  // mounted 钩子处理首次加载
  mounted(el: HTMLElement, binding) {
    const { value } = binding; // 获取 v-permission="'user:add'" 中的值
    const authStore = useUserStore();

    // 逻辑封装：根据权限决定是否渲染
    const checkPermission = () => {
      const hasAuth = authStore.permissions.includes(value);

      if (!hasAuth) {
        // 如果没有权限，直接从 DOM 树中移除
        el.parentNode?.removeChild(el);
      }
    };

    // 第一次执行
    checkPermission();

    // [可选] 如果权限是动态变化的，可以监听 authStore 的变化
    // 注意：一旦 el 被 removeChild 移除，该指令实例通常随之销毁
    // 如果需要频繁切换显示隐藏，建议使用 v-if 或配合 CSS display: none
  }
};