<template>
  <div class="sub-app-layout">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.sub-app-layout {
  padding: 20px;
  /* 可以加点背景色方便调试，看看是不是渲染了 */
  background-color: #f5f7fa; 
  min-height: 100vh;
}
</style>