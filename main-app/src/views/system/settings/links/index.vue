<template>
  <div class="page-container">
    <h2 class="page-title">友情链接</h2>
    <div class="page-card" ref="pageCardRef">
      <div ref="tableTopRef">
        <el-form :model="queryParams" @submit.prevent="handleSearch">
          <el-row :gutter="20">
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="链接名称">
                <el-input v-model="queryParams.name" placeholder="请输入链接名称" clearable @keyup.enter="handleSearch" />
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="状态">
                <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 100%">
                  <el-option :value="1" label="启用">
                    <StatusTag :status-key="1" variant="outline" />
                  </el-option>
                  <el-option :value="0" label="禁用">
                    <StatusTag :status-key="0" variant="outline" />
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
          <el-button type="primary" plain @click="handleAdd" v-permission="PERMS.LINK.ADD">
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
        <el-table-column prop="name" label="链接名称" min-width="200" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column prop="url" label="链接地址" min-width="300" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="90" align="center" header-align="center" />
        <el-table-column label="状态" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <OpPopSwitch v-permission="PERMS.LINK.EDIT" :model-value="row.status === 1" :title="linkToggleTitle(row)"
              @confirm="toggleStatus(row, row.status !== 1)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="left" header-align="left">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)" v-permission="PERMS.LINK.EDIT">
              编辑
            </el-button>
            <el-popconfirm title="确认删除该友情链接吗？" width="240" confirm-button-text="确定" cancel-button-text="取消"
              :icon="WarningFilled" icon-color="#E6A23C" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" v-permission="PERMS.LINK.DEL">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" ref="paginationRef">
        <el-pagination v-model:current-page="queryParams.pageIndex" v-model:page-size="queryParams.pageSize"
          :page-sizes="PAGE_SIZES" :layout="PAGINATION_LAYOUT" :total="total" @size-change="handleSizeChange"
          @current-change="handlePageChange" />
      </div>
    </div>
  </div>

  <LinkFormDialog v-model="dialogVisible" :title="dialogTitle" :form="form" :rules="rules" :loading="submitLoading"
    @submit="submitForm" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { WarningFilled } from '@element-plus/icons-vue';
import { PERMS } from '@/constants/permissions';
import OpPopSwitch from '@/components/OpPopSwitch.vue';
import StatusTag from '@/components/StatusTag.vue';
import { PAGE_SIZES, PAGINATION_LAYOUT } from '@/config';
import { updateLink } from '@/api/link';
import { useElTableAutoMaxHeight } from '@/hooks/useElTableAutoMaxHeight';
import LinkFormDialog from './components/LinkFormDialog.vue';
import { useLinkList } from './useLinkList';
import { useLinkForm } from './useLinkForm';

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
  handlePageChange,
  handleSizeChange,
  resetQuery,
  calculateIndex
} = useLinkList();

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
} = useLinkForm(fetchData);

const linkToggleTitle = (row: any) => {
  const actionText = row?.status === 1 ? '禁用' : '启用';
  const name = String(row?.name || '').trim();
  const extra = name ? `链接「${name}」` : '该链接';
  return `确认${actionText}${extra}吗？`;
};

const toggleStatus = async (row: any, nextEnabled: boolean) => {
  if (row?.id == null) return;
  const prevStatus = row.status;
  const nextStatus = nextEnabled ? 1 : 0;
  row.status = nextStatus;
  try {
    await updateLink(row.id, { status: nextStatus });
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
