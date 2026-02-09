// sub-app/src/store/permission.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getMenuList, type Menu } from '@/api/menu'; // 确保你有这个API定义
import { useUserStore } from './user';

// 复用相同的过滤逻辑
const filterMenus = (menus: Menu[], perms: string[]): Menu[] => {
  const res: Menu[] = [];
  menus.forEach(menu => {
    const tmp = { ...menu };
    if (tmp.children) {
      tmp.children = filterMenus(tmp.children, perms);
    }
    const hasPermission = !tmp.permission || perms.includes(tmp.permission);

    // 只要自身有权限，或者子节点有内容，就保留
    if (hasPermission || (tmp.children && tmp.children.length > 0)) {
      // 剔除空目录
      if (tmp.type === 'directory' && (!tmp.children || tmp.children.length === 0)) {
        return;
      }
      res.push(tmp);
    }
  });
  return res;
};

export const usePermissionStore = defineStore('permission', () => {
  const menus = ref<Menu[]>([]);

  // sub-app/src/store/permission.ts

  const setMenus = (rawMenus: any[]) => {
    // 假设主应用发来的是全量菜单，我们需要找到属于当前子应用的部分
    // 方式1：通过路径匹配
    const subAppPrefix = '/sub-app';

    // 递归处理菜单，确保路径正确
    const fixPaths = (items: any[]) => {
      return items.map(item => {
        const newItem = { ...item };
        // 如果路径包含前缀，去掉它，以便子应用 router 能匹配
        // (前提是子应用内的 router 定义是不带 /sub-app 的)
        if (newItem.path && newItem.path.startsWith(subAppPrefix)) {
          newItem.path = newItem.path.replace(subAppPrefix, '');
          // 保证以 / 开头
          if (!newItem.path.startsWith('/')) newItem.path = '/' + newItem.path;
        }
        if (newItem.children) newItem.children = fixPaths(newItem.children);
        return newItem;
      });
    };

    // 1. 尝试在树中找到子应用根节点
    let myMenus = rawMenus;
    const rootNode = rawMenus.find(m => m.path === subAppPrefix);
    if (rootNode && rootNode.children) {
      myMenus = rootNode.children;
    }

    // 2. 修正路径
    menus.value = fixPaths(myMenus);
    console.log('[子应用] 菜单已更新', menus.value);
  };

  const reset = () => {
    menus.value = [];
  };

  return { menus, setMenus, reset };
});