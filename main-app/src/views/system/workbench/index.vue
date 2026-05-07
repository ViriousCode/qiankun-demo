<template>
  <div class="page-container">
    <h2 class="page-title">工作台配置</h2>
    <div class="page-card">
      <el-form ref="queryRef" :model="queryParams" @submit.prevent="fetchData">
        <el-row :gutter="20">
          <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
            <el-form-item prop="searchName">
              <el-input v-model="queryParams.searchName" placeholder="搜索卡片名称" clearable prefix-icon="Search" />
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="query-btns">
            <el-button type="primary" @click="fetchData">搜索</el-button>
            <el-button @click="resetQuery">重置</el-button>
            <el-button v-permission="PERMS.WORKBENCH.ADD" type="primary" @click="handleAdd">
              新增工作台卡片
            </el-button>
          </el-col>
        </el-row>
      </el-form>
      <el-table class="page-table page-table--respect-column-align" :data="tableData" v-loading="loading" border
        style="width: 100%">
        <template #empty>
          <TableEmpty />
        </template>
        <el-table-column prop="sort" label="排序" width="80" align="center" header-align="center" />
        <el-table-column prop="title" label="卡片名称" width="150" align="left" header-align="left" />
        <el-table-column prop="category" label="所属分类" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag effect="plain">{{ row.category || '未分类' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="iconName" label="图标" width="80" align="center" header-align="center">
          <template #default="{ row }">
            <MenuIcon v-if="row.iconName" :icon="row.iconName" />
          </template>
        </el-table-column>
        <el-table-column prop="targetType" label="跳转类型" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="row.targetType === 'internal' ? 'success' : 'warning'">
              {{ row.targetType === 'internal' ? '内部子应用' : '外部链接' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="目标路径" min-width="200" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="150" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right" align="left" header-align="left">
          <template #default="{ row }">
            <el-button v-permission="PERMS.WORKBENCH.EDIT" type="primary" link icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-popconfirm :title="`确定要删除卡片「${row.title}」吗？`" width="280" confirm-button-text="确定"
              cancel-button-text="取消" :icon="WarningFilled" icon-color="#E6A23C" @confirm="handleDelete(row)">
              <template #reference>
                <el-button v-permission="PERMS.WORKBENCH.DEL" type="danger" link icon="Delete">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" @close="resetForm">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="卡片名称" prop="title">
        <el-input v-model="form.title" placeholder="请输入卡片名称，如：测试列表" />
      </el-form-item>
      <el-form-item label="所属分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择或输入新分类" filterable allow-create default-first-option
          style="width: 100%">
          <el-option label="常用应用" value="常用应用" />
          <el-option label="业务系统" value="业务系统" />
          <el-option label="开发文档" value="开发文档" />
          <el-option label="外部工具" value="外部工具" />
        </el-select>
      </el-form-item>
      <el-form-item label="图标" prop="iconName">
        <IconSelect v-model="form.iconName" />
      </el-form-item>
      <el-form-item label="跳转类型" prop="targetType">
        <el-radio-group v-model="form.targetType">
          <el-radio label="internal">内部子应用</el-radio>
          <el-radio label="external">外部链接</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="目标路径" prop="path">
        <el-input v-model="form.path" :placeholder="form.targetType === 'internal' ? '如: /test-sub-app/test/list' : '如: https://baidu.com'
          " />
        <div class="form-tip">
          {{
            form.targetType === 'internal'
              ? '提示：必须包含子应用的路由前缀'
              : '提示：必须以 http:// 或 https:// 开头'
          }}
        </div>
      </el-form-item>
      <el-form-item label="描述信息" prop="description">
        <el-input v-model="form.description" type="textarea" placeholder="请输入描述信息" />
      </el-form-item>
      <el-form-item label="显示排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" :max="999" controls-position="right" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { WarningFilled } from '@element-plus/icons-vue';
import {
  getWorkbenchList,
  addWorkbenchItem,
  updateWorkbenchItem,
  deleteWorkbenchItem
} from '@/api/workbench';
import type { WorkbenchItem } from '@/api/workbench';
import { PERMS } from '@/constants/permissions';

// --- 状态定义 ---
const loading = ref(false);
const submitLoading = ref(false);
const tableData = ref<WorkbenchItem[]>([]);

const queryParams = reactive({
  searchName: ''
});
const queryRef = ref();
const resetQuery = () => {
  if (queryRef.value) queryRef.value.resetFields();
};

const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref<FormInstance>();

// 表单数据
const form = reactive<WorkbenchItem>({
  title: '',
  iconName: '',
  category: '常用应用', // 默认值
  targetType: 'internal',
  path: '',
  description: '',
  sort: 0
});

// 表单校验规则
const rules = reactive<FormRules>({
  title: [{ required: true, message: '请输入卡片名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择或输入所属分类', trigger: 'change' }],
  iconName: [{ required: true, message: '请选择图标', trigger: 'change' }],
  targetType: [{ required: true, message: '请选择跳转类型', trigger: 'change' }],
  path: [{ required: true, message: '请输入目标路径', trigger: 'blur' }]
});

// --- 方法定义 ---

// 获取列表数据
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getWorkbenchList();
    tableData.value = res;
  } catch (error) {
    console.error('获取工作台数据失败', error);
  } finally {
    loading.value = false;
  }
};

// 点击新增
const handleAdd = () => {
  dialogTitle.value = '新增工作台卡片';
  dialogVisible.value = true;
};

// 点击编辑
const handleEdit = (row: WorkbenchItem) => {
  dialogTitle.value = '编辑工作台卡片';
  // 浅拷贝数据到表单
  Object.assign(form, row);
  dialogVisible.value = true;
};

// 点击删除（二次确认在操作列 Popconfirm）
const handleDelete = async (row: WorkbenchItem) => {
  try {
    await deleteWorkbenchItem(row.id!);
    ElMessage.success('删除成功');
    fetchData();
  } catch (error) {
    console.error('删除失败', error);
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (form.id) {
          await updateWorkbenchItem(form.id, form);
          ElMessage.success('修改成功');
        } else {
          await addWorkbenchItem(form);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        fetchData();
      } catch (error) {
        console.error('保存失败', error);
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  form.id = undefined;
  form.sort = 0;
};

// --- 初始化 ---
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
}

.mb-4 {
  margin-bottom: 16px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 4px;
}

.icon-list {
  display: flex;
  flex-wrap: wrap;
  border-top: 1px solid #dcdfe6;
  border-left: 1px solid #dcdfe6;
}

.icon-item {
  width: 12.5%;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-item:hover {
  background-color: #f2f6fc;
  color: var(--el-color-primary);
}

.icon-item.is-active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.icon-name {
  font-size: 10px;
  margin-top: 5px;
  color: #606266;
  width: 90%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
