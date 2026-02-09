<template>
  <div class="menu-container p-4">
    <div class="mb-4">
      <el-button type="primary" icon="Plus" @click="handleAdd()">新增菜单</el-button>
    </div>

    <el-table
      :data="menuData"
      style="width: 100%; margin-bottom: 20px;"
      row-key="id"
      border
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="title" label="菜单名称" width="200" />
      <el-table-column prop="icon" label="图标" width="60" align="center">
        <template #default="scope">
          <el-icon v-if="scope.row.icon"><component :is="scope.row.icon" /></el-icon>
        </template>
      </el-table-column>
      
      <el-table-column prop="app" label="所属应用" width="120" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.app === 'main'" type="primary">主应用</el-tag>
          <el-tag v-else-if="scope.row.app === 'order'" type="success">订单系统</el-tag>
          <el-tag v-else type="info">{{ scope.row.app || '未知' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="sort" label="排序" width="60" align="center" />
      <el-table-column prop="permission" label="权限标识" width="180" />
      <el-table-column prop="path" label="路由路径" min-width="150" />
      <el-table-column prop="type" label="类型" width="80" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.type === 'directory'" effect="plain">目录</el-tag>
          <el-tag v-else-if="scope.row.type === 'menu'" effect="plain" type="success">菜单</el-tag>
          <el-tag v-else effect="plain" type="warning">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleAdd(scope.row)">新增子项</el-button>
          <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑菜单' : '新增菜单'"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="formData.parentId"
            :data="menuOptions"
            :props="{ label: 'title', children: 'children' }"
            node-key="id"
            check-strictly
            placeholder="选择上级菜单"
            clearable
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="所属应用" prop="app">
          <el-select v-model="formData.app" placeholder="请选择所属应用" style="width: 100%">
            <el-option label="主应用 (Main)" value="main" />
            <el-option label="订单系统 (Order)" value="order" />
            <el-option label="商品系统 (Product)" value="product" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio-button label="directory">目录</el-radio-button>
            <el-radio-button label="menu">菜单</el-radio-button>
            <el-radio-button label="button">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入菜单名称" />
        </el-form-item>

        <el-form-item label="权限标识" prop="permission">
          <el-input v-model="formData.permission" placeholder="如 system:user:list" />
        </el-form-item>

        <el-form-item label="路由路径" prop="path" v-if="formData.type !== 'button'">
          <el-input v-model="formData.path" placeholder="请输入路由路径" />
        </el-form-item>

        <el-form-item label="图标" prop="icon" v-if="formData.type !== 'button'">
          <el-input v-model="formData.icon" placeholder="Element Plus 图标名" />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
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
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getMenuList, addMenu, updateMenu, deleteMenu, type Menu } from '@/api/munu';

const menuData = ref<Menu[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();

// 初始化表单数据，默认选中主应用
const initialForm: Menu = {
  parentId: null,
  title: '',
  path: '',
  icon: '',
  sort: 1,
  permission: '',
  type: 'menu',
  app: 'main' // [新增] 默认为主应用
};
const formData = reactive<Menu>({ ...initialForm });

const rules = {
  title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  app: [{ required: true, message: '请选择所属应用', trigger: 'change' }] // [新增] 必填校验
};

const menuOptions = computed(() => {
  return [{ id: null, title: '主目录', children: [] }, ...menuData.value];
});

const fetchData = async () => {
  const res = await getMenuList();
  menuData.value = res || [];
};

const handleAdd = (row?: Menu) => {
  resetForm();
  isEdit.value = false;
  if (row && row.id) {
    formData.parentId = row.id;
    // 如果是在某个节点下新增，默认继承父节点的所属应用
    if (row.app) {
      formData.app = row.app;
    }
  }
  dialogVisible.value = true;
};

const handleEdit = (row: Menu) => {
  resetForm();
  isEdit.value = true;
  Object.assign(formData, row);
  dialogVisible.value = true;
};

const handleDelete = (row: Menu) => {
  ElMessageBox.confirm('确认删除该菜单及其子项吗?', '警告', { type: 'warning' })
    .then(async () => {
      if (row.id) {
        await deleteMenu(row.id);
        ElMessage.success('删除成功');
        fetchData();
      }
    });
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (isEdit.value && formData.id) {
        await updateMenu(formData.id, formData);
      } else {
        await addMenu(formData);
      }
      ElMessage.success('操作成功');
      dialogVisible.value = false;
      fetchData();
    }
  });
};

const resetForm = () => {
  Object.assign(formData, initialForm);
  if (formRef.value) formRef.value.resetFields();
};

onMounted(fetchData);
</script>