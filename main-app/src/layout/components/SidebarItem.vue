<template>
  <el-menu-item 
    v-if="!item.children || item.children.length === 0" 
    :index="item.path"
  >
    <el-icon v-if="item.icon">
      <component :is="item.icon" />
    </el-icon>
    <template #title>
      <span>{{ item.title }}</span>
    </template>
  </el-menu-item>

  <el-sub-menu 
    v-else 
    :index="item.path"
  >
    <template #title>
      <el-icon v-if="item.icon">
        <component :is="item.icon" />
      </el-icon>
      <span>{{ item.title }}</span>
    </template>
    
    <sidebar-item 
      v-for="child in item.children" 
      :key="child.path" 
      :item="child" 
    />
  </el-sub-menu>
</template>

<script setup lang="ts">

defineProps({
  item: {
    type: Object,
    required: true
  }
});
</script>

<script lang="ts">
// 递归组件通常需要定义 name，以便在模板中引用自己
export default {
  name: 'SidebarItem'
}
</script>