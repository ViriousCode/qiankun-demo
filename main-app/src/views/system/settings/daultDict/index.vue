<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="故障名称">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入故障名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="故障等级">
          <el-select v-model="queryParams.level" placeholder="全部" clearable style="width: 150px">
            <el-option label="提示" value="1" />
            <el-option label="一般" value="2" />
            <el-option label="严重" value="3" />
            <el-option label="致命" value="4" />
          </el-select>
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
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增字典</el-button>
          <el-button
            type="danger"
            :icon="Delete"
            :disabled="!ids.length"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          type="index"
          label="序号"
          width="70"
          align="center"
          :index="calculateIndex"
        />
        <el-table-column prop="faultCode" label="故障代码" width="120" align="center" />
        <el-table-column prop="faultName" label="故障名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="level" label="故障等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)">{{ getLevelLabel(row.level) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" align="center" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">修改</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageIndex"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="故障代码" prop="faultCode">
          <el-input v-model="form.faultCode" placeholder="如：ERR-001" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="故障名称" prop="faultName">
          <el-input v-model="form.faultName" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="故障等级" prop="level">
          <el-radio-group v-model="form.level">
            <el-radio label="1">提示</el-radio>
            <el-radio label="2">一般</el-radio>
            <el-radio label="3">严重</el-radio>
            <el-radio label="4">致命</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入详细描述" />
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
  import { ref, reactive, onMounted, computed } from 'vue';
  import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import {
    getFaultList,
    addFault,
    updateFault,
    deleteFault,
    batchDeleteFault,
    type FaultItem
  } from '@/api/fault';

  const loading = ref(false);
  const fullList = ref<FaultItem[]>([]);
  const total = ref(0);
  const ids = ref<number[]>([]);
  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const submitLoading = ref(false);
  const formRef = ref();

  const queryParams = reactive({
    pageIndex: 1,
    pageSize: 10,
    name: '',
    level: ''
  });

  const form = reactive<Partial<FaultItem> & { id?: number }>({
    id: undefined,
    faultCode: '',
    faultName: '',
    level: '2',
    status: 1,
    remark: ''
  });

  const tableData = computed(() => {
    const start = (queryParams.pageIndex - 1) * queryParams.pageSize;
    return fullList.value.slice(start, start + queryParams.pageSize);
  });

  const rules = {
    faultCode: [{ required: true, message: '代码不能为空', trigger: 'blur' }],
    faultName: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
  };

  // --- 核心方法 ---

  /** 🌟 连续序号计算 **/
  const calculateIndex = (index: number) => {
    return (queryParams.pageIndex - 1) * queryParams.pageSize + index + 1;
  };

  const fetchList = async () => {
    loading.value = true;
    try {
      const data = await getFaultList({
        name: queryParams.name || undefined,
        level: queryParams.level || undefined
      });
      fullList.value = data || [];
      total.value = fullList.value.length;
    } finally {
      loading.value = false;
    }
  };

  const handleQuery = () => {
    queryParams.pageIndex = 1;
    fetchList();
  };

  const resetQuery = () => {
    queryParams.name = '';
    queryParams.level = '';
    handleQuery();
  };

  const getLevelLabel = (level: string) => {
    const map: any = { '1': '提示', '2': '一般', '3': '严重', '4': '致命' };
    return map[level] || '未知';
  };

  const getLevelType = (level: string) => {
    const map: any = { '1': 'info', '2': 'warning', '3': 'danger', '4': 'danger' };
    return map[level] || 'info';
  };

  const handleSelectionChange = (selection: FaultItem[]) => {
    ids.value = selection.map((item) => item.id!).filter((id): id is number => id != null);
  };

  const handleAdd = () => {
    dialogTitle.value = '新增故障字典';
    Object.assign(form, {
      id: undefined,
      faultCode: '',
      faultName: '',
      level: '2',
      status: 1,
      remark: ''
    });
    dialogVisible.value = true;
  };

  const handleEdit = (row: FaultItem) => {
    dialogTitle.value = '修改故障字典';
    Object.assign(form, {
      id: row.id,
      faultCode: row.faultCode,
      faultName: row.faultName,
      level: String(row.level ?? '2'),
      status: row.status ?? 1,
      remark: row.remark ?? ''
    });
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
        await updateFault(form.id, {
          faultCode: form.faultCode!,
          faultName: form.faultName!,
          level: form.level!,
          remark: form.remark
        });
      } else {
        await addFault({
          faultCode: form.faultCode!,
          faultName: form.faultName!,
          level: form.level!,
          remark: form.remark,
          status: 1
        });
      }
      ElMessage.success('操作成功');
      dialogVisible.value = false;
      fetchList();
    } finally {
      submitLoading.value = false;
    }
  };

  const handleDelete = (row: FaultItem) => {
    ElMessageBox.confirm(`确认删除故障 "${row.faultName}" 吗？`, '警告')
      .then(async () => {
        await deleteFault(row.id!);
        ElMessage.success('删除成功');
        fetchList();
      })
      .catch(() => {});
  };

  const handleBatchDelete = () => {
    if (ids.value.length === 0) return;
    ElMessageBox.confirm(`确认删除选中的 ${ids.value.length} 条故障记录吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        loading.value = true;
        try {
          await batchDeleteFault(ids.value);
          ElMessage.success('批量删除成功');
          ids.value = [];
          fetchList();
        } catch (error) {
          console.error('批量删除失败', error);
        } finally {
          loading.value = false;
        }
      })
      .catch(() => {});
  };

  const handleStatusChange = async (row: FaultItem) => {
    const text = row.status === 1 ? '启用' : '停用';
    try {
      await updateFault(row.id!, { status: row.status });
      ElMessage.success(`${text}成功`);
    } catch (error) {
      row.status = row.status === 1 ? 0 : 1;
      console.error('状态修改失败', error);
    }
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
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
</style>
