// main-app/src/store/permission.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getMenuList, type Menu } from '@/api/munu';
import { useUserStore } from './user';

/**
 * 递归过滤菜单
 * @param menus 菜单列表
 * @param perms 用户权限列表
 */
const filterMenus = (menus: Menu[], perms: string[]): Menu[] => {
  const res: Menu[] = [];
  menus.forEach(menu => {
    // 浅拷贝对象，避免修改原引用
    const tmp = { ...menu };

    // 1. 优先递归处理子节点
    if (tmp.children) {
      tmp.children = filterMenus(tmp.children, perms);
    }

    // 2. 权限判断逻辑
    // - 如果菜单没有配置 permission 属性，默认认为可见
    // - 如果配置了，必须在用户的 perms 列表中存在
    const hasPermission = !tmp.permission || perms.includes(tmp.permission);

    // 3. 决定是否显示
    // - 自身有权限
    // - 或者有可见的子节点 (父级往往作为目录，需要跟随子级显示)
    if (hasPermission || (tmp.children && tmp.children.length > 0)) {
      // 特殊处理：如果是目录(directory)，但过滤后没有子节点了，通常不显示
      if (tmp.type === 'directory' && (!tmp.children || tmp.children.length === 0)) {
        return;
      }
      res.push(tmp);
    }
  });
  return res;
};

/**
 * 路径前缀处理 (为子应用路由添加 /sub-app 前缀)
 */
const transformMenuPath = (menus: Menu[], prefix: string = '/sub-app'): Menu[] => {
  return menus.map(item => {
    const newItem = { ...item };
    // 排除 Dashboard 等主应用自身路由
    if (newItem.path && !newItem.app?.includes('main') && !newItem.path.startsWith(prefix)) {
      newItem.path = `${prefix}${newItem.path.startsWith('/') ? '' : '/'}${newItem.path}`;
    }
    if (newItem.children && newItem.children.length > 0) {
      newItem.children = transformMenuPath(newItem.children, prefix);
    }
    return newItem;
  });
};

export const usePermissionStore = defineStore('permission', () => {
  const menus = ref<Menu[]>([]);
  const isRoutesLoaded = ref(false);

  const generateMenus = async () => {
    const userStore = useUserStore();

    try {
      // 1. 从后端获取完整菜单树
      const data = await getMenuList(); // 假设后端返回结构 { code: 200, data: [...] }

      if (!data) return;

      // 2. 先进行权限过滤 (使用 userStore 中的 permissions)
      const filtered = filterMenus(data, userStore.permissions);

      // 3. 再进行路径转换 (适配微前端路由)
      const transformed = transformMenuPath(filtered);

      menus.value = transformed;
      isRoutesLoaded.value = true;
    } catch (error) {
      console.error('生成菜单失败:', error);
      menus.value = [];
    }
  };

  const reset = () => {
    menus.value = [];
    isRoutesLoaded.value = false;
  };

  return { menus, isRoutesLoaded, generateMenus, reset };
});