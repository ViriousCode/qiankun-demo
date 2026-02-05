<template>
  <div class="role-container">
    <div class="header-actions">
      <div class="search-group">
        <el-input v-model="queryParams.roleName" placeholder="输入角色名称搜索" clearable class="search-input"
          @clear="handleQuery" @keyup.enter="handleQuery">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleQuery" :loading="loading">搜索</el-button>
      </div>

      <div class="btn-group">
        <el-button type="primary" plain icon="Plus" v-permission="'sub:role:add'" @click="handleAdd">
          新增角色
        </el-button>
      </div>
    </div>

    <el-table :data="roleList" v-loading="loading" :border="true" highlight-current-row class="role-table">
      <el-table-column prop="id" label="ID" width="80" :align="'center'" />
      <el-table-column prop="roleName" label="角色名称" min-width="120" show-overflow-tooltip />
      <el-table-column prop="roleKey" label="权限字符" min-width="120" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" width="180" :align="'center'" />
      <el-table-column label="操作" width="180" :align="'center'" fixed="right">
        <template #default="scope">
          <el-button type="primary" link icon="Edit" v-permission="'sub:role:edit'" @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button type="danger" link icon="Delete" v-permission="'sub:role:delete'" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total"
        v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :page-sizes="[10, 20, 50]"
        @size-change="handleQuery" @current-change="handleQuery" />
    </div>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body destroy-on-close
      @close="resetForm">
      <el-form ref="roleFormRef" :model="form" :rules="rules" label-width="100px" class="role-form">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="form.roleKey" placeholder="例如: admin" />
          <div class="form-tip">控制器中定义的权限字符，如：@PreAuthorize("@ss.hasRole('admin')")</div>
        </el-form-item>

        <el-form-item label="菜单权限">
          <div class="tree-wrapper">
            <div class="tree-header">
              <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand">展开/折叠</el-checkbox>
              <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll">全选/全不选</el-checkbox>
              <el-checkbox v-model="menuCheckStrictly">父子联动</el-checkbox>
            </div>

            <div class="tree-content">
              <el-tree class="tree-border" :data="menuOptions" show-checkbox ref="menuRef" node-key="id"
                :check-strictly="!menuCheckStrictly" empty-text="加载中..."
                :props="{ label: 'label', children: 'children' }" />
            </div>
          </div>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入备注内容" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
// 引入 API
import {
  getRoleList,
  getPermissionTree,
  addRole,
  updateRole,
  deleteRole,
  type Role,
  type PermissionNode
} from '@/api/role';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

// --- 状态定义 ---
const loading = ref(false);
const submitLoading = ref(false);
const total = ref(0);
const roleList = ref<Role[]>([]);
const roleFormRef = ref<FormInstance>();
const menuRef = ref();

// 菜单权限树数据
const menuOptions = ref<PermissionNode[]>([]);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleName: ''
});

const dialog = reactive({
  title: '',
  visible: false
});

const form = ref<Role>({
  id: '',
  roleName: '',
  roleKey: '',
  description: '',
  permissionIds: []
});

const rules = {
  roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }]
};

// 树形控件控制状态
const menuExpand = ref(false);
const menuNodeAll = ref(false);
const menuCheckStrictly = ref(true); // 默认开启联动

// --- API 方法 ---

// 1. 加载权限树
const initMenuTree = async () => {
  try {
    const data = await getPermissionTree();
    menuOptions.value = data || [];
  } catch (error) {
    console.error('加载权限树失败', error);
  }
};

// 2. 加载角色列表
const handleQuery = async () => {
  loading.value = true;
  try {
    const res = await getRoleList(queryParams);
    roleList.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 3. 提交表单
const submitForm = async () => {
  if (!roleFormRef.value) return;

  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        // 获取选中的权限 ID (包含全选和半选节点)
        const checkedKeys = menuRef.value?.getCheckedKeys() || [];
        const halfCheckedKeys = menuRef.value?.getHalfCheckedKeys() || [];
        const finalPermissionIds = [...checkedKeys, ...halfCheckedKeys];

        const payload: Role = {
          ...form.value,
          permissionIds: finalPermissionIds
        };

        if (form.value.id) {
          await updateRole(form.value.id, payload);
          if (form.value.id && form.value.id == userStore.userInfo?.roleId) {
            window.dispatchEvent(new Event('global-refresh-permission'));
          }
          ElMessage.success('修改成功');
        } else {
          await addRole(payload);
          ElMessage.success('新增成功');
        }

        dialog.visible = false;
        handleQuery(); // 刷新列表
      } catch (error) {
        console.error(error);
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 4. 删除角色
const handleDelete = (row: Role) => {
  if (!row.id) return;
  ElMessageBox.confirm(`是否确认删除角色"${row.roleName}"?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRole(row.id!);
      ElMessage.success('删除成功');
      handleQuery();
    } catch (error) {
      console.error(error);
    }
  });
};

// --- UI 交互逻辑 ---

const handleAdd = () => {
  resetForm();
  dialog.title = '添加角色';
  dialog.visible = true;
};

const handleEdit = (row: Role) => {
  resetForm();
  dialog.title = '修改角色';
  dialog.visible = true;

  nextTick(() => {
    Object.assign(form.value, row);

    if (row.permissionIds && row.permissionIds.length > 0) {
      // 【核心修复逻辑 START】

      // 1. 临时关闭父子联动
      // menuCheckStrictly = true 表示开启联动，所以这里设为 false 表示关闭联动 (check-strictly=true)
      // 目的：让 el-tree 变成“呆板模式”，给它什么ID它就勾什么，看到父ID也不要自作聪明去勾子节点
      menuCheckStrictly.value = false;

      // 2. 设置勾选状态
      nextTick(() => {
        menuRef.value?.setCheckedKeys(row.permissionIds);

        // 3. 恢复父子联动 (为了让用户编辑时体验更好)
        // 再次 nextTick 确保 setCheckedKeys 已经渲染完毕
        menuCheckStrictly.value = true;
      });

      // 【核心修复逻辑 END】
    }
  });
};

const resetForm = () => {
  form.value = {
    id: undefined,
    roleName: '',
    roleKey: '',
    description: '',
    permissionIds: []
  };
  // 重置树状态
  if (menuRef.value) {
    menuRef.value.setCheckedKeys([]);
  }
  menuExpand.value = false;
  menuNodeAll.value = false;
  menuCheckStrictly.value = true; // 恢复默认联动状态

  if (roleFormRef.value) roleFormRef.value.resetFields();
};

const handleCheckedTreeExpand = (value: any) => {
  const nodes = menuRef.value?.store.nodesMap;
  for (let i in nodes) {
    nodes[i].expanded = value;
  }
};

const handleCheckedTreeNodeAll = (value: any) => {
  menuRef.value?.setCheckedNodes(value ? menuOptions.value : []);
};

// 初始化
onMounted(() => {
  initMenuTree(); // 先加载树
  handleQuery();  // 再加载列表
});
</script>

<style scoped lang="scss">
.role-container {
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  height: 100%;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;

  .search-group {
    display: flex;
    gap: 12px;
    align-items: center;

    .search-input {
      width: 240px;
    }
  }
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

// 树形控件样式优化
.tree-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;

  .tree-header {
    background-color: #f5f7fa;
    padding: 8px 16px;
    border-bottom: 1px solid #dcdfe6;
    display: flex;
    gap: 16px;

    .el-checkbox {
      margin-right: 0;
    }
  }

  .tree-content {
    padding: 12px;
    max-height: 260px;
    overflow-y: auto;
  }
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin-top: 4px;
}

// 深度选择器修改 Element 样式
:deep(.el-dialog__body) {
  padding-top: 20px;
  padding-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>