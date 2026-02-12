<template>
  <div class="app-container p-4">
    <div class="mb-4">
      <el-button type="primary" icon="Plus" @click="handleAdd">新增应用</el-button>
    </div>

    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="应用名称(name)" width="180" />
      <el-table-column prop="entry" label="入口地址(entry)" min-width="200" />
      <el-table-column prop="activeRule" label="激活规则(activeRule)" width="180">
        <template #default="scope">
          <el-tag>{{ scope.row.activeRule }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="container" label="挂载容器" width="180" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑应用' : '新增应用'" width="500px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="formData.name" placeholder="例如: sub-app" />
        </el-form-item>
        <el-form-item label="入口地址" prop="entry">
          <el-input v-model="formData.entry" placeholder="例如: //localhost:5174" />
        </el-form-item>
        <el-form-item label="激活规则" prop="activeRule">
          <el-input v-model="formData.activeRule" placeholder="例如: /sub-app" />
        </el-form-item>
        <el-form-item label="挂载容器" prop="container">
          <el-input v-model="formData.container" placeholder="例如: #sub-app-container" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getAppList, addApp, updateApp, deleteApp, type MicroApp } from '@/api/app';

const loading = ref(false);
const tableData = ref<MicroApp[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();

const initialForm: MicroApp = {
  name: '',
  entry: '',
  activeRule: '',
  container: '#sub-app-container'
};
const formData = reactive<MicroApp>({ ...initialForm });

const rules = {
  name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }],
  entry: [{ required: true, message: '请输入入口地址', trigger: 'blur' }],
  activeRule: [{ required: true, message: '请输入激活规则', trigger: 'blur' }],
  container: [{ required: true, message: '请输入挂载容器', trigger: 'blur' }]
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getAppList();
    tableData.value = res || [];
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  isEdit.value = false;
  Object.assign(formData, initialForm);
  dialogVisible.value = true;
};

const handleEdit = (row: MicroApp) => {
  isEdit.value = true;
  Object.assign(formData, row);
  dialogVisible.value = true;
};

const handleDelete = (row: MicroApp) => {
  ElMessageBox.confirm('确认删除该应用配置吗?', '提示', { type: 'warning' }).then(async () => {
    if (row.id) {
      await deleteApp(row.id);
      ElMessage.success('删除成功');
      // 提示用户刷新页面以生效（如果做了动态注册）
      // ElMessage.info('请刷新页面以更新微应用注册配置');
      fetchData();
    }
  });
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (isEdit.value && formData.id) {
        await updateApp(formData.id, formData);
      } else {
        await addApp(formData);
      }
      ElMessage.success('操作成功');
      dialogVisible.value = false;
      fetchData();
    }
  });
};

onMounted(fetchData);
</script>