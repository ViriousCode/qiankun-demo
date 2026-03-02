<template>
  <div>
    <h1 @click="dialogVisible = true">sub:test2</h1>
    <div class="prim-test">
      <div v-permission="'sub:test2:add'">增</div>
      <div v-permission="'sub:test2:delete'">删</div>
      <div v-permission="'sub:test2:edit'">改</div>
      <div v-permission="'sub:test2:query'">查</div>
      <div v-permission="'sub:test2:import'">导入</div>
      <div v-permission="'sub:test2:export'">导出</div>
    </div>
    <el-dialog title="详情" :append-to-body="true" v-model="dialogVisible" width="30%">
      <el-form ref="form" :model="formData" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="formData.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="描述">

        </el-form-item>
      </el-form>
    </el-dialog>
    <el-select v-model="formData.description" :teleported="false">
      <el-option label="选项1" value="1" />
    </el-select>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
const dialogVisible = ref(false)
const formData = ref({
  name: '',
  description: ''
})

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