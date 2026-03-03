<template>
  <div class="action-bar">
    <el-form ref="queryRef" :model="queryParams" @submit.prevent>
      <el-row :gutter="20">
        <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <el-form-item prop="app">
            <el-select
              v-model="queryParams.app"
              placeholder="筛选应用角色"
              clearable
              style="width: 100%"
            >
              <el-option label="全部应用" value="" />
              <el-option
                v-for="item in appOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <el-form-item prop="searchName">
            <el-input
              v-model="queryParams.searchName"
              placeholder="搜索角色名称/权限字符"
              clearable
              prefix-icon="Search"
            />
          </el-form-item>
        </el-col>

        <el-col
          :span="12"
          :xs="24"
          :sm="24"
          :md="8"
          :lg="12"
          :xl="16"
          style="margin-left: auto; text-align: right; margin-bottom: 18px"
        >
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <el-button
            type="primary"
            icon="Plus"
            @click="handleAdd"
            v-permission="['system:role:add']"
          >
            新增角色
          </el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>

  <div class="content-card">
    <el-table :data="filteredRoleList" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" align="center" />

      <el-table-column prop="app" label="所属应用" width="150" align="center">
        <template #default="scope">
          <el-tag v-if="!scope.row.app || scope.row.app === 'main'" type="primary">主应用</el-tag>
          <el-tag v-else type="success">{{ getAppName(scope.row.app) }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="roleName" label="角色名称" width="150" />
      <el-table-column prop="roleKey" label="权限字符" width="150" />
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
      <el-table-column label="操作" width="250" fixed="right" align="center">
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
  </div>

  <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="500px">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <el-form-item label="所属应用" prop="app">
        <el-select v-model="formData.app" placeholder="请选择所属应用" style="width: 100%">
          <el-option
            v-for="item in appOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

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
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, nextTick } from 'vue';
  import { ElMessage, ElMessageBox, ElTree } from 'element-plus';
  import {
    getRoleList,
    addRole,
    updateRole,
    deleteRole,
    getPermissionTree,
    type Role
  } from '@/api/role';
  import { getAppList } from '@/api/app'; // 引入获取应用列表 API
  import { useUserStore } from '@/store/user';

  const loading = ref(false);
  const roleList = ref<Role[]>([]);
  const appOptions = ref<any[]>([]); // 存储应用选项

  // 🌟 组合查询条件
  const queryParams = reactive({
    searchName: '',
    app: ''
  });
  const queryRef = ref();

  const resetQuery = () => {
    if (queryRef.value) queryRef.value.resetFields();
  };

  const dialogVisible = ref(false);
  const isEdit = ref(false);
  const formRef = ref();

  const userStore = useUserStore();
  // 初始化表单增加 app 字段
  const initialForm = { roleName: '', roleKey: '', description: '', app: 'main' };
  const formData = reactive<Role>({ ...initialForm });

  const rules = {
    app: [{ required: true, message: '请选择所属应用', trigger: 'change' }],
    roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    roleKey: [{ required: true, message: '请输入权限字符', trigger: 'blur' }]
  };

  // 🌟 加载应用列表
  const loadAppOptions = async () => {
    try {
      const res = await getAppList();
      const subApps = res || [];
      appOptions.value = [
        { label: '主应用 (main)', value: 'main' },
        ...subApps.map((app: any) => ({
          label: `${app.name} (${app.activeRule})`,
          value: app.name
        }))
      ];
    } catch (error) {
      console.error('加载应用列表失败', error);
    }
  };

  const getAppName = (appKey: string) => {
    if (!appKey) return '未知';
    const target = appOptions.value.find((opt) => opt.value === appKey);
    // 提取括号前的干净名称用于表格展示
    return target ? target.label.split(' ')[0] : appKey;
  };

  // 🌟 核心：纯前端计算过滤角色列表（按应用 + 名称双重过滤）
  const filteredRoleList = computed(() => {
    return roleList.value.filter((role) => {
      // 1. 名称匹配 (支持搜索 roleName 和 roleKey)
      const matchName =
        !queryParams.searchName ||
        role.roleName?.toLowerCase().includes(queryParams.searchName.toLowerCase()) ||
        role.roleKey?.toLowerCase().includes(queryParams.searchName.toLowerCase());

      // 2. 应用匹配 (兼容旧数据没有 app 字段的情况，默认为 main)
      const roleApp = role.app || 'main';
      const matchApp = !queryParams.app || roleApp === queryParams.app;

      return matchName && matchApp;
    });
  });

  // 权限相关
  const permDialogVisible = ref(false);
  const permissionData = ref([]);
  const permissionSelectedKey = ref<number[]>([]);
  const permTreeRef = ref<InstanceType<typeof ElTree>>();
  const currentRoleId = ref<number | null>(null);

  const filterTreeByPermission = (tree: any[], userPerms: string[]) => {
    const res: any[] = [];
    tree.forEach((node) => {
      const tempNode = { ...node };
      if (tempNode.children && tempNode.children.length > 0) {
        tempNode.children = filterTreeByPermission(tempNode.children, userPerms);
      }
      const hasAuth = tempNode.permission && userPerms.includes(tempNode.permission);
      const hasChildren = tempNode.children && tempNode.children.length > 0;
      if (hasAuth || hasChildren) {
        res.push(tempNode);
      }
    });
    return res;
  };

  const fetchData = async () => {
    loading.value = true;
    try {
      const res = await getRoleList();
      roleList.value = res.list;
    } finally {
      loading.value = false;
    }
  };

  const handleAdd = () => {
    isEdit.value = false;
    Object.assign(formData, initialForm);
    // 🌟 如果顶部筛选了具体应用，点击新增时默认带入该应用
    if (queryParams.app) {
      formData.app = queryParams.app;
    }
    dialogVisible.value = true;
  };

  const handleEdit = (row: Role) => {
    isEdit.value = true;
    Object.assign(formData, row);
    // 兼容历史数据，如果没有 app 字段，编辑时默认为主应用
    if (!formData.app) formData.app = 'main';
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
        if (!node.children || node.children.length === 0) {
          if (targetIds.includes(node.id)) {
            leafKeys.push(node.id);
          }
        } else {
          traverse(node.children);
        }
      });
    };
    traverse(tree);
    return leafKeys;
  };

  const handlePermission = async (row: Role) => {
    currentRoleId.value = row.id!;
    permissionSelectedKey.value = row.permissionIds || [];
    const fullTree: any = await getPermissionTree();
    let treeToShow = [];
    if (userStore.userInfo.roleKey === 'admin') {
      treeToShow = fullTree;
    } else {
      treeToShow = filterTreeByPermission(fullTree, userStore.permissions);
    }
    permissionData.value = treeToShow;
    permDialogVisible.value = true;
    nextTick(() => {
      if (permTreeRef.value && row.permissionIds) {
        const leafKeys = getLeafKeys(treeToShow, row.permissionIds);
        permTreeRef.value.setCheckedKeys(leafKeys);
      }
    });
  };

  const submitPermission = async () => {
    if (!permTreeRef.value || !currentRoleId.value) return;
    const checkedKeys = permTreeRef.value.getCheckedKeys();
    const halfCheckedKeys = permTreeRef.value.getHalfCheckedKeys();
    const allIds = [...checkedKeys, ...halfCheckedKeys];
    const role = roleList.value.find((r) => r.id === currentRoleId.value);
    if (role) {
      await updateRole(currentRoleId.value, {
        ...role,
        permissionIds: allIds as number[]
      });
      ElMessage.success('权限分配成功');
      permDialogVisible.value = false;
      fetchData();
      await userStore.refreshAndSync();
    }
  };

  onMounted(() => {
    fetchData();
    loadAppOptions(); // 加载应用列表
  });
</script>

<style scoped>
  /* 继承自全局样式，组件内无需额外书写 */
</style>
