<template>
  <div class="menu-container p-4">
    <div class="mb-4">
      <el-button type="primary" icon="Plus" @click="handleAdd()">新增菜单</el-button>
    </div>

    <el-table :data="menuData" style="width: 100%; margin-bottom: 20px;" row-key="id" border default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column prop="title" label="菜单名称" width="200" />
      <el-table-column prop="icon" label="图标" width="60" align="center">
        <template #default="scope">
          <el-icon v-if="scope.row.icon"><component :is="scope.row.icon" /></el-icon>
        </template>
      </el-table-column>
      <el-table-column prop="app" label="所属应用" width="150" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.app === 'main'" type="primary">主应用</el-tag>
          <el-tag v-else type="success">{{ getAppName(scope.row.app) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="60" align="center" />
      <el-table-column prop="permission" label="权限标识" width="180" />
      <el-table-column prop="path" label="路由路径(相对)" min-width="150" />
      <el-table-column prop="type" label="类型" width="80" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.type === 'directory'" effect="plain">目录</el-tag>
          <el-tag v-else-if="scope.row.type === 'menu'" effect="plain" type="success">菜单</el-tag>
          <el-tag v-else effect="plain" type="warning">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleAdd(scope.row)" v-if="scope.row.type !== 'button'">新增子项</el-button>
          <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑菜单' : '新增菜单'" width="600px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="上级菜单">
          <el-tree-select v-model="formData.parentId" :data="menuOptions"
            :props="{ label: 'title', children: 'children', disabled: 'disabled' }" node-key="id" check-strictly
            placeholder="选择上级菜单" clearable style="width: 100%" />
        </el-form-item>

        <el-form-item label="所属应用" prop="app">
          <el-select v-model="formData.app" placeholder="请选择所属应用" style="width: 100%">
            <el-option v-for="item in appOptions" :key="item.value" :label="item.label" :value="item.value" />
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

        <el-form-item label="路由路径" prop="path" v-if="formData.type === 'menu'">
          <el-input v-model="formData.path" placeholder="请输入相对路径，如 /list">
            <template #prefix v-if="currentAppPrefix">
              <span class="path-prefix">{{ currentAppPrefix }}</span>
            </template>
          </el-input>
          <div class="form-tip" v-if="currentAppPrefix">
            最终路径: {{ currentAppPrefix }}{{ formData.path.startsWith('/') ? '' : '/' }}{{ formData.path }}
          </div>
        </el-form-item>

        <el-form-item label="图标" prop="icon" v-if="formData.type !== 'button'">
          <el-popover placement="bottom-start" :width="450" trigger="click">
            <template #reference>
              <el-input v-model="formData.icon" placeholder="点击选择图标" readonly class="icon-input">
                <template #prefix>
                  <el-icon v-if="formData.icon"><component :is="formData.icon" /></el-icon>
                  <el-icon v-else><Search /></el-icon>
                </template>
                <template #suffix>
                  <el-icon v-if="formData.icon" class="cursor-pointer" @click.stop="formData.icon = ''"><CircleClose /></el-icon>
                </template>
              </el-input>
            </template>
            <div class="icon-selector">
              <el-scrollbar height="250px">
                <div class="icon-list">
                  <div v-for="name in iconList" :key="name" class="icon-item" :class="{ 'is-active': formData.icon === name }" @click="formData.icon = name">
                    <el-icon :size="20"><component :is="name" /></el-icon>
                    <span class="icon-name">{{ name }}</span>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </el-popover>
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
import { getMenuList, addMenu, updateMenu, deleteMenu, type Menu } from '@/api/menu';
import { getAppList } from '@/api/app';
import { useUserStore } from '@/store/user';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { Search, CircleClose } from '@element-plus/icons-vue';

const menuData = ref<Menu[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const appOptions = ref<any[]>([]);
const rawAppList = ref<any[]>([]); // 保存应用原始数据以获取 activeRule
const iconList = Object.keys(ElementPlusIconsVue).filter(name => name !== 'default');

const initialForm: Menu = {
  parentId: null,
  title: '',
  path: '',
  icon: '',
  sort: 1,
  permission: '',
  type: 'menu',
  app: 'main'
};
const formData = reactive<Menu>({ ...initialForm });
const userStore = useUserStore();

const rules = {
  title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  app: [{ required: true, message: '请选择所属应用', trigger: 'change' }]
};

// 构造上级菜单选项：过滤按钮，编辑时禁用自己
const menuOptions = computed(() => {
  const buildOptions = (nodes: Menu[]) => {
    const result: any[] = [];
    nodes.forEach(node => {
      if (node.type === 'button') return;
      const newNode = { ...node };
      if (isEdit.value && formData.id === node.id) newNode.disabled = true;
      if (newNode.children && newNode.children.length > 0) {
        newNode.children = buildOptions(newNode.children);
      } else {
        newNode.children = [];
      }
      result.push(newNode);
    });
    return result;
  };
  return [{ id: null, title: '主目录', children: [], disabled: false }, ...buildOptions(menuData.value)];
});

// 【核心】计算当前前缀
const currentAppPrefix = computed(() => {
  if (!formData.app || formData.app === 'main') return '';
  const targetApp = rawAppList.value.find((app: any) => app.name === formData.app);
  return targetApp ? targetApp.activeRule : '';
});

const loadAppOptions = async () => {
  try {
    const res = await getAppList();
    const subApps = res || [];
    rawAppList.value = subApps; // 保存原始数据
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
  const target = appOptions.value.find(opt => opt.value === appKey);
  return target ? target.label : appKey;
};

const fetchData = async () => {
  const res = await getMenuList();
  menuData.value = res || [];
};

const handleAdd = (row?: Menu) => {
  resetForm();
  isEdit.value = false;
  if (row && row.id) {
    formData.parentId = row.id;
    if (row.app) formData.app = row.app;
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
        await userStore.refreshAndSync();
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
      await userStore.refreshAndSync();
    }
  });
};

const resetForm = () => {
  Object.assign(formData, initialForm);
  if (formRef.value) formRef.value.resetFields();
};

onMounted(() => {
  fetchData();
  loadAppOptions();
});
</script>

<style scoped>
.path-prefix {
  color: #909399;
  margin-right: 5px;
  font-family: monospace;
  font-weight: bold;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
/* Icon styles ... */
.icon-list { display: flex; flex-wrap: wrap; border-top: 1px solid #dcdfe6; border-left: 1px solid #dcdfe6; }
.icon-item { width: 12.5%; height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 1px solid #dcdfe6; border-bottom: 1px solid #dcdfe6; cursor: pointer; transition: all 0.2s; }
.icon-item:hover { background-color: #f2f6fc; color: var(--el-color-primary); }
.icon-item.is-active { background-color: var(--el-color-primary-light-9); color: var(--el-color-primary); }
.icon-name { font-size: 10px; margin-top: 5px; color: #606266; width: 90%; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cursor-pointer { cursor: pointer; }
</style>