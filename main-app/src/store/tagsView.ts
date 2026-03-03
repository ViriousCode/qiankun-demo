import type { TabPaneName } from 'element-plus';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTagsViewStore = defineStore('tagsView', () => {
  // 记录访问过的视图
  const visitedViews = ref<{ path: string; title: string }[]>([]);

  // 添加视图
  const addView = (view: { path: string; title: string }) => {
    // 如果已经存在，就不重复添加
    if (visitedViews.value.some((v) => v.path === view.path)) return;
    visitedViews.value.push(view);
  };

  // 删除视图
  const delView = (path: TabPaneName) => {
    const index = visitedViews.value.findIndex((v) => v.path === path);
    if (index > -1) {
      visitedViews.value.splice(index, 1);
    }
  };

  return { visitedViews, addView, delView };
});
