<template>
  <div class="app-wrapper">
    <Navbar />
    <div class="main-container">
      <Sidebar
        v-if="showSidebar"
        class="sidebar-box"
        :class="{ 'is-collapsed': isSidebarCollapsed }"
        :is-collapse="isSidebarCollapsed"
        @toggle-collapse="toggleSidebarCollapse"
      />
      <!-- <TagsView /> -->
      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useUserStore } from '@/store/user';
  import { initQiankun } from '@/micro';

  // 引入拆分后的子组件
  import Sidebar from './components/Sidebar/index.vue';
  import Navbar from './components/Navbar/index.vue';
  import AppMain from './components/AppMain/index.vue';
  // import TagsView from './components/TagsView/index.vue';

  const route = useRoute();
  const isWorkbench = computed(() => route.path === '/workbench');
  const isPlatformAppAi = computed(
    () => route.path === '/platform-app-ai' || route.path.startsWith('/platform-app-ai/')
  );
  const showSidebar = computed(() => !isWorkbench.value && !isPlatformAppAi.value);
  const isSidebarCollapsed = ref(false);

  const toggleSidebarCollapse = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
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
    // display: flex;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  .sidebar-box {
    width: 230px;
    flex-shrink: 0;
    transition: width 0.28s;
  }

  .sidebar-box.is-collapsed {
    min-width: 66px;
    width: 66px;
  }

  .main-container {
    display: flex;
    height: calc(100vh - 66px);
    // flex-direction: column;
    background-color: transparent;
    // overflow: hidden;
    transition: background-color 0.3s;
  }
</style>
