<template>
  <div class="sidebar-container" :class="{ 'has-logo': true }">
    <div class="logo-wrapper">
      <el-icon :size="24" color="var(--el-color-primary)" style="margin-right: 10px">
        <Platform />
      </el-icon>
      <h1 class="logo-title" v-show="!isCollapse">微前端基座</h1>
    </div>

    <el-scrollbar>
      <el-menu
        router
        :default-active="$route.path"
        :collapse="isCollapse"
        :unique-opened="true"
        class="el-menu-vertical"
      >
        <sidebar-item
          v-for="menu in permissionStore.menus"
          :key="menu.path"
          :item="menu"
          :base-path="menu.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
  import { usePermissionStore } from '@/store/permission';
  import { Platform } from '@element-plus/icons-vue';
  import SidebarItem from './SidebarItem.vue';

  defineProps<{ isCollapse: boolean }>();

  const permissionStore = usePermissionStore();
</script>

<style scoped lang="scss">
  $headerHeight: 50px;

  .sidebar-container {
    height: 100%;
    background-color: var(--el-bg-color); /* 自动适配白底/黑底 */
    transition: width 0.28s;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: var(--el-box-shadow-light);
    border-right: 1px solid var(--el-border-color-light);
    z-index: 1001;
  }

  .logo-wrapper {
    height: $headerHeight;
    line-height: $headerHeight;
    background: var(--el-bg-color); /* 跟随主背景 */
    text-align: center;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--el-border-color-light);

    .logo-title {
      color: var(--el-text-color-primary); /* 自动适配黑字/白字 */
      font-weight: 600;
      font-size: 14px;
      font-family:
        Avenir,
        Helvetica Neue,
        Arial,
        Helvetica,
        sans-serif;
      white-space: nowrap;
      margin: 0;
    }
  }

  .el-menu-vertical {
    border-right: none;
  }

  :deep(.el-menu) {
    background-color: var(--el-bg-color);
  }

  /* 悬浮时的背景色适配 */
  :deep(.el-menu-item:hover),
  :deep(.el-sub-menu__title:hover) {
    background-color: var(--el-fill-color-light) !important;
  }

  :deep(.el-sub-menu .el-menu-item) {
    background-color: var(--el-bg-color) !important;

    &:hover {
      background-color: var(--el-fill-color-light) !important;
    }

    color: var(--el-text-color-regular); /* 子菜单文字略浅 */
  }

  /* 激活项的背景和文字适配 */
  :deep(.el-menu-item.is-active) {
    background-color: var(--el-color-primary-light-9) !important;
    color: var(--el-color-primary);
  }
</style>
