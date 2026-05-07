<template>
  <div class="page-container">
    <h2 class="page-title">API管理</h2>

    <div class="page-card" ref="pageCardRef">
      <div ref="tableTopRef">
        <el-form :model="queryParams" @submit.prevent="handleSearch">
          <el-row :gutter="20">
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="API名称">
                <el-input v-model="queryParams.name" placeholder="请输入 API 名称" clearable />
              </el-form-item>
            </el-col>
            <!-- <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
            <el-form-item label="接口路径">
              <el-input v-model="queryParams.path" placeholder="请输入接口路径" clearable />
            </el-form-item>
          </el-col> -->
            <el-col :span="4" :xs="24" :sm="12" :md="6" :lg="4" :xl="6">
              <el-form-item label="请求方式">
                <el-select v-model="queryParams.method" placeholder="全部" clearable style="width: 100%">
                  <el-option v-for="item in API_METHOD_OPTIONS" :key="item.value" :label="item.label"
                    :value="item.value">
                    <el-tag :type="item.value === 'GET'
                      ? 'success'
                      : item.value === 'POST'
                        ? 'primary'
                        : item.value === 'PUT'
                          ? 'warning'
                          : item.value === 'DELETE'
                            ? 'danger'
                            : 'info'">
                      {{ item.label }}
                    </el-tag>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4" :xs="24" :sm="12" :md="6" :lg="4" :xl="6">
              <el-form-item label="状态">
                <el-select v-model="queryParams.enabled" placeholder="全部" clearable style="width: 100%">
                  <el-option v-for="item in API_ENABLED_OPTIONS" :key="String(item.value)" :label="item.label"
                    :value="item.value">
                    <StatusTag :status-key="item.value ? 1 : 0" variant="outline" />
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4" :xs="24" :sm="24" :md="12" :lg="6" :xl="4" class="query-btns">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-col>
          </el-row>
          <div class="app-filter-panel">
            <el-row :gutter="20">
              <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <el-select v-model="queryParams.appName" placeholder="全部应用" clearable @change="handleSearch">
                  <template #label="{ label, value }">
                    <span class="app-option-cell">
                      <MenuIcon
                        v-if="getAppIconByValue(String(value || ''))"
                        :icon="getAppIconByValue(String(value || ''))"
                        class="app-option-icon"
                      />
                      <span>{{ label }}</span>
                    </span>
                  </template>
                  <el-option v-for="item in appOptions" :key="item.value" :label="item.label" :value="item.value">
                    <span class="app-option-cell">
                      <MenuIcon v-if="item.iconName" :icon="item.iconName" class="app-option-icon" />
                      <span>{{ item.label }}</span>
                    </span>
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <el-button type="primary" plain @click="handleAdd">新增API</el-button>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>



      <el-table class="page-table page-table--respect-column-align" :data="tableData" border v-loading="loading"
        :max-height="tableMaxHeight">
        <template #empty>
          <TableEmpty />
        </template>
        <el-table-column type="index" label="序号" width="70" align="left" header-align="left" />
        <el-table-column prop="name" label="API名称" min-width="160" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column prop="path" label="接口路径" min-width="220" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column label="请求方式" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="row.method === 'GET'
              ? 'success'
              : row.method === 'POST'
                ? 'primary'
                : row.method === 'PUT'
                  ? 'warning'
                  : row.method === 'DELETE'
                    ? 'danger'
                    : 'info'">
              {{ row.method || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permissionCode" label="权限标识" min-width="220" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column prop="appName" label="所属应用" width="120" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column label="是否鉴权" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="row.needAuth ? 'success' : 'info'">
              {{ row.needAuth ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column width="100" align="center" header-align="center">
          <template #header>
            <span class="label-with-tip">
              <span>是否通用</span>
              <el-tooltip placement="top" trigger="hover">
                <template #content>
                  <span class="hint-content">通用API指的是所有用户都有权限访问的接口</span>
                </template>
                <div class="info-icon"></div>
              </el-tooltip>
            </span>
          </template>
          <template #default="{ row }">
            <el-tag :type="row.isCommon ? 'success' : 'info'">
              {{ row.isCommon ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center" header-align="center">
          <template #default="{ row }">
            <OpPopSwitch :model-value="row.enabled === true" :title="apiToggleTitle(row)"
              @confirm="handleToggleEnable(row, row.enabled !== true)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" align="left" header-align="left">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm :title="`确认删除接口「${row.name}」吗？`" width="260" confirm-button-text="确定" cancel-button-text="取消"
              :icon="WarningFilled" icon-color="#E6A23C" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" ref="paginationRef">
        <el-pagination v-model:current-page="queryParams.pageIndex" v-model:page-size="queryParams.pageSize"
          :page-sizes="PAGE_SIZES" :layout="PAGINATION_LAYOUT" :total="total" @current-change="handlePageChange"
          @size-change="handleSizeChange" />
      </div>
    </div>
  </div>

  <ApiFormDialog v-model="dialogVisible" :title="dialogTitle" :form="formData" :rules="rules" :loading="submitLoading"
    :path-prefix="pathPrefix" :permission-code="permissionCode" :method-options="API_METHOD_OPTIONS"
    :app-options="appOptions" @submit="submitForm" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PAGE_SIZES, PAGINATION_LAYOUT } from '@/config';
import OpPopSwitch from '@/components/OpPopSwitch.vue';
import StatusTag from '@/components/StatusTag.vue';
import MenuIcon from '@/components/MenuIcon.vue';
import { QuestionFilled } from '@element-plus/icons-vue';
import { WarningFilled } from '@element-plus/icons-vue';
import { useElTableAutoMaxHeight } from '@/hooks/useElTableAutoMaxHeight';
import { API_ENABLED_OPTIONS, API_METHOD_OPTIONS } from './constants';
import { useApiList } from './useApiList';
import { useApiForm } from './useApiForm';
import ApiFormDialog from './components/ApiFormDialog.vue';

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
  appOptions,
  queryParams,
  handleSearch,
  resetQuery,
  handlePageChange,
  handleSizeChange,
  fetchData
} = useApiList();

const {
  dialogVisible,
  dialogTitle,
  formData,
  pathPrefix,
  permissionCode,
  rules,
  submitLoading,
  handleAdd,
  handleEdit,
  submitForm,
  handleDelete,
  handleToggleEnable
} = useApiForm(fetchData);

const apiToggleTitle = (row: any) => {
  const actionText = row?.enabled ? '禁用' : '启用';
  const name = String(row?.name || '').trim();
  const extra = name ? `接口「${name}」` : '该接口';
  return `确认${actionText}${extra}吗？`;
};

const getAppIconByValue = (value: string) =>
  appOptions.value.find((item) => item.value === value)?.iconName || '';
</script>

<style scoped>
.label-with-tip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.toolbar-row {
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  margin-bottom: 12px;
  gap: 12px;
}

.hint-icon {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
}

.hint-content {
  white-space: pre-line;
}

.app-option-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  line-height: 1;
}

.app-option-icon {
  display: inline-flex;
  align-items: center;
}

.app-option-icon :deep(.menu-icon-wrapper) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px !important;
  height: 14px !important;
  font-size: 14px !important;
  margin-right: 0 !important;
}

:deep(.el-select__selected-item) {
  display: flex;
  align-items: center;
  min-height: 100%;
}

:deep(.el-select__selected-item .app-option-cell) {
  display: inline-flex;
  align-items: center;
}
</style>
