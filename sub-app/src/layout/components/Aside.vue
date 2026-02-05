<template>
  <el-menu
    :default-active="activeMenu"
    mode="vertical"
    router
    background-color="#304156"
    text-color="#bfcbd9"
  >
    <sidebar-item
      v-for="route in userStore.dynamicMenus"
      :key="route.path"
      :item="route"
      :base-path="route.path"
    />
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store/user';
import SidebarItem from './SidebarItem.vue';

const route = useRoute();
const userStore = useUserStore();
const activeMenu = computed(() => route.path);
</script>