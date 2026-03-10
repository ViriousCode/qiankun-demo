// src/store/system.ts (建议新建)
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSecuritySettings, type SecurityConfig } from '@/api/settings';

export const useSystemStore = defineStore('system', () => {
  const passwordPolicy = ref<SecurityConfig>({
    minLength: 8,
    complexity: ['lowercase', 'number'], // 默认值
    defaultPassword: '',
    expireDays: 0,
    maxFailures: 5
  });

  // 获取最新的策略
  const fetchPasswordPolicy = async () => {
    const data = await getSecuritySettings();
    if (data) passwordPolicy.value = data;
  };

  return { passwordPolicy, fetchPasswordPolicy };
});
