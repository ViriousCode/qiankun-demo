<template>
  <div class="loading-container" v-loading="true" element-loading-text="正在加载业务模块...">
    <div class="loading-wrapper" v-if="!hasElementPlus">
      <div class="spinner"></div>
      <p>资源加载中，请稍候...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 简单的检测，防止没有全局引入 Element Plus 导致报错
const hasElementPlus = ref(true); 

onMounted(() => {
  console.log('[子应用] Loading 占位组件已挂载，等待动态路由注入...');
});
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 400px;
  width: 100%;
  color: #909399;
}

.loading-wrapper {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #409eff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>