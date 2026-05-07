<template>
  <div class="page-container">
    <h2 class="page-title">角色管理</h2>
    <div class="page-card" ref="pageCardRef">
      <div ref="tableTopRef">
        <el-form :model="queryParams" @submit.prevent="handleSearch">
          <el-row :gutter="20">
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item prop="keyword" label="角色关键字">
                <el-input v-model="queryParams.keyword" placeholder="角色关键字（名称/编码/描述）" clearable prefix-icon="Search"
                  @keyup.enter="fetchData" />
              </el-form-item>
            </el-col>

            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item prop="status" label="状态">
                <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 100%"
                  @change="fetchData">
                  <el-option :value="1" label="启用">
                    <StatusTag :status-key="1" variant="outline" />
                  </el-option>
                  <el-option :value="0" label="禁用">
                    <StatusTag :status-key="0" variant="outline" />
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12" :xs="24" :sm="12" :md="8" :lg="8" :xl="6" class="query-btns">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-col>
          </el-row>
          <div class="app-filter-panel">
            <el-row :gutter="20">
              <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <el-select v-if="isAdmin" v-model="queryParams.tenantId" placeholder="请选择租户" clearable filterable
                  :loading="tenantLoading" @change="fetchData">
                  <el-option v-for="t in tenantOptions" :key="t.value" :label="t.label" :value="t.value" />
                </el-select>
              </el-col>
              <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <el-button type="primary" plain @click="handleAdd" v-permission="PERMS.ROLE.ADD">
                  新增角色
                </el-button>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>
      <el-table class="page-table page-table--respect-column-align"
        :key="isAdmin ? (queryParams.tenantId ?? 'auto') : 'auto'" :data="roleList" border style="width: 100%"
        v-loading="loading" :max-height="tableMaxHeight">
        <template #empty>
          <TableEmpty />
        </template>
        <el-table-column type="index" label="序号" width="70" align="left" header-align="left" />
        <el-table-column prop="roleName" label="角色名称" min-width="160" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column prop="roleCode" label="角色编码" width="160" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="220" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column prop="updateTime" label="更新时间" width="200" align="left" header-align="left" />
        <el-table-column label="状态" width="110" align="center" header-align="center">
          <template #default="{ row }">
            <OpPopSwitch v-permission="PERMS.ROLE.EDIT" :model-value="Number(row.status) === 1"
              :title="Number(row.status) === 1 ? '确认禁用该角色吗？' : '确认启用该角色吗？'"
              @confirm="handleToggleEnable(row, Number(row.status) !== 1)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right" align="left" header-align="left">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)" v-permission="PERMS.ROLE.EDIT">
              编辑
            </el-button>
            <el-popconfirm title="确认删除该角色吗？" width="220" confirm-button-text="确定" cancel-button-text="取消"
              :icon="WarningFilled" icon-color="#E6A23C" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" v-permission="PERMS.ROLE.DEL">删除</el-button>
              </template>
            </el-popconfirm>
            <el-button link type="primary" @click="handlePermission(row)" v-permission="PERMS.ROLE.EDIT">
              配置菜单
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <RoleFormDialog v-model="dialogVisible" :title="dialogTitle" :tenant-name="currentTenantName" :is-edit="isEdit"
    :form="form" :rules="rules" :loading="submitLoading" @submit="submitForm" />

  <RolePermissionDialog v-model="permDialogVisible" v-model:app-filter="appFilter"
    v-model:check-strictly="checkStrictly" :tenant-name="currentTenantName" :role-name="currentRoleName"
    :role-code="currentRoleCode" :permission-data="permissionData" :app-filter-options="appFilterOptions"
    :initial-checked-ids="initialPermissionIds" @app-filter-change="applyAppFilter" @save="submitPermission" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { WarningFilled } from '@element-plus/icons-vue';
import { PERMS } from '@/constants/permissions';
import OpPopSwitch from '@/components/OpPopSwitch.vue';
import StatusTag from '@/components/StatusTag.vue';
import { useElTableAutoMaxHeight } from '@/hooks/useElTableAutoMaxHeight';
import RoleFormDialog from './components/RoleFormDialog.vue';
import RolePermissionDialog from './components/RolePermissionDialog.vue';
import { useRoleList } from './useRoleList';
import { useRoleForm } from './useRoleForm';
import { useRolePermission } from './useRolePermission';

const pageCardRef = ref<HTMLElement | null>(null);
const tableTopRef = ref<HTMLElement | null>(null);
const { tableMaxHeight } = useElTableAutoMaxHeight({
  containerRef: pageCardRef,
  subtractRefs: [tableTopRef],
  extraOffset: 24
});

const {
  loading,
  roleList,
  isAdmin,
  queryParams,
  tenantLoading,
  tenantOptions,
  currentTenantName,
  resolveCurrentTenantId,
  fetchData,
  handleSearch,
  resetQuery
} = useRoleList();

const {
  dialogVisible,
  dialogTitle,
  isEdit,
  form,
  rules,
  submitLoading,
  handleAdd,
  handleEdit,
  submitForm,
  handleDelete,
  handleToggleEnable
} = useRoleForm({ fetchData, resolveCurrentTenantId });

const {
  permDialogVisible,
  permissionData,
  checkStrictly,
  appFilter,
  appFilterOptions,
  applyAppFilter,
  initialPermissionIds,
  currentRoleName,
  currentRoleCode,
  handlePermission,
  submitPermission
} = useRolePermission({ roleList, fetchData, resolveCurrentTenantId });
</script>

<style scoped>
.toolbar-row {
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  margin-bottom: 12px;
  gap: 12px;
}
</style>
