<template>
  <div class="role-container p-4">
    <div class="mb-4">
      <el-button type="primary" icon="Plus" @click="handleAdd" v-permission="['system:role:add']">
        新增角色
      </el-button>
    </div>

    <el-table :data="roleList" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="roleName" label="角色名称" width="150" />
      <el-table-column prop="roleKey" label="权限字符" width="150" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
            v-permission="['system:role:edit']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            size="small"
            @click="handlePermission(scope.row)"
            v-permission="['system:role:edit']"
          >
            权限配置
          </el-button>
          <el-button
            link
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
            v-permission="['system:role:remove']"
          >
            删除
          </el-button>
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
        :props="{ label: 'title', children: 'children' }"
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
    getRoleList,
    addRole,
    updateRole,
    deleteRole,
    getPermissionTree,
    type Role
  } from '@/api/role';
  import { useUserStore } from '@/store/user';

  const loading = ref(false);
  const roleList = ref<Role[]>([]);
  const dialogVisible = ref(false);
  const isEdit = ref(false);
  const formRef = ref();

  const userStore = useUserStore();
  const initialForm = { roleName: '', roleKey: '', description: '' };
  const formData = reactive<Role>({ ...initialForm });

  const rules = {
    roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    roleKey: [{ required: true, message: '请输入权限字符', trigger: 'blur' }]
  };

  // 权限相关
  const permDialogVisible = ref(false);
  const permissionData = ref([]);
  const permissionSelectedKey = ref<number[]>([]);
  const permTreeRef = ref<InstanceType<typeof ElTree>>();
  const currentRoleId = ref<number | null>(null);

  const filterTreeByPermission = (tree: any[], userPerms: string[]) => {
    const res: any[] = [];

    tree.forEach((node) => {
      // 浅拷贝节点，避免修改原始引用（虽然后端返回通常是新对象，为了安全起见）
      const tempNode = { ...node };

      // 1. 如果有子节点，先递归过滤子节点
      if (tempNode.children && tempNode.children.length > 0) {
        tempNode.children = filterTreeByPermission(tempNode.children, userPerms);
      }

      // 2. 判断当前节点是否应该显示
      // 条件A: 当前节点的 permission 存在于用户的权限列表中
      const hasAuth = tempNode.permission && userPerms.includes(tempNode.permission);

      // 条件B: 当前节点虽无权限(或只是目录)，但其下有子节点被保留了，父节点也得留着
      const hasChildren = tempNode.children && tempNode.children.length > 0;

      if (hasAuth || hasChildren) {
        res.push(tempNode);
      }
    });

    return res;
  };
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
      await userStore.refreshAndSync();
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
        await userStore.refreshAndSync();
      }
    });
  };
  const getLeafKeys = (tree: any[], targetIds: number[]) => {
    const leafKeys: number[] = [];

    const traverse = (nodes: any[]) => {
      nodes.forEach((node) => {
        // 如果是叶子节点（无 children 或 children 为空），且在目标 ID 列表中
        if (!node.children || node.children.length === 0) {
          if (targetIds.includes(node.id)) {
            leafKeys.push(node.id);
          }
        } else {
          // 如果有子节点，继续递归
          traverse(node.children);
        }
      });
    };

    traverse(tree);
    return leafKeys;
  };
  // --- 权限分配核心逻辑 ---
  const handlePermission = async (row: Role) => {
    currentRoleId.value = row.id!;
    permissionSelectedKey.value = row.permissionIds || [];
    // 1. 获取后端完整权限树
    const fullTree: any = await getPermissionTree();

    // 2. [核心修改] 根据当前登录用户的权限进行过滤
    // userStore.permissions 是当前登录用户拥有的权限 Code 数组 (e.g. ['system:view', ...])
    // 如果是超级管理员(通常拥有所有权限)，过滤结果就是完整树；如果是普通用户，则只显示部分。
    let treeToShow = [];

    if (userStore.userInfo.roleKey === 'admin') {
      treeToShow = fullTree; // 超级管理员拥有上帝视角
    } else {
      treeToShow = filterTreeByPermission(fullTree, userStore.permissions);
    }

    permissionData.value = treeToShow;

    permDialogVisible.value = true;

    // 3. 回显目标角色已有的权限
    nextTick(() => {
      if (permTreeRef.value && row.permissionIds) {
        // 这里的 filteredTree 是当前展示在 Tree 上的数据结构
        // 我们需要从这里面筛选出哪些 ID 是叶子节点
        const leafKeys = getLeafKeys(treeToShow, row.permissionIds);

        // 只设置叶子节点，父节点会自动半选/全选
        permTreeRef.value.setCheckedKeys(leafKeys);
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
    const role = roleList.value.find((r) => r.id === currentRoleId.value);
    if (role) {
      await updateRole(currentRoleId.value, {
        ...role,
        permissionIds: allIds as number[]
      });
      ElMessage.success('权限分配成功');
      permDialogVisible.value = false;
      fetchData(); // 刷新列表更新本地数据
      await userStore.refreshAndSync();
    }
  };

  onMounted(() => {
    fetchData();
  });
</script>
