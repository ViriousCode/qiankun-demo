<template>
  <div class="app-main">
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <div id="sub-app-container"></div>
  </div>
</template>

<script setup lang="ts">
// 视图层不需要太多的业务逻辑
</script>

<style scoped lang="scss">
.app-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  position: relative;
  background-color: var(--el-bg-color-page); // 适配暗黑模式
}

/* 路由过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>