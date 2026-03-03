<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { initTheme } from '@/utils/theme';

  onMounted(() => {
    // 🌟 页面加载时恢复用户之前选择的主题色
    initTheme();
  });
</script>

<style>
  body,
  html,
  #app {
    margin: 0;
    padding: 0;
    height: 100%;
  }
</style>
