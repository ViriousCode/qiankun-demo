<template>
  <div class="page-container">
    <h2 class="page-title">故障码管理</h2>
    <div class="page-card" ref="pageCardRef">
      <div ref="tableTopRef">
        <el-form :model="queryParams" @submit.prevent="handleSearch">
          <el-row :gutter="20">
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="故障码">
                <el-input v-model="queryParams.faultCode" placeholder="请输入故障码" clearable @keyup.enter="handleSearch" />
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="故障分类">
                <el-input v-model="queryParams.faultCategory" placeholder="请输入故障名称" clearable
                  @keyup.enter="handleSearch" />
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="故障级别">
                <el-select v-model="queryParams.faultLevel" placeholder="全部" clearable style="width: 100%">
                  <el-option label="提示" value="1">
                    <el-tag type="info">提示</el-tag>
                  </el-option>
                  <el-option label="警告" value="2">
                    <el-tag type="warning">警告</el-tag>
                  </el-option>
                  <el-option label="严重" value="3">
                    <el-tag type="danger">严重</el-tag>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="3" class="query-btns">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-col>
          </el-row>
        </el-form>
        <div class="add-row">
          <el-button type="primary" plain @click="handleAdd" v-permission="PERMS.FAULT.ADD">
            新增
          </el-button>
        </div>
      </div>

      <el-table class="page-table page-table--respect-column-align" v-loading="loading" :data="tableData" border
        :max-height="tableMaxHeight">
        <template #empty>
          <TableEmpty />
        </template>
        <el-table-column type="index" label="序号" width="70" align="left" header-align="left" :index="calculateIndex" />
        <el-table-column prop="faultCode" label="故障码" width="120" align="left" header-align="left" />
        <el-table-column prop="faultCategory" label="故障名称" min-width="150" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column label="故障等级" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.faultLevel)">
              {{ getLevelLabel(row.faultLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="suggestion" label="处理建议" min-width="200" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <OpPopSwitch v-permission="PERMS.FAULT.EDIT" :model-value="row.status === 1" :title="faultToggleTitle(row)"
              @confirm="toggleStatus(row, row.status !== 1)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="left" header-align="left" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)" v-permission="PERMS.FAULT.EDIT">
              编辑
            </el-button>
            <el-popconfirm :title="`确认删除故障「${row.faultCategory}」吗？`" width="260" confirm-button-text="确定"
              cancel-button-text="取消" :icon="WarningFilled" icon-color="#E6A23C" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" v-permission="PERMS.FAULT.DEL">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" ref="paginationRef">
        <el-pagination v-model:current-page="queryParams.pageIndex" v-model:page-size="queryParams.pageSize"
          :page-sizes="PAGE_SIZES" :layout="PAGINATION_LAYOUT" :total="total" @size-change="handleSearch"
          @current-change="handleSearch" />
      </div>
    </div>
  </div>

  <FaultFormDialog v-model="dialogVisible" :title="dialogTitle" :form="form" :rules="rules" :loading="submitLoading"
    @submit="submitForm" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { WarningFilled } from '@element-plus/icons-vue';
import { PERMS } from '@/constants/permissions';
import OpPopSwitch from '@/components/OpPopSwitch.vue';
import { PAGE_SIZES, PAGINATION_LAYOUT } from '@/config';
import { updateFault } from '@/api/fault';
import { useElTableAutoMaxHeight } from '@/hooks/useElTableAutoMaxHeight';
import FaultFormDialog from './components/FaultFormDialog.vue';
import { useFaultList } from './useFaultList';
import { useFaultForm } from './useFaultForm';
import { getLevelLabel, getLevelType } from './constants';

const pageCardRef = ref<HTMLElement | null>(null);
const tableTopRef = ref<HTMLElement | null>(null);
const paginationRef = ref<HTMLElement | null>(null);
const { tableMaxHeight } = useElTableAutoMaxHeight({
  containerRef: pageCardRef,
  subtractRefs: [tableTopRef, paginationRef],
  extraOffset: 24
});

const {
  loading,
  tableData,
  total,
  queryParams,
  fetchData,
  handleSearch,
  resetQuery,
  calculateIndex
} = useFaultList();

const {
  dialogVisible,
  dialogTitle,
  form,
  rules,
  submitLoading,
  handleAdd,
  handleEdit,
  submitForm,
  handleDelete
} = useFaultForm(fetchData);

const faultToggleTitle = (row: any) => {
  const actionText = row?.status === 1 ? '禁用' : '启用';
  const name = String(row?.faultName || row?.faultCategory || '').trim();
  const extra = name ? `故障「${name}」` : '该故障码';
  return `确认${actionText}${extra}吗？`;
};

const toggleStatus = async (row: any, nextEnabled: boolean) => {
  if (row?.id == null) return;
  const prevStatus = row.status;
  const nextStatus = nextEnabled ? 1 : 0;
  row.status = nextStatus;
  try {
    await updateFault(row.id, { status: nextStatus });
    ElMessage.success(`${nextEnabled ? '启用' : '禁用'}成功`);
    await fetchData();
  } catch (e) {
    row.status = prevStatus;
    ElMessage.error('操作失败，请稍后重试');
    throw e;
  }
};
</script>

<style scoped></style>
