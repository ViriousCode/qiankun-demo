<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="字典名称">
          <el-input
            v-model="queryParams.dictName"
            placeholder="请输入字典名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="字典类型">
          <el-input
            v-model="queryParams.dictType"
            placeholder="请输入字典类型"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-wrapper">
      <template #header>
        <div class="table-header">
          <el-button
            type="primary"
            :icon="Plus"
            @click="handleAdd"
            v-permission="['system:dict:add']"
          >
            新增字典
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="filteredList" border>
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="dictName" label="字典名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="dictType" label="字典类型" min-width="140" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="handleEdit(row)"
              v-permission="['system:dict:edit']"
            >
              修改
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleDelete(row)"
              v-permission="['system:dict:remove']"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="form.dictType" placeholder="如：sys_user_sex" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue';
  import { Search, Refresh, Plus } from '@element-plus/icons-vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { getDictList, addDict, updateDict, deleteDict, type DictItem } from '@/api/dict';

  const loading = ref(false);
  const list = ref<DictItem[]>([]);
  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const submitLoading = ref(false);
  const formRef = ref();

  const queryParams = reactive({
    dictName: '',
    dictType: ''
  });

  const form = reactive<Partial<DictItem>>({
    id: undefined,
    dictName: '',
    dictType: '',
    status: 1,
    remark: ''
  });

  const rules = {
    dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
    dictType: [{ required: true, message: '请输入字典类型', trigger: 'blur' }]
  };

  const filteredList = computed(() => {
    let data = list.value;
    if (queryParams.dictName?.trim()) {
      const n = queryParams.dictName.trim().toLowerCase();
      data = data.filter(
        (item) =>
          (item.dictName || '').toLowerCase().includes(n) ||
          (item.dictType || '').toLowerCase().includes(n)
      );
    }
    if (queryParams.dictType?.trim()) {
      const t = queryParams.dictType.trim().toLowerCase();
      data = data.filter((item) => (item.dictType || '').toLowerCase().includes(t));
    }
    return data;
  });

  const fetchList = async () => {
    loading.value = true;
    try {
      const data = await getDictList();
      list.value = data || [];
    } finally {
      loading.value = false;
    }
  };

  const handleQuery = () => fetchList();
  const resetQuery = () => {
    queryParams.dictName = '';
    queryParams.dictType = '';
    handleQuery();
  };

  const handleAdd = () => {
    dialogTitle.value = '新增字典';
    Object.assign(form, { id: undefined, dictName: '', dictType: '', status: 1, remark: '' });
    dialogVisible.value = true;
  };

  const handleEdit = (row: DictItem) => {
    dialogTitle.value = '修改字典';
    Object.assign(form, { ...row });
    dialogVisible.value = true;
  };

  const submitForm = async () => {
    try {
      await formRef.value?.validate();
    } catch {
      return;
    }
    submitLoading.value = true;
    try {
      if (form.id != null) {
        await updateDict(form.id, {
          dictName: form.dictName!,
          dictType: form.dictType!,
          status: form.status,
          remark: form.remark
        });
      } else {
        await addDict({
          dictName: form.dictName!,
          dictType: form.dictType!,
          status: form.status ?? 1,
          remark: form.remark
        });
      }
      ElMessage.success('操作成功');
      dialogVisible.value = false;
      fetchList();
    } finally {
      submitLoading.value = false;
    }
  };

  const handleDelete = (row: DictItem) => {
    ElMessageBox.confirm(`确认删除字典 "${row.dictName}" 吗？`, '警告')
      .then(async () => {
        await deleteDict(row.id!);
        ElMessage.success('删除成功');
        fetchList();
      })
      .catch(() => {});
  };

  onMounted(() => {
    fetchList();
  });
</script>

<style scoped>
  .app-container {
    padding: 20px;
  }
  .search-wrapper {
    margin-bottom: 20px;
  }
  .table-header {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
  }
</style>
