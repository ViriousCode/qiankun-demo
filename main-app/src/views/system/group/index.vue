<template>
  <div class="page-container">
    <h2 class="page-title">群组管理</h2>

    <div class="page-card" ref="pageCardRef">
      <div ref="tableTopRef">
        <el-form :model="queryParams" @submit.prevent="handleSearch">
          <el-row :gutter="20">
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item prop="keyword" label="群组关键字">
                <el-input v-model="queryParams.keyword" placeholder="群组关键字（名称/编码/描述）" clearable prefix-icon="Search"
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

            <el-col :span="12" :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="query-btns">
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
                <el-button type="primary" @click="handleAdd" v-permission="PERMS.GROUP.ADD" plain>
                  新增群组
                </el-button>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>

      <el-table class="page-table page-table--respect-column-align"
        :key="isAdmin ? (queryParams.tenantId ?? 'auto') : 'auto'" :data="groupList" border style="width: 100%"
        v-loading="loading" :max-height="tableMaxHeight">
        <template #empty>
          <TableEmpty />
        </template>
        <el-table-column type="index" label="序号" width="70" align="left" header-align="left" />
        <el-table-column prop="groupName" label="群组名称" min-width="160" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column prop="groupCode" label="群组编码" width="160" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="220" align="left" header-align="left"
          show-overflow-tooltip />
        <!-- <el-table-column prop="roleCount" label="角色数" width="90" align="center" />
        <el-table-column prop="userCount" label="用户数" width="90" align="center" /> -->
        <el-table-column label="是否默认" width="110" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="row.isDefault ? 'success' : 'info'">
              {{ row.isDefault ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="200" align="left" header-align="left" />
        <el-table-column label="状态" width="110" align="center" header-align="center">
          <template #default="{ row }">
            <OpPopSwitch v-permission="PERMS.GROUP.ENABLE" :model-value="Number(row.status) === 1"
              :title="Number(row.status) === 1 ? '确认禁用该群组吗？' : '确认启用该群组吗？'"
              @confirm="handleToggleEnable(row, Number(row.status) !== 1)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right" align="left" header-align="left">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)" v-permission="PERMS.GROUP.EDIT">
              编辑
            </el-button>
            <el-popconfirm title="确认删除该群组吗？" width="220" confirm-button-text="确定" cancel-button-text="取消"
              :icon="WarningFilled" icon-color="#E6A23C" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" v-permission="PERMS.GROUP.DEL">删除</el-button>
              </template>
            </el-popconfirm>
            <el-button link type="primary" @click="handleRole(row)" v-permission="PERMS.GROUP.AUTH_ROLE">
              配置角色
            </el-button>
            <el-tooltip v-if="row.isDefault" placement="top" trigger="hover" content="默认群组不支持授权账户">
              <el-button link type="primary" disabled v-permission="PERMS.GROUP.AUTH_USER">
                授权账户
              </el-button>
            </el-tooltip>
            <el-button v-else link type="primary" @click="handleUser(row)" v-permission="PERMS.GROUP.AUTH_USER">
              授权账户
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>

  <GroupFormDialog v-model="dialogVisible" :title="dialogTitle" :tenant-name="currentTenantName" :is-edit="isEdit"
    :form="form" :rules="rules" :loading="submitLoading" @submit="submitForm" />

  <GroupRoleDialog v-model="roleDialogVisible" :tenant-name="currentTenantName" :group-name="currentGroupName"
    :group-code="currentGroupCode" v-model:keyword="roleKeyword" :tenant-id="roleTenantId"
    :role-list-all="roleOptionsAll" :role-list="roleOptions" v-model:selected-role-ids="selectedRoleIds"
    :loading="roleLoading" :saving="roleSaving" @save="saveGroupRoles" />

  <GroupUserDialog v-model="userDialogVisible" :tenant-name="currentTenantName" :group-name="userCurrentGroupName"
    :group-code="userCurrentGroupCode" v-model:keyword="userKeyword" :tenant-id="userTenantId"
    :user-list-all="userOptionsAll" :user-list="userOptions" v-model:selected-user-ids="selectedUserIds"
    :loading="userLoading" :saving="userSaving" @save="saveGroupUsers" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { WarningFilled } from '@element-plus/icons-vue';
import { PERMS } from '@/constants/permissions';
import OpPopSwitch from '@/components/OpPopSwitch.vue';
import StatusTag from '@/components/StatusTag.vue';
import { useElTableAutoMaxHeight } from '@/hooks/useElTableAutoMaxHeight';
import GroupFormDialog from './components/GroupFormDialog.vue';
import GroupRoleDialog from './components/GroupRoleDialog.vue';
import GroupUserDialog from './components/GroupUserDialog.vue';
import { useGroupList } from './useGroupList';
import { useGroupForm } from './useGroupForm';
import { useGroupRole } from './useGroupRole';
import { useGroupUser } from './useGroupUser';

const pageCardRef = ref<HTMLElement | null>(null);
const tableTopRef = ref<HTMLElement | null>(null);
const { tableMaxHeight } = useElTableAutoMaxHeight({
  containerRef: pageCardRef,
  subtractRefs: [tableTopRef],
  extraOffset: 24
});

const {
  loading,
  groupList,
  isAdmin,
  queryParams,
  tenantLoading,
  tenantOptions,
  currentTenantName,
  resolveCurrentTenantId,
  fetchData,
  handleSearch,
  resetQuery
} = useGroupList();

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
} = useGroupForm({ fetchData, resolveCurrentTenantId });

const {
  dialogVisible: roleDialogVisible,
  currentGroupName,
  currentGroupCode,
  keyword: roleKeyword,
  currentTenantId: roleTenantId,
  roleOptionsAll,
  roleOptions,
  selectedRoleIds,
  loading: roleLoading,
  saving: roleSaving,
  open: handleRole,
  save: saveGroupRoles
} = useGroupRole({ fetchData, resolveCurrentTenantId });

const {
  dialogVisible: userDialogVisible,
  currentGroupName: userCurrentGroupName,
  currentGroupCode: userCurrentGroupCode,
  keyword: userKeyword,
  currentTenantId: userTenantId,
  userOptionsAll,
  userOptions,
  selectedUserIds,
  loading: userLoading,
  saving: userSaving,
  open: handleUser,
  save: saveGroupUsers
} = useGroupUser({ fetchData, resolveCurrentTenantId });
</script>

<style scoped>
.toolbar-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}
</style>
