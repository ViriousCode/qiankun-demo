<template>
  <div class="app-main">
    <div class="app-main__content">
      <router-view v-slot="{ Component, route }">
        <transition name="fade-transform">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>
    <div id="sub-app-container"></div>
    <ModifyPassword ref="modifyPwdRef" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  import ModifyPassword from '@/components/ModifyPassword.vue';

  const modifyPwdRef = ref<InstanceType<typeof ModifyPassword>>();

  const EVENT_NAME = 'open-modify-password';

  const handleOpen = () => {
    modifyPwdRef.value?.open();
  };

  onMounted(() => {
    window.addEventListener(EVENT_NAME, handleOpen as EventListener);
  });

  onUnmounted(() => {
    window.removeEventListener(EVENT_NAME, handleOpen as EventListener);
  });
</script>

<style scoped lang="scss">
  .app-main {
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    /* Firefox */
    scrollbar-width: none;
    /* IE / old Edge */
    -ms-overflow-style: none;

    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    background-color: transparent;
  }

  .app-main__content {
    min-height: 0%;
    position: relative;
  }

  /* ================== 1. 主应用原生页面的过渡动画 ================== */

  /* 离开动画：绝对定位铺满容器，避免脱离文档流时右侧区域塌陷缩小 */
  .fade-transform-leave-active {
    position: absolute;
    inset: 0;
    transition: opacity 0.2s ease;
  }

  /* 新页面较快淡入，减少空白卡顿感 */
  .fade-transform-enter-active {
    transition: opacity 0.2s ease 0.3s;
  }

  .fade-transform-enter-from,
  .fade-transform-leave-to {
    opacity: 0;
  }

  #sub-app-container {
    flex: 1;
    overflow: hidden;
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
