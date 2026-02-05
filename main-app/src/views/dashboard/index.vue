<template>
  <div class="dashboard">
    <h3>欢迎回来, {{ userStore.userInfo?.name }}</h3>
    <div class="cards">
      <div class="card">权限总数: {{ userStore.permissions.length }}</div>
      <div class="card">当前角色: {{ userStore.userInfo?.role }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user';
const userStore = useUserStore();
</script>

<style scoped>
.cards { display: flex; gap: 20px; margin-top: 20px; }
.card { background: white; padding: 30px; border-radius: 8px; flex: 1; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
</style>