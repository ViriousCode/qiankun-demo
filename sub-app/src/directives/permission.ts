import { useUserStore } from '@/store/user';
import { watch } from 'vue';
import type { Directive, DirectiveBinding } from 'vue';

export const vPermission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    const userStore = useUserStore();
    const all_permission = "*:*:*";

    const updateDisplay = () => {
      const perms = userStore.permissions || [];
      // 【调试日志】打开控制台，确认这个日志打印了，且 perms 里确实没有该权限
      // console.log(`[指令检查] 目标权限: ${value} | 当前持有:`, perms);

      let hasPermission = false;
      if (value && value instanceof Array && value.length > 0) {
        hasPermission = perms.some((perm) => {
          return perm === all_permission || value.includes(perm);
        });
      } else if (value && typeof value === 'string') {
        hasPermission = perms.includes(value) || perms.includes(all_permission);
      }

      if (!hasPermission) {
        // 【核心修改】使用 setProperty 加上 !important，防止被其他样式覆盖
        el.style.setProperty('display', 'none', 'important');
      } else {
        // 恢复显示时，清空 display 属性，让它回退到 CSS 定义的默认值 (block/flex/inline)
        el.style.removeProperty('display');
      }
    };

    // 监听 store 变化
    const stopWatch = watch(
      () => userStore.permissions, 
      updateDisplay, 
      { immediate: true, deep: true }
    );

    (el as any)._stopWatch = stopWatch;
  },

  unmounted(el: HTMLElement) {
    if ((el as any)._stopWatch) (el as any)._stopWatch();
  }
};