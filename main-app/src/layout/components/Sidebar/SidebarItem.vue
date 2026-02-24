<template>
  <template v-if="!item.meta?.hidden">
    <el-menu-item
      v-if="!item.children || item.children.length === 0"
      :index="resolvePath(item.path)"
    >
      <el-icon v-if="item.meta?.icon"><component :is="item.meta.icon" /></el-icon>
      <template #title>
        <span>{{ item.meta?.title }}</span>
      </template>
    </el-menu-item>

    <el-sub-menu v-else :index="resolvePath(item.path)">
      <template #title>
        <el-icon v-if="item.meta?.icon"><component :is="item.meta.icon" /></el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(item.path)"
      />
    </el-sub-menu>
  </template>
</template>
<script setup lang="ts">
  import type { RouteRecordRaw } from 'vue-router';

  const props = defineProps<{
    item: RouteRecordRaw | any;
    basePath?: string;
  }>();

  // 优化后的路径解析函数
  const resolvePath = (routePath?: string) => {
    // 1. 如果子节点压根没有 path，直接返回父级的 basePath 作为它的 index 兜底
    if (!routePath) {
      return props.basePath || '';
    }

    // 2. 如果是外部链接，直接原样返回
    if (routePath.startsWith('http')) {
      return routePath;
    }

    // 3. 如果已经是绝对路径，直接返回
    if (routePath.startsWith('/')) {
      return routePath;
    }

    // 4. 拼接父路径和当前路径
    const parentPath = props.basePath || '';

    // 避免 basePath 和 routePath 完全相同时重复拼接
    if (parentPath === routePath) {
      return routePath;
    }

    return `${parentPath}/${routePath}`.replace(/\/+/g, '/');
  };
</script>
