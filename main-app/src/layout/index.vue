<template>
  <div class="app-wrapper">
    <div class="sidebar">
      <div class="logo">主应用基座</div>
      <!-- <el-menu router>
        <el-menu-item index="/dashboard">控制台</el-menu-item>
        
        <template v-for="menu in userStore.subAppMenus" :key="menu.path">
          <el-sub-menu v-if="menu.children" :index="menu.path">
            <template #title>{{ menu.meta.title }}</template>
<el-menu-item v-for="child in menu.children" :key="child.path" :index="`/sub-app/${child.path}`">
  {{ child.meta.title }}
</el-menu-item>
</el-sub-menu>
</template>
</el-menu> -->
      <el-menu router :default-active="$route.path">
        
        <template v-for="menu in userStore.menus" :key="menu.path">
          
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
            <template #title>
              <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
              <span>{{ menu.title }}</span>
            </template>
            <el-menu-item 
              v-for="child in menu.children" 
              :key="child.path" 
              :index="child.path"
            >
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item v-else :index="menu.path">
             <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
             <span>{{ menu.title }}</span>
          </el-menu-item>
        </template>

      </el-menu>
    </div>

    <div class="main-container">
      <router-view />

      <div id="sub-app-container"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '@/store/user';
import { initQiankun } from '@/micro';

const userStore = useUserStore();

onMounted(async () => {
  // 1. 模拟登录获取权限
  if (!userStore.token) {
    await userStore.login();
  }
  // 2. 启动 Qiankun
  initQiankun();
});
</script>

<style scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 200px;
  background: #f0f2f5;
}

.main-container {
  flex: 1;
  padding: 20px;
}
</style>