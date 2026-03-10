/**
 * 颜色混合算法（用来模仿 sass 的 mix 函数）
 * @param color1 基础色（如主题色）
 * @param color2 混合色（如纯白或纯黑）
 * @param weight 混合比例（0-1）
 */
export function mixColor(color1: string, color2: string, weight: number) {
  const r = parseInt(color1.substring(1, 3), 16);
  const g = parseInt(color1.substring(3, 5), 16);
  const b = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  const rMix = Math.round(r * (1 - weight) + r2 * weight);
  const gMix = Math.round(g * (1 - weight) + g2 * weight);
  const bMix = Math.round(b * (1 - weight) + b2 * weight);

  return `#${rMix.toString(16).padStart(2, '0')}${gMix.toString(16).padStart(2, '0')}${bMix.toString(16).padStart(2, '0')}`;
}

/**
 * 设置应用全局主题色
 * @param color 16进制颜色值，如 '#409eff'
 */
export function setGlobalTheme(color: string) {
  if (!color) return;

  const el = document.documentElement;
  // 🌟 核心判断：当前是否处于暗黑模式？
  const isDark = el.classList.contains('dark');

  // Element Plus 暗黑模式的混合基准色是 #141414，亮色模式是 #ffffff
  const mixLightBase = isDark ? '#141414' : '#ffffff';
  const mixDarkBase = isDark ? '#ffffff' : '#000000';

  // 1. 设置主色调
  el.style.setProperty('--el-color-primary', color);

  // 2. 循环设置浅色衍生变量
  for (let i = 1; i <= 9; i++) {
    const lightColor = mixColor(color, mixLightBase, i * 0.1);
    el.style.setProperty(`--el-color-primary-light-${i}`, lightColor);
  }

  // 3. 设置深色衍生变量 (active 点击按下时的颜色)
  const darkColor = mixColor(color, mixDarkBase, 0.2);
  el.style.setProperty('--el-color-primary-dark-2', darkColor);

  // 存入本地缓存
  localStorage.setItem('sys-theme-color', color);
}

/**
 * 初始化加载本地主题色
 */
/**
 * 初始化加载本地主题色和暗黑模式
 */
export function initTheme() {
  const el = document.documentElement;

  // 1. 优先恢复暗黑模式状态
  const storedDark = localStorage.getItem('sys-dark-mode');
  let isDark;

  if (storedDark !== null) {
    // 如果用户之前手动切换过，以用户的缓存为准
    isDark = storedDark === 'true';
  } else {
    // 如果没有缓存，通过原生 API 探测操作系统是否处于暗黑模式
    isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // 给 html 标签打上/移除 dark 标识
  if (isDark) {
    el.classList.add('dark');
  } else {
    el.classList.remove('dark');
  }

  // 2. 恢复自定义主题色
  const savedColor = localStorage.getItem('sys-theme-color');
  if (savedColor) {
    // 这里调用 setGlobalTheme，它内部会根据刚才设置的 dark class 正确计算衍生色
    setGlobalTheme(savedColor);
  }
}
