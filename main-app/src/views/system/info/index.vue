<template>
  <div class="page-container">
    <h2 class="page-title">资讯管理</h2>
    <div class="page-card" ref="pageCardRef">
      <div ref="tableTopRef">
        <el-form :model="queryParams" @submit.prevent="handleSearch">
          <el-row :gutter="20">
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="资讯标题">
                <el-input v-model="queryParams.title" placeholder="请输入资讯标题" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="资讯类型">
                <el-select v-model="queryParams.infoType" placeholder="全部" clearable style="width: 100%">
                  <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value">
                    <el-tag :type="item.value === 'external' ? 'warning' : 'primary'">
                      {{ item.label }}
                    </el-tag>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="状态">
                <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 100%">
                  <el-option label="已发布" :value="1">
                    <StatusTag status-key="PUBLISHED" source="workflow" variant="outline" />
                  </el-option>
                  <el-option label="草稿" :value="0">
                    <StatusTag status-key="DRAFT" source="workflow" variant="outline" />
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="4" :xl="3" class="query-btns">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-col>
          </el-row>
        </el-form>

        <div class="add-row">
          <el-button type="primary" plain v-permission="PERMS.INFO.ADD" @click="handleAdd">
            新增
          </el-button>
        </div>
      </div>

      <el-table class="page-table page-table--respect-column-align" :data="tableData" v-loading="loading" border
        :max-height="tableMaxHeight">
        <template #empty>
          <TableEmpty />
        </template>
        <el-table-column type="index" label="序号" width="60" align="left" header-align="left" />
        <el-table-column prop="title" label="资讯标题" min-width="260" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column prop="infoCategory" label="资讯分类" width="140" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column label="资讯类型" width="110" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="row.infoType === 'external' ? 'warning' : 'primary'">
              {{ row.infoType === 'external' ? '外部' : '内部' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="外部链接" min-width="200" align="left" header-align="left" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.infoType === 'external' ? row.externalLink || '-' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="publisher" label="发布人" width="140" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <StatusTag :status-key="row.status === 1 ? 'PUBLISHED' : 'DRAFT'" source="workflow" variant="outline"
              tag-size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column label="操作" width="220" fixed="right" align="left" header-align="left">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)" v-permission="PERMS.INFO.EDIT">
              编辑
            </el-button>
            <el-popconfirm :title="`确认删除资讯「${row.title}」吗？`" width="280" confirm-button-text="确定"
              cancel-button-text="取消" :icon="WarningFilled" icon-color="#E6A23C" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" v-permission="PERMS.INFO.DEL">删除</el-button>
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
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { WarningFilled } from '@element-plus/icons-vue';
import { PAGE_SIZES, PAGINATION_LAYOUT } from '@/config';
import { PERMS } from '@/constants/permissions';
import StatusTag from '@/components/StatusTag.vue';
import { useElTableAutoMaxHeight } from '@/hooks/useElTableAutoMaxHeight';
import { deleteSystemInfo, type SystemInfo } from '@/api/systemInfo';
import { useInfoList } from './useInfoList';

const router = useRouter();
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
  typeOptions,
  queryParams,
  fetchData,
  handleSearch,
  handlePageChange,
  handleSizeChange,
  resetQuery
} = useInfoList();

const handleAdd = () => {
  router.push('/system/info/edit');
};

const handleEdit = (row: SystemInfo) => {
  router.push({
    path: '/system/info/edit',
    query: { id: String(row.id) }
  });
};

const handleDelete = async (row: SystemInfo) => {
  await deleteSystemInfo(row.id);
  ElMessage.success('删除成功');
  await fetchData();
};
</script>

<style scoped></style>
