<template>
  <template v-if="!item.meta?.hidden">
    <el-menu-item
      v-if="!canExpand"
      :index="resolvePath(item.path)"
      :class="[`menu-level-${level}`, { 'root-active': isRootActive }]"
    >
      <MenuIcon v-if="showIcon" :icon="item.meta?.icon" />
      <template #title>
        <span :class="{ 'menu-title-with-icon': showIcon && !isCollapse }">
          {{ item.meta?.title }}
        </span>
      </template>
    </el-menu-item>

    <el-sub-menu
      v-else
      :index="resolvePath(item.path)"
      :class="[`menu-level-${level}`, { 'root-active': isRootActive }]"
      :popper-class="submenuPopperClass"
      :popper-offset="submenuPopperOffset"
      :teleported="isCollapse ? true : undefined"
    >
      <template #title>
        <MenuIcon v-if="showIcon" :icon="item.meta?.icon" />
        <span :class="{ 'menu-title-with-icon': showIcon && !isCollapse }">
          {{ item.meta?.title }}
        </span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(item.path)"
        :level="level + 1"
        :is-collapse="isCollapse"
        :active-root-key="activeRootKey"
      />
    </el-sub-menu>
  </template>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  import type { RouteRecordRaw } from 'vue-router';
  import MenuIcon from '@/components/MenuIcon.vue';

  const props = withDefaults(
    defineProps<{
      item: RouteRecordRaw | any;
      basePath?: string;
      level?: number;
      isCollapse?: boolean;
      activeRootKey?: string;
    }>(),
    {
      level: 1,
      isCollapse: false,
      activeRootKey: ''
    }
  );

  const canExpand = computed(() => {
    return props.item?.type === 'directory' && !!props.item?.children?.length;
  });

  const showIcon = computed(() => props.level === 1 && !!props.item?.meta?.icon);
  const getMenuKey = (menu: any): string => {
    const p = String(menu?.path || '').trim();
    const normalized = p ? (p.startsWith('/') ? p : `/${p}`).replace(/\/+$/, '') : '';
    return normalized || String(menu?.meta?.title || '');
  };
  const isRootActive = computed(
    () => props.isCollapse && props.level === 1 && props.activeRootKey === getMenuKey(props.item)
  );
  const submenuPopperClass = computed(() => {
    if (!props.isCollapse) return '';
    return `sidebar-collapse-popper sidebar-collapse-popper-level-${props.level}`;
  });
  const submenuPopperOffset = computed(() => {
    if (!props.isCollapse) return undefined;
    return props.level === 1 ? 16 : 8;
  });

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

<style scoped>
  .menu-title-with-icon {
    margin-left: 8px;
  }
</style>
