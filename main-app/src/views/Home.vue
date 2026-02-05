<template>
  <div class="home-container">
    <h2>这里是主应用 Home 页</h2>
    <p>点击下方按钮进入微应用：</p>
    <ElButton type="primary" @click="goToSubApp('/cesium-demo')">进入 cesium 子应用 (Vue3)</ElButton>
    <ElButton type="primary" @click="goToSubApp('/three-demo')">进入 three 子应用 (Vue3)</ElButton>
    <ElButton type="primary" @click="goToSubApp('/sub-app')">进入 admin 子应用 (Vue3)</ElButton>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter();

const goToSubApp = (path: string) => {
  // 跳转到子应用注册时定义的 activeRule
  router.push(path);
};
</script>

<style scoped>
.home-container {
  position: absolute;
  top: 0;
  left: 0;
  padding: 40px;
  text-align: center;
}
</style>