<template>
  <div class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    <div id="sub-app-container"></div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
  .app-main {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    background-color: var(--el-bg-color-page);
  }

  /* ================== 1. 主应用原生页面的过渡动画 ================== */

  /* 离开动画：立即执行，耗时 0.3s。绝对定位使其悬空，不把新页面挤下去 */
  .fade-transform-leave-active {
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    transition: opacity 0.3s ease;
  }

  /* 等待旧页面的 0.3s 消失动画彻底播完后，新页面才开始淡入 */
  .fade-transform-enter-active {
    transition: opacity 0.3s ease 0.3s;
  }

  .fade-transform-enter-from,
  .fade-transform-leave-to {
    opacity: 0;
  }

  /* ================== 2. 乾坤子应用动画 ================== */

  /* both 属性能保证子应用在等待的这 0.3 秒内，严格保持 0% 的全透明状态，不会提前展示 */
  #sub-app-container:not(:empty) {
    animation: qiankun-fade 0.3s ease 0.3s both;
  }

  @keyframes qiankun-fade {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>
