<template>
  <div class="page-container">
    <h2 class="page-title">租户管理</h2>
    <div class="page-card" ref="pageCardRef">
      <div ref="tableTopRef">
        <el-form :model="queryParams" @submit.prevent="handleSearch">
          <el-row :gutter="20">
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item prop="tenantName" label="租户名称">
                <el-input v-model="queryParams.tenantName" placeholder="请输入租户名称" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item prop="status" label="租户状态">
                <el-select
                  v-model="queryParams.status"
                  placeholder="全部"
                  clearable
                  style="width: 100%"
                >
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
          <el-button type="primary" plain @click="handleAdd" v-permission="PERMS.TENANT.ADD">
            新增租户
          </el-button>
        </div>
      </div>
      <el-table
        class="page-table page-table--respect-column-align"
        :data="tableData"
        v-loading="loading"
        border
        :max-height="tableMaxHeight"
      >
        <template #empty>
          <TableEmpty />
        </template>
        <el-table-column type="index" label="序号" width="60" align="left" header-align="left" />
        <el-table-column
          prop="tenantName"
          label="租户名称"
          min-width="200"
          align="left"
          header-align="left"
          show-overflow-tooltip
        />
        <el-table-column
          prop="shortName"
          label="租户简称"
          width="120"
          align="left"
          header-align="left"
          show-overflow-tooltip
        />
        <el-table-column
          prop="tenantCode"
          label="租户编码"
          width="120"
          align="left"
          header-align="left"
          show-overflow-tooltip
        />
        <!-- <el-table-column prop="adminName" label="租户管理员" width="120" show-overflow-tooltip />
      <el-table-column prop="appCount" label="应用数" width="90" align="center" />
      <el-table-column prop="userCount" label="用户数" width="90" align="center" /> -->
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="170"
          align="left"
          header-align="left"
        />
        <el-table-column label="状态" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <OpPopSwitch
              v-permission="PERMS.TENANT.ENABLE"
              :model-value="row.status === 1"
              :title="row.status === 1 ? '确认禁用该租户吗？' : '确认启用该租户吗？'"
              @confirm="handleToggleEnable(row, row.status !== 1)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right" align="left" header-align="left">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="handleEdit(row)"
              v-permission="PERMS.TENANT.EDIT"
            >
              编辑
            </el-button>
            <el-button
              link
              type="primary"
              @click="openAuthApps(row)"
              v-permission="PERMS.TENANT.AUTH_APP"
            >
              授权应用
            </el-button>
            <el-popconfirm
              title="确认删除该租户吗？"
              width="220"
              confirm-button-text="确定"
              cancel-button-text="取消"
              :icon="WarningFilled"
              icon-color="#E6A23C"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button link type="danger" v-permission="PERMS.TENANT.DEL">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" ref="paginationRef">
        <el-pagination
          v-model:current-page="queryParams.pageIndex"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="PAGE_SIZES"
          :layout="PAGINATION_LAYOUT"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>

  <TenantFormDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :form="form"
    :rules="rules"
    :loading="submitLoading"
    @submit="submitForm"
  />

  <TenantAppAuthorizeDialog
    v-model="authDialogVisible"
    :tenant="currentAuthTenant"
    v-model:searchName="authSearchName"
    :appsByCategory="authAppsByCategory"
    :loading="authLoading"
    :saving="authSaving"
    v-model:selectedAppIds="authSelectedAppIds"
    @save="saveAuthApps"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { WarningFilled } from '@element-plus/icons-vue';
  import { PERMS } from '@/constants/permissions';
  import OpPopSwitch from '@/components/OpPopSwitch.vue';
  import StatusTag from '@/components/StatusTag.vue';
  import { PAGE_SIZES, PAGINATION_LAYOUT } from '@/config';
  import { useElTableAutoMaxHeight } from '@/hooks/useElTableAutoMaxHeight';
  import TenantFormDialog from './components/TenantFormDialog.vue';
  import TenantAppAuthorizeDialog from './components/TenantAppAuthorizeDialog.vue';
  import { useTenantList } from './useTenantList';
  import { useTenantForm } from './useTenantForm';
  import { useTenantAppAuth } from './useTenantAppAuth';

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
    resetQuery
  } = useTenantList();

  const {
    dialogVisible,
    dialogTitle,
    form,
    rules,
    submitLoading,
    handleAdd,
    handleEdit,
    submitForm,
    handleDelete,
    handleToggleEnable
  } = useTenantForm(fetchData);

  const {
    dialogVisible: authDialogVisible,
    currentTenant: currentAuthTenant,
    loading: authLoading,
    saving: authSaving,
    searchName: authSearchName,
    appsByCategory: authAppsByCategory,
    selectedAppIds: authSelectedAppIds,
    open: openAuthApps,
    save: saveAuthApps
  } = useTenantAppAuth({ refreshTenantList: fetchData });
</script>
