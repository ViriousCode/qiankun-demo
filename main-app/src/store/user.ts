// main-app/src/store/user.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { loginApi, getUserInfoApi } from '@/api/user';
import { usePermissionStore } from './permission';
import { setSharedState } from '@/micro/shared'; // 引入自定义的通信方法

export const useUserStore = defineStore('user', () => {
  const permissionStore = usePermissionStore();
  const token = ref(localStorage.getItem('main-app-token') || '');
  const permissions = ref<string[]>([]);
  const userName = ref('');
  const roleId = ref('');

  // 辅助函数：同步状态到子应用
  const syncToSubApp = () => {
    const currentMenus = permissionStore.menus;
    setSharedState({
      token: token.value,
      user: {
        name: userName.value,
        roleId: roleId.value
      },
      permissions: permissions.value,
      menus: currentMenus
    });
  };

  // 1. 登录
  const login = async (loginForm: { username: string; password: string }) => {
    const data = await loginApi(loginForm);
    token.value = data.token;
    localStorage.setItem('main-app-token', data.token);

    // 登录成功，同步 Token
    syncToSubApp();
  };

  // 2. 获取用户信息
  const getUserInfo = async () => {
    try {
      const data = await getUserInfoApi();
      permissions.value = data.permissions;
      userName.value = data.userName;
      roleId.value = data.roleId;

      // 获取完信息，同步完整状态
      syncToSubApp();

      return data;
    } catch (error) {
      reset();
      throw error;
    }
  };

  // 3. 重置/登出
  const reset = () => {
    const permissionStore = usePermissionStore();
    token.value = '';
    permissions.value = [];
    userName.value = '';
    localStorage.removeItem('main-app-token');

    // 重置主应用菜单
    permissionStore.reset();

    // 通知子应用清空
    setSharedState({
      token: '',
      user: null,
      permissions: []
    });
  };

  return { token, permissions, userName, roleId, login, getUserInfo, reset };
});