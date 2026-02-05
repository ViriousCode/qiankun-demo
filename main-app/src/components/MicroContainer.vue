<template>
  <div class="micro-app-wrapper">
    <div ref="containerRef" class="sub-container-box"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { loadMicroApp, type MicroApp } from 'qiankun';
import { useMicroConfig } from '@/core/micro-frontend/config';

const props = defineProps<{ name: string }>();
const { subApps, globalData } = useMicroConfig();
const containerRef = ref<HTMLElement | null>(null);
let appInstance: MicroApp | null = null;

onMounted(() => {
  const config = subApps.find(a => a.name === props.name);
  if (config && containerRef.value) {
    console.log(`[主应用] 正式容器挂载子应用: ${props.name}`);
    appInstance = loadMicroApp({
      ...config,
      container: containerRef.value,
      props: { ...config.props, isSilent: false, globalData }
    });
  }
});

onUnmounted(async () => {
  if (appInstance) {
    console.log(`[主应用] 正在卸载正式实例: ${props.name}`);
    await appInstance.unmount();
    appInstance = null;
  }
});
</script>