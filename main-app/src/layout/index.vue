<template>
  <div class="app-wrapper">
    <Sidebar
      class="sidebar-box"
      :is-collapse="isCollapse"
      :style="{ width: isCollapse ? '64px' : '210px' }"
    />

    <div class="main-container">
      <Navbar :is-collapse="isCollapse" @toggle-click="toggleCollapse" />

      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useUserStore } from '@/store/user';
  import { initQiankun } from '@/micro';

  // 引入拆分后的子组件
  import Sidebar from './components/Sidebar/index.vue';
  import Navbar from './components/Navbar/index.vue';
  import AppMain from './components/AppMain/index.vue';

  // --- 状态管理 ---
  const isCollapse = ref(false);

  const toggleCollapse = () => {
    isCollapse.value = !isCollapse.value;
  };

  // --- 全局事件监听 ---
  const userStore = useUserStore();

  const handleGlobalRefresh = async () => {
    // 确保你的 userStore 中有 refreshAndSync 这个方法
    if (userStore.refreshAndSync) {
      await userStore.refreshAndSync();
    }
  };

  onMounted(() => {
    // 初始化微前端配置
    initQiankun();
    // 监听子应用传来的刷新权限事件
    window.addEventListener('global-refresh-permission', handleGlobalRefresh);
  });

  onUnmounted(() => {
    window.removeEventListener('global-refresh-permission', handleGlobalRefresh);
  });
</script>

<style scoped lang="scss">
  .app-wrapper {
    display: flex;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  .sidebar-box {
    flex-shrink: 0;
    transition: width 0.28s;
  }

  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color-page);
    overflow: hidden;
    transition: background-color 0.3s;
  }
</style>
