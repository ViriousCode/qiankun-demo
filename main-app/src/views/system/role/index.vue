<template>
  <div class="role-container p-4">
    <div class="mb-4">
      <el-button type="primary" icon="Plus" @click="handleAdd">新增角色</el-button>
    </div>

    <el-table :data="roleList" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="roleName" label="角色名称" width="150" />
      <el-table-column prop="roleKey" label="权限字符" width="150" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="primary" size="small" @click="handlePermission(scope.row)">权限配置</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="500px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formData.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="formData.roleKey" placeholder="例如 admin" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="permDialogVisible" title="分配权限" width="600px">
      <el-tree
        ref="permTreeRef"
        :data="permissionData"
        :props="{ label: 'label', children: 'children' }"
        show-checkbox
        node-key="id"
        default-expand-all
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPermission">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox, ElTree } from 'element-plus';
import { 
  getRoleList, addRole, updateRole, deleteRole, getPermissionTree, type Role 
} from '@/api/role';

const loading = ref(false);
const roleList = ref<Role[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();

const initialForm = { roleName: '', roleKey: '', description: '' };
const formData = reactive<Role>({ ...initialForm });

const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleKey: [{ required: true, message: '请输入权限字符', trigger: 'blur' }]
};

// 权限相关
const permDialogVisible = ref(false);
const permissionData = ref([]);
const permTreeRef = ref<InstanceType<typeof ElTree>>();
const currentRoleId = ref<number | null>(null);

// 获取列表
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getRoleList();
    roleList.value = res.list;
  } finally {
    loading.value = false;
  }
};

// CRUD 操作
const handleAdd = () => {
  isEdit.value = false;
  Object.assign(formData, initialForm);
  dialogVisible.value = true;
};

const handleEdit = (row: Role) => {
  isEdit.value = true;
  Object.assign(formData, row);
  dialogVisible.value = true;
};

const handleDelete = (row: Role) => {
  ElMessageBox.confirm('确认删除该角色吗?', '提示', { type: 'warning' }).then(async () => {
    await deleteRole(row.id!);
    ElMessage.success('删除成功');
    fetchData();
  });
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (isEdit.value) {
        await updateRole(formData.id!, formData);
      } else {
        await addRole(formData);
      }
      ElMessage.success('操作成功');
      dialogVisible.value = false;
      fetchData();
    }
  });
};

// --- 权限分配核心逻辑 ---
const handlePermission = async (row: Role) => {
  currentRoleId.value = row.id!;
  
  // 1. 获取最新权限树
  const treeRes: any = await getPermissionTree();
  permissionData.value = treeRes; // 这里包含了所有子应用的权限节点

  permDialogVisible.value = true;

  // 2. 回显当前角色已有的权限
  // 注意：后端返回的 permissionIds 包含父节点ID，Element Tree 回显时如果勾选父节点会自动全选子节点
  // 所以通常只需勾选“叶子节点”。这里简化处理，假设后端处理好了，或者全部勾选。
  nextTick(() => {
    if (permTreeRef.value && row.permissionIds) {
      permTreeRef.value.setCheckedKeys(row.permissionIds);
    }
  });
};

const submitPermission = async () => {
  if (!permTreeRef.value || !currentRoleId.value) return;
  
  // 获取全选和半选的节点ID
  const checkedKeys = permTreeRef.value.getCheckedKeys();
  const halfCheckedKeys = permTreeRef.value.getHalfCheckedKeys();
  const allIds = [...checkedKeys, ...halfCheckedKeys];

  // 这里复用 updateRole 接口来保存权限
  // 实际项目中通常有单独的 /api/roles/:id/permissions 接口
  // 我们这里复用之前的 put 接口，它接收 permissionIds
  const role = roleList.value.find(r => r.id === currentRoleId.value);
  if (role) {
    await updateRole(currentRoleId.value, {
      ...role,
      permissionIds: allIds as number[]
    });
    ElMessage.success('权限分配成功');
    permDialogVisible.value = false;
    fetchData(); // 刷新列表更新本地数据
  }
};

onMounted(() => {
  fetchData();
});
</script>