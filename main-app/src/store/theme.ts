import { defineStore } from 'pinia';
import { ref } from 'vue';
import { setGlobalTheme } from '@/utils/theme';

export const useThemeStore = defineStore('theme', () => {
  const themeColor = ref(localStorage.getItem('sys-theme-color') || '#409eff');

  const updateThemeColor = (color: string | null) => {
    const newColor = color || '#409eff';
    themeColor.value = newColor;
    setGlobalTheme(newColor);
  };

  return {
    themeColor,
    updateThemeColor
  };
});
