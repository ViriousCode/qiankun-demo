// main-app/src/store/user.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { globalMenuConfig, type MenuItem } from '@/config/menu';
// 【引入真实 API】
import { loginApi, getUserInfoApi } from '@/api/user';

// 递归过滤菜单函数 (保持不变)
const filterMenus = (menus: MenuItem[], perms: string[]): MenuItem[] => {
  const res: MenuItem[] = [];
  menus.forEach(menu => {
    if (menu.children) {
      menu.children = filterMenus(menu.children, perms);
    }
    const hasAuth = !menu.permission || perms.includes(menu.permission);
    if (hasAuth || (menu.children && menu.children.length > 0)) {
      res.push(menu);
    }
  });
  return res;
};

export const useUserStore = defineStore('user', () => {
  // 从 localStorage 初始化 Token
  const token = ref(localStorage.getItem('main-app-token') || '');
  const permissions = ref<string[]>([]);
  const menus = ref<MenuItem[]>([]);
  const userName = ref('');
  const roleId = ref('');

  // 1. 登录动作
  const login = async (loginForm: { username: string; password: string }) => {
    // 调用真实接口
    const data = await loginApi(loginForm);
    token.value = data.token;
    localStorage.setItem('main-app-token', data.token);
  };

  // 2. 获取用户信息动作
  const getUserInfo = async () => {
    try {
      // 调用真实接口 (axios 拦截器会自动带上 token)
      const data = await getUserInfoApi();

      permissions.value = data.permissions;
      userName.value = data.userName;
      roleId.value = data.roleId;

      // 根据后端返回的权限，计算菜单
      menus.value = filterMenus(JSON.parse(JSON.stringify(globalMenuConfig)), data.permissions);

      return data;
    } catch (error) {
      reset();
      throw error;
    }
  };

  // 3. 重置/登出
  const reset = () => {
    token.value = '';
    permissions.value = [];
    menus.value = [];
    userName.value = '';
    localStorage.removeItem('main-app-token');
  };

  return { token, permissions, menus, userName, roleId, login, getUserInfo, reset };
});