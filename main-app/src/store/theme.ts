import { defineStore } from 'pinia';
import { ref } from 'vue';
import { setGlobalTheme } from '@/utils/theme';
import { getBasicSettings } from '@/api/settings';

export const useThemeStore = defineStore('theme', () => {
  const themeColor = ref(localStorage.getItem('sys-theme-color') || '#409eff');

  const updateThemeColor = (color: string | null) => {
    const newColor = color || '#409eff';
    themeColor.value = newColor;
    setGlobalTheme(newColor);
  };

  const fetchAndApplyBasicConfig = async () => {
    const data = await getBasicSettings();
    if (data?.themeColor) {
      updateThemeColor(data.themeColor);
    }
    return data;
  };

  return {
    themeColor,
    updateThemeColor,
    fetchAndApplyBasicConfig
  };
});
