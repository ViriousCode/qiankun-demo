<template>
  <div>
    <h1>test1</h1>
    <div class="prim-test">
      <div v-permission="'test1:add'">增</div>
      <div v-permission="'test1:delete'">删</div>
      <div v-permission="'test1:edit'">改</div>
      <div v-permission="'test1:query'">查</div>
      <div v-permission="'test1:import'">导入</div>
      <div v-permission="'test1:export'">导出</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
</script>
<style scoped lang="scss">
.prim-test {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;

  >div {
    background-color: rgb(0, 187, 255);
    color: white;
    padding: 10px;
    font-size: 20px;
  }
}
</style>