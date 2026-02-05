import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

export const useUserStore = defineStore('user', () => {
  const permissions = ref<string[]>([]);
  const userInfo = ref({ name: '', role: '' });

  const setPermissions = (perms: string[]) => {
    permissions.value = perms;
  };
  const dynamicMenus = ref<RouteRecordRaw[]>([]);
  const setUserInfo = (info: any) => {
    userInfo.value = info;
  };

  return {
    permissions,
    userInfo,
    dynamicMenus,
    setPermissions,
    setUserInfo
  };
});