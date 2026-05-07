<template>
  <div class="page-container">
    <h2 class="page-title">账号管理</h2>
    <div class="page-card" ref="pageCardRef">
      <div ref="tableTopRef">
        <el-form :model="queryParams" @submit.prevent="handleSearch">
          <el-row :gutter="20">
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item prop="name" label="用户">
                <el-select v-model="queryParams.name" placeholder="请选择用户" filterable clearable style="width: 100%">
                  <el-option v-for="item in nameOptions" :key="item.value" :label="item.label" :value="item.value">
                    <div class="user-option">
                      <span class="user-option__name">{{ item.label }}</span>
                      <el-tag v-if="item.tenantShortName" type="primary" effect="plain">
                        {{ item.tenantShortName }}
                      </el-tag>
                      <el-tag v-else type="primary" effect="plain">无租户</el-tag>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item prop="keyword" label="认证标识">
                <el-input v-model="queryParams.keyword" placeholder="请输入认证标识" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item prop="accountType" label="账号类型">
                <el-select v-model="accountType" placeholder="请选择" clearable>
                  <el-option label="用户名" value="name" />
                  <el-option label="手机号" value="phone" />
                  <el-option label="浙政钉" value="zzd" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item prop="status" label="账号状态">
                <el-select v-model="queryParams.status" placeholder="请选择" clearable>
                  <el-option :value="1" label="启用">
                    <StatusTag :status-key="1" variant="outline" />
                  </el-option>
                  <el-option :value="0" label="禁用">
                    <StatusTag :status-key="0" variant="outline" />
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12" :xs="24" :sm="24" :md="12" :lg="8" :xl="6">
              <el-button type="primary" plain @click="handleAdd" v-permission="PERMS.ACCOUNT.ADD">新增账号</el-button>
            </el-col>
            <el-col :span="12" :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="query-btns">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <el-table class="page-table page-table--respect-column-align" :data="tableData" v-loading="loading" border
        table-layout="fixed" row-key="id" :max-height="tableMaxHeight">
        <template #empty>
          <TableEmpty />
        </template>
        <el-table-column type="index" label="序号" width="60" align="left" header-align="left" />
        <el-table-column label="用户" width="180" align="left" header-align="left" show-overflow-tooltip>
          <template #default="{ row }">
            {{ displayLinkedUserName(row) }}
          </template>
        </el-table-column>
        <el-table-column label="认证标识" min-width="220" align="left" header-align="left" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="auth-id-cell">
              <span class="auth-id-tag">
                <el-icon class="auth-id-icon" size="14">
                  <component :is="getAuthTag(row).icon" />
                </el-icon>
                <span class="auth-id-label">{{ getAuthTag(row).label }}</span>
              </span>
              <span class="auth-id-value">{{ getAuthTag(row).value }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="是否锁定" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag v-if="row.locked === true" type="danger">
              已锁定
            </el-tag>
            <el-tag v-else-if="row.locked === false" type="success">
              未锁定
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="lockEndTime" label="锁定截止时间" width="180" align="left" header-align="left"
          show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.lockEndTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录时间" width="180" align="left" header-align="left"
          show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.lastLoginTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginIp" label="最后登录IP" width="210" align="left" header-align="left"
          show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.lastLoginIp || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="left" header-align="left"
          show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.createTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="账号状态" width="200" align="center" header-align="center">
          <template #default="{ row }">
            <div class="account-status-cell">
              <!-- <StatusTag :status-key="row.status" source="account" variant="outline" tag-size="small" /> -->
              <OpPopSwitch v-permission="PERMS.ACCOUNT.ENABLE" :model-value="row.status === 1"
                :title="row.status === 1 ? '确认禁用该账号吗？' : '确认启用该账号吗？'"
                @confirm="handleToggleEnable(row, row.status !== 1)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right" align="left" header-align="left">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-popconfirm v-if="showAccountUnlock(row)" title="确认解锁该账号吗？" width="220" confirm-button-text="确定"
              cancel-button-text="取消" :icon="WarningFilled" icon-color="#E6A23C" @confirm="handleUnlock(row)">
              <template #reference>
                <el-button link type="primary" v-permission="PERMS.ACCOUNT.UNLOCK">解锁</el-button>
              </template>
            </el-popconfirm>
            <el-button v-if="showAccountResetPassword(row)" link type="primary" @click="handleResetPassword(row)"
              v-permission="PERMS.ACCOUNT.RESET_PWD">
              重置密码
            </el-button>
            <el-popconfirm title="确认移除该账号吗？此操作不可恢复。" width="280" confirm-button-text="确定" cancel-button-text="取消"
              :icon="WarningFilled" icon-color="#E6A23C" @confirm="handleRemove(row)">
              <template #reference>
                <el-button link type="danger" v-permission="PERMS.ACCOUNT.REMOVE">移除</el-button>
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

  <AccountFormDialog v-model="dialogVisible" :title="dialogTitle" :form="accountForm" :user-options="accountUserOptions"
    :rules="accountRules" :loading="accountSubmitLoading" :is-edit="dialogTitle === '编辑账号'"
    @submit="submitAccountForm" />

  <ResetPasswordDialog v-model="resetPwdVisible" :auth-identifier="resetPwdAuthIdentifier" :form="resetPwdForm"
    :rules="resetPwdRules" :loading="resetPwdLoading" @submit="submitResetPassword" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { WarningFilled } from '@element-plus/icons-vue';
import { PERMS } from '@/constants/permissions';
import OpPopSwitch from '@/components/OpPopSwitch.vue';
import StatusTag from '@/components/StatusTag.vue';
import { PAGE_SIZES, PAGINATION_LAYOUT } from '@/config';
import { ref } from 'vue';
import { useElTableAutoMaxHeight } from '@/hooks/useElTableAutoMaxHeight';
import AccountFormDialog from './components/AccountFormDialog.vue';
import ResetPasswordDialog from './components/ResetPasswordDialog.vue';
import { useAccountList } from './useAccountList';
import { useAccountForm } from './useAccountForm';
import { Grid, Iphone, User } from '@element-plus/icons-vue';
import type { SystemUser } from '@/api/systemUser';
import {
  getAccountAuthIconKind,
  getAccountAuthKind,
  getAccountAuthValue,
  showAccountResetPassword,
  showAccountUnlock
} from './accountAuthUtils';

const {
  loading,
  tableData,
  total,
  nameOptions,
  accountType,
  queryParams,
  fetchData,
  handleSearch,
  handlePageChange,
  handleSizeChange,
  resetQuery,
  handleToggleEnable,
  handleUnlock,
  handleResetPassword,
  submitResetPassword,
  resetPwdVisible,
  resetPwdAuthIdentifier,
  resetPwdForm,
  resetPwdRules,
  resetPwdLoading,
  handleRemove,
  displayLinkedUserName,
} = useAccountList();

const pageCardRef = ref<HTMLElement | null>(null);
const tableTopRef = ref<HTMLElement | null>(null);
const paginationRef = ref<HTMLElement | null>(null);
const { tableMaxHeight } = useElTableAutoMaxHeight({
  containerRef: pageCardRef,
  subtractRefs: [tableTopRef, paginationRef],
  extraOffset: 24
});

const {
  dialogVisible,
  dialogTitle,
  form: accountForm,
  rules: accountRules,
  submitLoading: accountSubmitLoading,
  userOptions: accountUserOptions,
  handleAdd,
  handleEdit,
  submitForm: submitAccountForm,
} = useAccountForm(fetchData);

const authTagCache = computed(() => new Map<number, { label: string; value: string; icon: any }>());

const iconByKind: Record<string, any> = {
  user: User,
  phone: Iphone,
  grid: Grid
};

function getAuthTag(row: SystemUser) {
  const cached = authTagCache.value.get(row.id);
  if (cached) return cached;

  const label = getAccountAuthKind(row);
  const value = getAccountAuthValue(row);
  const icon = iconByKind[getAccountAuthIconKind(row)] || User;

  const result = { label, value, icon };
  authTagCache.value.set(row.id, result);
  return result;
}

</script>

<style scoped lang="scss">
.add-row {
  margin-top: 4px;
}

.auth-id-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  white-space: nowrap;

  .auth-id-tag {
    flex: 0 0 auto;
    height: 24px;
    padding: 0 8px;
    border-radius: 6px;
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    font-size: 12px;
    line-height: 20px;
    color: var(--el-color-primary);
    border: 1px solid var(--el-color-primary);


    .auth-id-icon {
      display: inline-flex;
      color: var(--el-color-primary);
    }
  }

  .auth-id-value {
    flex: 1;
    min-width: 0;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #606266;
    font-size: 16px;
    line-height: 22px;
  }
}

.user-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.user-option__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-status-cell {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
