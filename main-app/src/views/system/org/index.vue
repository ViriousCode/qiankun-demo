<template>
  <div class="page-container">
    <h2 class="page-title">组织管理</h2>
    <div class="page-card" ref="pageCardRef">
      <div ref="tableTopRef">
        <el-form :model="queryParams" @submit.prevent="fetchData">
          <el-row :gutter="20">
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="组织代码" prop="orgCode">
                <el-input v-model="queryParams.orgCode" placeholder="请输入组织代码" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="组织名称" prop="name">
                <el-input v-model="queryParams.name" placeholder="请输入组织名称" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="是否启用" prop="status">
                <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 100%">
                  <el-option :value="1" label="启用">
                    <StatusTag :status-key="1" variant="outline" />
                  </el-option>
                  <el-option :value="0" label="禁用">
                    <StatusTag :status-key="0" variant="outline" />
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6" class="query-btns">
              <el-button type="primary" @click="fetchData">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-col>
          </el-row>
          <div class="app-filter-panel">
            <el-row :gutter="20">
              <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-if="isAdmin">
                <el-select v-model="queryParams.tenantId" placeholder="请选择租户" clearable filterable style="width: 100%"
                  :loading="tenantLoading" @change="fetchData">
                  <el-option v-for="t in tenantOptions" :key="t.value" :label="t.label" :value="t.value" />
                </el-select>
              </el-col>
              <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6" class="add-row">
                <el-button type="primary" @click="() => handleAddSub()" v-permission="PERMS.ORG.ADD" plain>
                  新增组织
                </el-button>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>
      <el-table class="page-table page-table--respect-column-align"
        :key="isAdmin ? (queryParams.tenantId ?? 'auto') : 'auto'" :data="tableData"
        :row-key="(row) => `${isAdmin ? (queryParams.tenantId ?? 'auto') : 'auto'}-${row.id}`" v-loading="loading"
        border default-expand-all :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :max-height="tableMaxHeight">
        <template #empty>
          <TableEmpty />
        </template>
        <el-table-column prop="orgCode" label="组织代码" width="220" align="left" header-align="left" />
        <el-table-column prop="name" label="组织名称" min-width="180" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column prop="updateTime" label="创建时间" width="280" align="left" header-align="left" />
        <el-table-column label="状态" width="110" align="center" header-align="center">
          <template #default="{ row }">
            <OpPopSwitch v-permission="PERMS.ORG.EDIT" :model-value="row.status === 1"
              :title="row.status === 1 ? '确认禁用该组织吗？' : '确认启用该组织吗？'" @confirm="toggleOrgEnable(row, row.status !== 1)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right" align="left" header-align="left">
          <template #default="{ row }">
            <div class="op-btns">
              <el-button link type="primary" @click="handleAddSub(row)" v-permission="PERMS.ORG.ADD">
                新增下级
              </el-button>
              <el-button link type="primary" @click="handlePersonnel(row)" v-permission="PERMS.ORG.EDIT">
                配置用户
              </el-button>
              <el-button link type="primary" @click="handleEdit(row)" v-permission="PERMS.ORG.EDIT">
                编辑
              </el-button>
              <el-popconfirm title="确认删除该组织（含子组织）吗？" width="260" confirm-button-text="确定" cancel-button-text="取消"
                :icon="WarningFilled" icon-color="#E6A23C" @confirm="handleDelete(row)">
                <template #reference>
                  <el-button link type="danger" v-permission="PERMS.ORG.DEL">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>

  <OrgFormDialog v-model="orgDialogVisible" :title="orgDialogTitle" :form="orgForm" :rules="orgRules"
    :parent-org-name="parentOrgName" :org-level-label="orgLevelLabel" :loading="orgSubmitLoading"
    @submit="submitOrgForm" />

  <PersonnelDialog v-model="personnelDialogVisible" v-model:user-ids="personnelForm.userIds"
    :personnel-org-name="personnelOrgName" :personnel-org-id="personnelOrgId" :user-options="userOptions"
    :loading="personnelSubmitLoading" @submit="submitPersonnelForm" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { WarningFilled } from '@element-plus/icons-vue';
import { PERMS } from '@/constants/permissions';
import OpPopSwitch from '@/components/OpPopSwitch.vue';
import StatusTag from '@/components/StatusTag.vue';
import { useElTableAutoMaxHeight } from '@/hooks/useElTableAutoMaxHeight';
import { getSystemTenantList, type SystemTenant } from '@/api/systemTenant';
import { updateOrgNode } from '@/api/systemOrg';
import OrgFormDialog from './components/OrgFormDialog.vue';
import PersonnelDialog from './components/PersonnelDialog.vue';
import { useOrgTree } from './useOrgTree';
import { useOrgForm } from './useOrgForm';
import { useOrgPersonnel } from './useOrgPersonnel';

const pageCardRef = ref<HTMLElement | null>(null);
const tableTopRef = ref<HTMLElement | null>(null);
const { tableMaxHeight } = useElTableAutoMaxHeight({
  containerRef: pageCardRef,
  subtractRefs: [tableTopRef],
  extraOffset: 24
});

const orgTree = useOrgTree();
const loading = orgTree.loading;
const tableData = orgTree.tableData;
const isAdmin = orgTree.isAdmin;
const queryParams = orgTree.queryParams as {
  orgCode: string;
  name: string;
  status: string | number;
  tenantId?: number | null;
};
const fetchData = orgTree.fetchData;
const resetQuery = orgTree.resetQuery;

const tenantLoading = ref(false);
const tenantOptions = ref<{ label: string; value: number }[]>([]);
const fetchTenantOptions = async () => {
  if (!isAdmin.value) return;
  tenantLoading.value = true;
  try {
    const res = await getSystemTenantList({ pageIndex: 1, pageSize: 1000, status: 1 });
    const list = res?.list ?? [];
    tenantOptions.value = list.map((t: SystemTenant) => ({ label: t.tenantName, value: t.id }));
    if (!queryParams.tenantId && tenantOptions.value.length) {
      queryParams.tenantId = tenantOptions.value[0]!.value;
      await fetchData();
    }
  } finally {
    tenantLoading.value = false;
  }
};

onMounted(() => {
  fetchTenantOptions();
});

const {
  orgDialogVisible,
  orgDialogTitle,
  orgForm,
  orgRules,
  parentOrgName,
  orgLevelLabel,
  orgSubmitLoading,
  handleAddSub,
  handleEdit,
  submitOrgForm,
  handleDelete
} = useOrgForm(tableData, fetchData);

const toggleOrgEnable = async (row: any, nextEnabled: boolean) => {
  const prevStatus = row?.status;
  const nextStatus = nextEnabled ? 1 : 0;
  row.status = nextStatus;
  try {
    await updateOrgNode(row.id, { status: nextStatus });
    ElMessage.success(`${nextEnabled ? '启用' : '禁用'}成功`);
    await fetchData();
  } catch (e) {
    row.status = prevStatus;
    ElMessage.error('操作失败，请稍后重试');
    throw e;
  }
};

const {
  personnelDialogVisible,
  personnelOrgId,
  personnelOrgName,
  personnelForm,
  userOptions,
  personnelSubmitLoading,
  handlePersonnel,
  submitPersonnelForm
} = useOrgPersonnel();
</script>

<style scoped lang="scss"></style>
