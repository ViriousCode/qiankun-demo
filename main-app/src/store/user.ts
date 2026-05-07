// main-app/src/store/user.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { loginApi, getUserInfoApi } from '@/api/user';
import { usePermissionStore } from './permission';
import { setSharedState } from '@/micro/shared';

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('main-app-token') || '');
  const permissions = ref<string[]>([]);

  // 🚨 【重构】：将分散的字段统一收纳到 userInfo 对象中
  const userInfo = ref({
    gender: '',
    deptName: '',
    userName: '',
    roleId: '' as string | number,
    roleKey: '',
    avatar: '',
    nickName: '',
    tenantId: null as number | null,
    email: '',
    phone: '',
    roleNames: [] as string[],
    orgPath: ''
  });

  // 辅助函数：同步状态到子应用
  const syncToSubApp = () => {
    const permissionStore = usePermissionStore();
    // 确保拿到的是最新的菜单
    const currentMenus = permissionStore.menus;

    setSharedState({
      token: token.value,
      // 🚨 直接传递完整的 userInfo 对象，子应用收到后直接覆盖即可
      user: userInfo.value,
      permissions: permissions.value,
      menus: currentMenus
    });
  };

  // 广播函数 (内部辅助，用于某些不走 Qiankun props 的场景)
  const broadcastPermissions = (perms: string[]) => {
    const event = new CustomEvent('global-sync-permissions', {
      detail: { permissions: perms }
    });
    window.dispatchEvent(event);
  };

  // 统一刷新并同步方法
  const refreshAndSync = async () => {
    const permissionStore = usePermissionStore();
    try {
      // 1. 刷新用户信息
      await getUserInfo();

      // 2. 刷新菜单
      await permissionStore.generateMenus();

      // 3. 广播权限
      broadcastPermissions(permissions.value);

      return true;
    } catch (error) {
      console.error('系统数据刷新失败', error);
      return false;
    }
  };

  // 登录
  const login = async (loginForm: { username: string; password: string }) => {
    const data = await loginApi(loginForm);
    token.value = data.token;
    localStorage.setItem('main-app-token', data.token);

    // 登录成功后，立刻同步 Token 给子应用
    syncToSubApp();
  };

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const data = await getUserInfoApi();
      permissions.value = data.permissions;

      // 🚨 【重构】：统一赋值给 userInfo
      userInfo.value = {
        gender: data.gender,
        deptName: data.deptName,
        userName: data.userName,
        roleId: data.roleId ?? '',
        roleKey: data.roleKey,
        avatar: data.avatar || '',
        nickName: data.nickName || '',
        tenantId: data.tenantId ?? null,
        email: data.email || '',
        phone: data.phone || '',
        roleNames: Array.isArray(data.roleNames) ? data.roleNames : [],
        orgPath: data.orgPath || data.deptName || ''
      };

      // 获取完完整信息后，同步给子应用
      syncToSubApp();

      return data;
    } catch (error) {
      reset();
      throw error;
    }
  };

  // 重置/登出
  const reset = () => {
    const permissionStore = usePermissionStore();
    token.value = '';
    permissions.value = [];

    // 🚨 清空 userInfo
    userInfo.value = {
      gender: '',
      deptName: '',
      userName: '',
      roleId: '',
      roleKey: '',
      avatar: '',
      nickName: '',
      tenantId: null,
      email: '',
      phone: '',
      roleNames: [],
      orgPath: ''
    };

    localStorage.removeItem('main-app-token');

    // 重置主应用菜单
    permissionStore.reset();

    // 通知子应用清空所有状态
    setSharedState({
      token: '',
      user: null, // 子应用收到 null 会自动重置
      permissions: [],
      menus: []
    });
  };

  return {
    token,
    permissions,
    userInfo,
    login,
    getUserInfo,
    reset,
    refreshAndSync
  };
});
