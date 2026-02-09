import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('');
  const permissions = ref<string[]>([]);
  const userInfo = ref({ name: '', role: '', roleId: '' });
  const setPermissions = (perms: string[]) => {
    permissions.value = perms;
  };
  const setUserInfo = (info: any) => {
    userInfo.value = info;
  };

  const reset = () => {
    token.value = '';
    permissions.value = [];
    userInfo.value = { name: '', role: '', roleId: '' };
  };

  return {
    token,
    permissions,
    userInfo,
    setPermissions,
    setUserInfo,
    reset
  };
});