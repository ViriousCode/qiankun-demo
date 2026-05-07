<template>
  <div class="sidebar-container" :class="{ 'is-collapsed': isCollapse }">
    <el-scrollbar class="sidebar-scroll">
      <transition name="sidebar-module" mode="out-in">
        <el-menu
          :key="menuRenderKey"
          router
          :default-active="activeMenuIndex"
          :collapse="isCollapse"
          class="el-menu-vertical"
        >
          <sidebar-item
            v-for="menu in visibleMenus"
            :key="menu.path || menu.meta?.title"
            :item="menu"
            :base-path="menu.path"
            :is-collapse="isCollapse"
            :active-root-key="activeRootKey"
          />
        </el-menu>
      </transition>
    </el-scrollbar>
    <el-tooltip :content="isCollapse ? '展开' : '收起'" effect="dark" placement="right">
      <div
        class="collapse-btn"
        :class="{ 'is-collapsed': isCollapse }"
        :aria-label="isCollapse ? '展开' : '收起'"
        @click="emit('toggle-collapse')"
      ></div>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { usePermissionStore } from '@/store/permission';
  import SidebarItem from './SidebarItem.vue';

  const props = defineProps<{ isCollapse: boolean }>();
  const emit = defineEmits<{ (e: 'toggle-collapse'): void }>();

  const route = useRoute();
  const permissionStore = usePermissionStore();

  /** 仅展示当前所在模块下的菜单（如个人中心 / 管理中心 / 测试子应用） */
  const visibleMenus = computed(() => permissionStore.getVisibleMenus(route.path));

  /** 用于 transition 的稳定 key，避免切换时整块 DOM 重排导致先缩小再卡顿 */
  const visibleModuleKey = computed(() => {
    const menus = visibleMenus.value;
    if (!menus.length) return 'none';
    const first = menus[0];
    return first?.meta?.title || first?.path || 'default';
  });

  const menuRenderKey = computed(
    () => `${visibleModuleKey.value}-${isCollapse.value ? 'collapsed' : 'expanded'}`
  );

  const normalizePath = (value: string) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (raw === '/') return '/';
    const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
    return withSlash.replace(/\/+$/, '');
  };

  const subtreeContainsPath = (menu: any, routePath: string): boolean => {
    if (!menu) return false;
    const current = normalizePath(menu.path);
    const target = normalizePath(routePath);
    if (current && (target === current || target.startsWith(`${current}/`))) return true;
    if (!menu.children?.length) return false;
    return menu.children.some((child: any) => subtreeContainsPath(child, routePath));
  };

  const getMenuKey = (menu: any): string => {
    const p = normalizePath(menu?.path || '');
    return p || String(menu?.meta?.title || '');
  };

  /** 折叠态下：二级/三级命中时，让一级菜单保持高亮 */
  const activeMenuIndex = computed(() => {
    const currentPath = route.path;
    if (!isCollapse.value) return currentPath;
    const topLevel = visibleMenus.value.find((menu: any) => subtreeContainsPath(menu, currentPath));
    const topLevelPath = normalizePath(topLevel?.path || '');
    return topLevelPath || currentPath;
  });

  const activeRootKey = computed(() => {
    if (!isCollapse.value) return '';
    const currentPath = route.path;
    const topLevel = visibleMenus.value.find((menu: any) => subtreeContainsPath(menu, currentPath));
    return topLevel ? getMenuKey(topLevel) : '';
  });

  const isCollapse = computed(() => props.isCollapse);
</script>

<style scoped lang="scss">
  .sidebar-container {
    height: calc(100vh - 66px);
    min-height: 0;
    background: #ffffff;
    transition: width 0.28s;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
    border-right: 1px solid var(--el-border-color-lighter);
    z-index: 1001;
  }

  .sidebar-scroll {
    flex: 1;
    min-height: 0;
    position: relative;
  }

  .collapse-btn {
    width: 20px;
    height: 17px;
    border: none;
    background: url('@/assets/image/sidebar/btn_menu_collapse.webp') no-repeat center center;
    background-size: 100% 100%;
    cursor: pointer;
    transition: transform 0.2s ease;
    margin: 0 0 27px 19px;
  }

  .collapse-btn.is-collapsed {
    transform: rotate(180deg);
  }

  /* 切换模块时过渡，避免先缩小再卡一下的观感 */
  .sidebar-module-enter-active,
  .sidebar-module-leave-active {
    transition: opacity 0.12s ease;
  }

  .sidebar-module-enter-from,
  .sidebar-module-leave-to {
    opacity: 0;
  }

  .sidebar-module-leave-active {
    position: absolute;
    left: 0;
    right: 9px;
    top: 0;
    bottom: 0;
    pointer-events: none;
  }

  .sidebar-scroll :deep(.el-scrollbar__view) {
    min-height: 100%;
    position: relative;
  }

  .sidebar-scroll :deep(.el-scrollbar__wrap) {
    scrollbar-gutter: stable;
  }

  .el-menu-vertical {
    border-right: none;
    padding: 8px 5px;
  }

  :deep(.el-menu) {
    background-color: transparent;
  }

  /* 侧边栏菜单本体：子菜单右侧箭头位置 */
  .sidebar-container :deep(.el-sub-menu__icon-arrow) {
    right: 15px;
  }

  /* 菜单项基础形态：圆角胶囊 + 间距 */
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    margin: 4px 0;
    border-radius: 8px;
    height: 48px;
    line-height: 48px;
    padding: 0 15px;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 400;
    font-size: 16px;
    color: #333333;

    .el-menu-tooltip__trigger {
      justify-content: center;
    }
  }

  /* 子菜单项仅多左侧缩进（其余与上列一致） */
  :deep(.el-sub-menu .el-menu-item) {
    padding: 0 14px 0 28px;
    background-color: transparent !important;
  }

  /* 二级标题与一级标题文本左边缘对齐（一级：14 + icon24 + gap13 = 51） */
  :deep(.menu-level-2.el-menu-item),
  :deep(.menu-level-2 > .el-sub-menu__title) {
    padding-left: 57px !important;
  }

  /* 三级在二级基础上额外缩进 */
  :deep(.menu-level-3.el-menu-item),
  :deep(.menu-level-3 > .el-sub-menu__title) {
    padding-left: 70px !important;
  }

  /* 悬浮态：与选中态一致 */
  :deep(.el-menu-item:hover),
  :deep(.el-sub-menu__title:hover) {
    background: #2a78ff !important;
    color: #ffffff !important;
    font-weight: 500 !important;
  }

  :deep(.el-menu-item:hover .el-icon),
  :deep(.el-menu-item:hover .menu-icon-wrapper),
  :deep(.el-menu-item:hover span),
  :deep(.el-sub-menu__title:hover .el-icon),
  :deep(.el-sub-menu__title:hover .menu-icon-wrapper),
  :deep(.el-sub-menu__title:hover span) {
    color: #fff !important;
    font-weight: 500 !important;
  }

  /* 选中态：实心蓝底 + 白字/白图标（line-height 与高度一致，避免抖动） */
  :deep(.el-menu-item.is-active) {
    background: #2a78ff !important;
    border-radius: 8px;
    font-weight: 500 !important;
    color: #ffffff;
    line-height: 48px;
  }

  /* 目录节点激活态仅在折叠时生效（非折叠不高亮一级） */
  .sidebar-container.is-collapsed :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
    background: #2a78ff !important;
    border-radius: 8px;
    font-weight: 500 !important;
    color: #ffffff;
  }

  .sidebar-container.is-collapsed :deep(.el-menu-item.root-active) {
    background: #2a78ff !important;
    border-radius: 8px;
    font-weight: 500 !important;
    color: #ffffff;
  }

  .sidebar-container.is-collapsed :deep(.el-sub-menu.root-active > .el-sub-menu__title) {
    background: #2a78ff !important;
    border-radius: 8px;
    font-weight: 500 !important;
    color: #ffffff;
  }

  :deep(.el-menu-item.is-active .el-icon),
  :deep(.el-menu-item.is-active .menu-icon-wrapper),
  :deep(.el-menu-item.is-active span) {
    color: #fff !important;
    font-weight: 500 !important;
  }

  .sidebar-container.is-collapsed :deep(.el-sub-menu.is-active > .el-sub-menu__title .el-icon),
  .sidebar-container.is-collapsed
    :deep(.el-sub-menu.is-active > .el-sub-menu__title .menu-icon-wrapper),
  .sidebar-container.is-collapsed :deep(.el-sub-menu.is-active > .el-sub-menu__title span) {
    color: #fff !important;
    font-weight: 500 !important;
  }

  .sidebar-container.is-collapsed :deep(.el-menu-item.root-active .el-icon),
  .sidebar-container.is-collapsed :deep(.el-menu-item.root-active .menu-icon-wrapper),
  .sidebar-container.is-collapsed :deep(.el-menu-item.root-active span),
  .sidebar-container.is-collapsed :deep(.el-sub-menu.root-active > .el-sub-menu__title .el-icon),
  .sidebar-container.is-collapsed
    :deep(.el-sub-menu.root-active > .el-sub-menu__title .menu-icon-wrapper),
  .sidebar-container.is-collapsed :deep(.el-sub-menu.root-active > .el-sub-menu__title span) {
    color: #fff !important;
    font-weight: 500 !important;
  }

  :deep(.azura-icon__svg) {
    color: rgba(136, 136, 136, 1);
  }

  :deep(.el-menu-item.is-active .azura-icon__svg) {
    color: #ffffff;
  }

  .sidebar-container.is-collapsed
    :deep(.el-sub-menu.is-active > .el-sub-menu__title .azura-icon__svg) {
    color: #ffffff;
  }

  .sidebar-container.is-collapsed :deep(.el-menu-item.root-active .azura-icon__svg),
  .sidebar-container.is-collapsed
    :deep(.el-sub-menu.root-active > .el-sub-menu__title .azura-icon__svg) {
    color: #ffffff;
  }

  :deep(.el-menu-item:hover .azura-icon__svg),
  :deep(.el-sub-menu__title:hover .azura-icon__svg) {
    color: #ffffff;
  }
</style>

<style lang="scss">
  /* 折叠态右侧弹层样式（teleport 到 body，需非 scoped） */
  .sidebar-collapse-popper {
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    overflow: visible;
    min-width: 170px;
    z-index: 3000;
  }

  .sidebar-collapse-popper .el-menu {
    border-right: none;
    padding: 0;
    background: #fff;
    border-radius: 4px;
    overflow: hidden;
  }

  .sidebar-collapse-popper .el-menu-item,
  .sidebar-collapse-popper .el-sub-menu__title {
    height: 56px;
    line-height: 56px;
    border-radius: 4px;
    margin: 0;
    font-size: 16px;
  }

  .sidebar-collapse-popper .el-menu-item:hover,
  .sidebar-collapse-popper .el-sub-menu__title:hover,
  .sidebar-collapse-popper .el-menu-item.is-active,
  .sidebar-collapse-popper .el-sub-menu.is-active > .el-sub-menu__title {
    background: #2a78ff !important;
    color: #fff !important;
  }

  .sidebar-collapse-popper .el-sub-menu__icon-arrow {
    right: 16px;
  }

  /* 折叠弹层紧贴展开，避免多级之间出现白色缝隙 */
  .sidebar-collapse-popper-level-1,
  .sidebar-collapse-popper-level-2 {
    margin-left: 0;
  }

  /* 二级、三级弹层上下留白 */
  .sidebar-collapse-popper-level-1 .el-menu,
  .sidebar-collapse-popper-level-2 .el-menu {
    padding: 4px 0;
  }

  /* 三级弹层补偿上移，保证与二级顶部对齐 */
  .sidebar-collapse-popper-level-2 {
    margin-top: -2px;
  }
</style>
