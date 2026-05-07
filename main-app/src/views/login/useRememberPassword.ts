import { ref } from 'vue';
import { LOGIN_STORAGE_KEYS } from './constants';

export interface LoginFormCredentials {
  username: string;
  password: string;
}

export function useRememberPassword(form: LoginFormCredentials) {
  const rememberPassword = ref(false);

  const loadSavedCredentials = () => {
    const remembered = localStorage.getItem(LOGIN_STORAGE_KEYS.remember) === '1';
    rememberPassword.value = remembered;
    form.username = localStorage.getItem(LOGIN_STORAGE_KEYS.username) ?? '';
    if (remembered) {
      form.password = localStorage.getItem(LOGIN_STORAGE_KEYS.password) ?? '';
    }
  };

  const saveCredentials = () => {
    localStorage.setItem(LOGIN_STORAGE_KEYS.username, form.username);
    if (rememberPassword.value) {
      localStorage.setItem(LOGIN_STORAGE_KEYS.remember, '1');
      localStorage.setItem(LOGIN_STORAGE_KEYS.password, form.password);
    } else {
      localStorage.removeItem(LOGIN_STORAGE_KEYS.remember);
      localStorage.removeItem(LOGIN_STORAGE_KEYS.password);
    }
  };

  return {
    rememberPassword,
    loadSavedCredentials,
    saveCredentials
  };
}
