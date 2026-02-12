<template>
  <div class="sidebar-container" :class="{ 'has-logo': true }">
    <div class="logo-wrapper">
      <el-icon :size="24" color="#fff" style="margin-right: 10px">
        <Platform />
      </el-icon>
      <h1 class="logo-title" v-show="!isCollapse">微前端基座</h1>
    </div>

    <el-scrollbar>
      <el-menu router :default-active="$route.path" :collapse="isCollapse" background-color="#304156"
        text-color="#bfcbd9" active-text-color="#409EFF" :unique-opened="true" class="el-menu-vertical">
        <sidebar-item v-for="menu in permissionStore.menus" :key="menu.path" :item="menu" :base-path="menu.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { usePermissionStore } from '@/store/permission';
import { Platform } from '@element-plus/icons-vue';
// 引入移动到同级目录的 SidebarItem 组件
import SidebarItem from './SidebarItem.vue';

defineProps<{ isCollapse: boolean }>();

const permissionStore = usePermissionStore();
</script>

<style scoped lang="scss">
$headerHeight: 50px;
$menuBg: #304156;
$menuHover: #263445;
$subMenuBg: #1f2d3d;

.sidebar-container {
  height: 100%;
  background-color: $menuBg;
  transition: width 0.28s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  z-index: 1001;
}

.logo-wrapper {
  height: $headerHeight;
  line-height: $headerHeight;
  background: #2b2f3a;
  text-align: center;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .logo-title {
    color: #fff;
    font-weight: 600;
    font-size: 14px;
    font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
    white-space: nowrap;
    margin: 0;
  }
}

.el-menu-vertical {
  border-right: none;
}

:deep(.el-menu) {
  background-color: $menuBg;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: $menuHover !important;
}

:deep(.el-sub-menu .el-menu-item) {
  background-color: $subMenuBg !important;

  &:hover {
    background-color: #001528 !important;
  }
}
</style>