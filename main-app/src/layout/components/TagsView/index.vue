<template>
  <div class="tags-view-container">
    <el-tabs
      v-model="activeTab"
      type="card"
      class="tags-tabs"
      @tab-click="handleTabClick"
      @tab-remove="handleTabRemove"
    >
      <el-tab-pane
        v-for="item in tagsStore.visitedViews"
        :key="item.path"
        :label="item.title"
        :name="item.path"
        closable
      />
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useTagsViewStore } from '@/store/tagsView';
  import { usePermissionStore } from '@/store/permission';
  import type { TabsPaneContext, TabPaneName } from 'element-plus';
  const route = useRoute();
  const router = useRouter();
  const tagsStore = useTagsViewStore();
  const permissionStore = usePermissionStore();

  const activeTab = ref(route.path);

  const findMenuTitle = (targetPath: string, menus: any[], basePath = ''): string => {
    for (const menu of menus) {
      const currentPath = menu.path.startsWith('/')
        ? menu.path
        : `${basePath}/${menu.path}`.replace(/\/\//g, '/'); // 避免出现双斜杠

      // 去除末尾的斜杠统一比较格式 (比如 /test 和 /test/ 视为一致)
      const formatPath = (p: string) => p.replace(/\/$/, '') || '/';

      if (formatPath(currentPath) === formatPath(targetPath)) {
        return menu.meta.title;
      }

      if (menu.children && menu.children.length > 0) {
        const title = findMenuTitle(targetPath, menu.children, currentPath);
        if (title) return title;
      }
    }
    return '';
  };

  const addTags = () => {
    const { path, meta } = route;
    if (path === '/login') return;

    let title = findMenuTitle(path, permissionStore.menus);
    if (!title) {
      title = meta.title as string;
    }

    tagsStore.addView({ path, title });
    activeTab.value = path;
  };

  watch(
    () => route.path,
    () => {
      addTags();
    },
    { immediate: true }
  );

  // 点击标签页跳转
  const handleTabClick = (pane: TabsPaneContext) => {
    router.push(pane.paneName as string);
  };

  // 关闭标签页
  const handleTabRemove = (targetPath: TabPaneName) => {
    const views = tagsStore.visitedViews;
    let newActivePath = activeTab.value;

    // 如果关闭的是当前正在浏览的标签页
    if (activeTab.value === targetPath) {
      views.forEach((tab, index) => {
        if (tab.path === targetPath) {
          // 自动跳转到后一个，或者前一个
          const nextTab = views[index + 1] || views[index - 1];
          if (nextTab) {
            newActivePath = nextTab.path;
          } else {
            // 如果全都关完了，回到首页(工作台)
            newActivePath = '/workbench';
          }
        }
      });
    }

    // 从 store 中删除，并执行跳转
    tagsStore.delView(targetPath);
    if (newActivePath !== targetPath || views.length === 0) {
      router.push(newActivePath);
    }
  };
</script>

<style scoped lang="scss">
  /* 美化 Tabs 的样式，使其更像后台系统的卡片标签 */
  .tags-view-container {
    background: var(--el-bg-color);
    padding: 6px 20px 4px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    position: relative;
    z-index: 10;
  }

  /* 覆盖 element-plus 的默认边框和间距 */
  :deep(.el-tabs__header) {
    margin: 0;
    border-bottom: none !important;
  }
  :deep(.el-tabs__nav) {
    border: none !important;
    padding: 2px 0 0 0;
  }
  :deep(.el-tabs__item) {
    height: 32px;
    line-height: 32px;
    border: 1px solid var(--el-border-color-light) !important;
    border-radius: 4px;
    margin-right: 6px;
    background: var(--el-bg-color-page);
    font-size: 13px;
    color: var(--el-text-color-regular);
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
  :deep(.el-tabs__item.is-active) {
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary) !important;
    color: var(--el-color-primary);
  }

  :deep(.el-tabs__item .is-icon-close:hover) {
    background-color: transparent;
    // transform: scale(1.3);
    font-weight: bold;
    svg {
      color: rgb(0, 76, 190);
    }
  }
</style>
