import { ref, onMounted, onUnmounted } from 'vue';
import { WEEK_DAY_NAMES } from './constants';

export function useWorkbenchTime() {
  const currentDateTime = ref('');
  const weekDay = ref('');
  /** 天气文案，预留：可后续接入天气 API 后赋值 */
  const weatherText = ref('晴转多云');

  const updateTime = () => {
    const now = new Date();
    currentDateTime.value = now
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
      .replace(/\//g, ' - ');
    weekDay.value = WEEK_DAY_NAMES[now.getDay()] ?? '星期日';
  };

  let timeTimer: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    updateTime();
    timeTimer = setInterval(updateTime, 1000);
  });

  onUnmounted(() => {
    if (timeTimer) clearInterval(timeTimer);
  });

  return {
    currentDateTime,
    weekDay,
    weatherText
  };
}
