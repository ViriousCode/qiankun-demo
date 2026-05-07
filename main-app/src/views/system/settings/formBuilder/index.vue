<template>
  <div class="page-container">
    <h2 class="page-title">表单生成器</h2>
    <div class="page-card" ref="pageCardRef">
      <div ref="tableTopRef">
        <el-form :model="queryParams" @submit.prevent="handleSearch">
          <el-row :gutter="20">
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item prop="keyword" label="关键词">
                <el-input v-model="queryParams.keyword" placeholder="名称 / 编码" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item prop="status" label="状态">
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
            <el-col :span="12" :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="query-btns">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-col>
          </el-row>
        </el-form>

        <div class="add-row">
          <el-button type="primary" plain @click="handleAdd" v-permission="PERMS.FORM_DEF.ADD">
            新建表单
          </el-button>
        </div>
      </div>

      <el-table class="page-table page-table--respect-column-align" :data="tableData" v-loading="loading" border
        style="width: 100%" table-layout="fixed" :max-height="tableMaxHeight">
        <template #empty>
          <TableEmpty />
        </template>
        <el-table-column type="index" label="序号" width="60" align="left" header-align="left" />
        <el-table-column prop="name" label="表单名称" min-width="200" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column prop="code" label="编码" width="160" align="left" header-align="left" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <OpPopSwitch v-permission="PERMS.FORM_DEF.EDIT" :model-value="row.status === 1"
              :title="formToggleTitle(row)" :width="280" :loading="enablingIds.has(row.id)"
              @confirm="handleToggleEnable(row, row.status !== 1)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" align="left" header-align="left" />
        <el-table-column prop="updateTime" label="更新时间" width="170" align="left" header-align="left" />
        <el-table-column label="操作" width="320" fixed="right" align="left" header-align="left">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDesigner(row)" v-permission="PERMS.FORM_DEF.DESIGN">
              编辑
            </el-button>
            <el-button link type="primary" @click="openFill(row)" v-permission="PERMS.FORM_DEF.FILL">
              预览
            </el-button>
            <el-button link type="primary" @click="openSubmissions(row)" v-permission="PERMS.FORM_DEF.SUBMISSION_VIEW">
              提交记录
            </el-button>
            <el-popconfirm :title="`确认删除表单「${row.name}」？（将同时删除提交记录）`" width="320" confirm-button-text="确定"
              cancel-button-text="取消" :icon="WarningFilled" icon-color="#E6A23C" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" v-permission="PERMS.FORM_DEF.DEL">删除</el-button>
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
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import { WarningFilled } from '@element-plus/icons-vue';
import OpPopSwitch from '@/components/OpPopSwitch.vue';
import StatusTag from '@/components/StatusTag.vue';
import { useRouter } from 'vue-router';
import {
  deleteFormDefinition,
  getFormDefinitionList,
  updateFormDefinition
} from '@/api/formDefinition';
import type { FormDefinition } from '@/types/formBuilder';
import { PERMS } from '@/constants/permissions';
import { useElTableAutoMaxHeight } from '@/hooks/useElTableAutoMaxHeight';
import { PAGINATION_LAYOUT } from '@/config';

const router = useRouter();

const PAGE_SIZES = [10, 20, 50, 100];

const pageCardRef = ref<HTMLElement | null>(null);
const tableTopRef = ref<HTMLElement | null>(null);
const paginationRef = ref<HTMLElement | null>(null);
const { tableMaxHeight } = useElTableAutoMaxHeight({
  containerRef: pageCardRef,
  subtractRefs: [tableTopRef, paginationRef],
  extraOffset: 24
});

const queryParams = reactive<{
  keyword: string;
  status?: number;
  pageIndex: number;
  pageSize: number;
}>({
  keyword: '',
  status: undefined,
  pageIndex: 1,
  pageSize: 10
});

const tableData = ref<FormDefinition[]>([]);
const total = ref(0);
const loading = ref(false);
const enablingIds = ref<Set<number>>(new Set());

const fetchList = async () => {
  loading.value = true;
  try {
    const payload = await getFormDefinitionList({ ...queryParams });
    tableData.value = payload?.list || [];
    total.value = payload?.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  queryParams.pageIndex = 1;
  fetchList();
};

const resetQuery = () => {
  queryParams.keyword = '';
  queryParams.status = undefined;
  queryParams.pageIndex = 1;
  queryParams.pageSize = 10;
  fetchList();
};

const handleSizeChange = (size: number) => {
  queryParams.pageSize = size;
  queryParams.pageIndex = 1;
  fetchList();
};
const handlePageChange = (page: number) => {
  queryParams.pageIndex = page;
  fetchList();
};

const handleAdd = () => {
  router.push('/system/settings/formBuilder/designer');
};

const openDesigner = (row: FormDefinition) => {
  router.push({ path: '/system/settings/formBuilder/designer', query: { id: row.id } });
};
const openFill = (row: FormDefinition) => {
  router.push({ path: '/system/settings/formBuilder/fill', query: { id: row.id } });
};
const openSubmissions = (row: FormDefinition) => {
  router.push({ path: '/system/settings/formBuilder/submissions', query: { id: row.id } });
};

const handleDelete = async (row: FormDefinition) => {
  await deleteFormDefinition(row.id);
  ElMessage.success('删除成功');
  fetchList();
};

const formToggleTitle = (row: FormDefinition) => {
  const text = row.status !== 1 ? '启用' : '禁用';
  return `确认${text}表单「${row.name}」？`;
};

const handleToggleEnable = async (row: FormDefinition, enabled: boolean) => {
  const id = row.id;
  enablingIds.value.add(id);
  const prev = row.status;
  row.status = enabled ? 1 : 0;
  try {
    await updateFormDefinition(id, { status: row.status });
    ElMessage.success('保存成功');
  } catch (e) {
    row.status = prev;
    throw e;
  } finally {
    enablingIds.value.delete(id);
  }
};

onMounted(() => {
  fetchList();
});
</script>
