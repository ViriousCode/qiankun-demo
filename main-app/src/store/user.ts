// import { defineStore } from 'pinia';
// import { ref } from 'vue';

// export const useUserStore = defineStore('user', () => {
//   const permissions = ref<string[]>([]);
//   const userInfo = ref({ name: 'Admin', role: 'admin' });
//   // 确保 isLoggedIn 是在这里定义的
//   const isLoggedIn = computed(() => !!userInfo.value);
//   const fetchUserInfo = async () => {
//     // todo 接口请求
//     permissions.value = [
//       // 'app:cesium-demo',
//       // 'app:three-demo',
//       '/testView1',
//       '/testView2',
//       'dashboard',
//       'app:sub-app',
//       'test1:list',
//       'test2:list',
//       'test1:add',
//       // 'test2:add',
//       // 'test1:delete',
//       'test2:delete',
//       'test1:edit',
//       'test2:edit',
//       'test1:query',
//       'test2:query',
//       'test1:import',
//       'test2:import',
//       'test1:export',
//       'test2:export',
//       'sub-app-order'
//     ];
//   };
//   const reset = () => {
//     permissions.value = [];
//     userInfo.value = { name: '', role: '' };
//     // 如果有其他状态也在这里清空
//   };
//   return {
//     permissions,
//     userInfo,
//     isLoggedIn,
//     fetchUserInfo,
//     reset
//   };
// });
import { globalMenuConfig, type MenuItem } from '@/config/menu';
import { defineStore } from 'pinia';
import { ref } from 'vue';

// 递归过滤函数
const filterMenus = (menus: MenuItem[], perms: string[]): MenuItem[] => {
  const res: MenuItem[] = [];
  menus.forEach(menu => {
    // 1. 检查是否有子节点
    if (menu.children) {
      menu.children = filterMenus(menu.children, perms);
    }
    
    // 2. 权限判断
    // 如果菜单没配置 permission，视为公开；如果配置了，检查是否在 perms 数组里
    const hasAuth = !menu.permission || perms.includes(menu.permission);
    
    // 3. 只有当自己有权限，或者子节点有内容时才保留
    if (hasAuth || (menu.children && menu.children.length > 0)) {
      res.push(menu);
    }
  });
  return res;
};

// 模拟后端接口
const mockLoginApi = () => {
  return new Promise<{ token: string; permissions: string[] }>((resolve) => {
    setTimeout(() => {
      resolve({
        token: 'mock-token-123456',
        // 这里包含主应用权限(main:*) 和 子应用权限(sub:*)
        permissions: ['main:dashboard', 'sub:order:list', 'sub:order:detail'] 
      });
    }, 800); // 模拟 800ms 延迟
  });
};

export const useUserStore = defineStore('user', () => {
  const token = ref('');
  const permissions = ref<string[]>([]);
  const menus = ref<MenuItem[]>([]); // 最终展示的菜单

  const login = async () => {
    const data = await mockLoginApi();
    token.value = data.token;
    permissions.value = data.permissions;
    
    // 【核心变化】：登录成功后，立刻计算菜单
    menus.value = filterMenus(JSON.parse(JSON.stringify(globalMenuConfig)), data.permissions);
    
    return data;
  };

  return { token, permissions, menus, login };
});