<template>
  <div class="page-container">
    <h2 class="page-title">用户管理</h2>
    <div class="page-card" ref="pageCardRef">
      <div ref="tableTopRef">
        <el-form :model="queryParams" @submit.prevent="handleSearch">
          <el-row :gutter="20">
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="姓名">
                <el-select
                  v-model="queryParams.name"
                  placeholder="请输入姓名"
                  clearable
                  filterable
                  style="width: 100%"
                >
                  <el-option v-for="item in nameOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="状态">
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
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="租户">
                <el-select
                  v-model="queryParams.tenantFilter"
                  placeholder="全部"
                  clearable
                  filterable
                  style="width: 100%"
                >
                  <el-option label="无租户" :value="TENANT_FILTER_NONE" />
                  <el-option
                    v-for="item in tenantList"
                    :key="item.id"
                    :label="item.tenantName"
                    :value="item.id"
                  />
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
          <el-button type="primary" plain @click="handleAdd" v-permission="PERMS.USER.ADD">
            新增用户
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
          prop="name"
          label="姓名"
          width="120"
          align="left"
          header-align="left"
          show-overflow-tooltip
        />
        <el-table-column
          prop="nickName"
          label="昵称"
          width="120"
          align="left"
          header-align="left"
          show-overflow-tooltip
        />
        <el-table-column label="性别" width="100" align="left" header-align="left">
          <template #default="{ row }">
            {{ displayGender(row.gender) }}
          </template>
        </el-table-column>
        <el-table-column
          label="租户"
          min-width="220"
          align="left"
          header-align="left"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ row.tenantName || '无租户' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="170"
          align="left"
          header-align="left"
          show-overflow-tooltip
        />
        <el-table-column label="状态" width="90" align="center" header-align="center">
          <template #default="{ row }">
            <OpPopSwitch
              v-permission="PERMS.USER.ENABLE"
              :model-value="row.status === 1"
              :title="row.status === 1 ? '确认禁用该用户吗？' : '确认启用该用户吗？'"
              @confirm="handleToggleEnable(row, row.status !== 1)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="left" header-align="left">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)" v-permission="PERMS.USER.EDIT">
              编辑
            </el-button>
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

  <UserFormDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :form="form"
    :tenant-options="tenantList"
    :rules="rules"
    :loading="submitLoading"
    @submit="submitForm"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { PERMS } from '@/constants/permissions';
  import OpPopSwitch from '@/components/OpPopSwitch.vue';
  import StatusTag from '@/components/StatusTag.vue';
  import { PAGE_SIZES, PAGINATION_LAYOUT } from '@/config';
  import { useElTableAutoMaxHeight } from '@/hooks/useElTableAutoMaxHeight';
  import UserFormDialog from './components/UserFormDialog.vue';
  import { useUserList, TENANT_FILTER_NONE } from './useUserList';
  import { useUserForm } from './useUserForm';

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
    tenantList,
    nameOptions,
    queryParams,
    fetchData,
    handleSearch,
    handlePageChange,
    handleSizeChange,
    resetQuery,
    displayGender
  } = useUserList();

  const {
    dialogVisible,
    dialogTitle,
    form,
    rules,
    submitLoading,
    handleAdd,
    handleEdit,
    submitForm,
    handleToggleEnable
  } = useUserForm(fetchData);
</script>

<style scoped></style>
