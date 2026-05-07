<template>
  <div class="page-container">
    <h2 class="page-title">{{ pageTitle }}</h2>
    <div class="page-card" ref="pageCardRef">
      <div ref="tableTopRef">
        <el-form :model="queryParams" @submit.prevent="fetchData">
          <el-row :gutter="20">
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="应用名称" prop="searchName">
                <el-input v-model="queryParams.searchName" placeholder="请输入应用名称" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 100%">
                  <el-option label="已上架" value="1">
                    <StatusTag status-key="APP_PUBLISHED" source="workflow" variant="outline" />
                  </el-option>
                  <el-option label="未上架" value="0">
                    <StatusTag status-key="APP_UNPUBLISHED" source="workflow" variant="outline" />
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="24" :sm="24" :md="12" :lg="8" :xl="4" class="query-btns">
              <el-button type="primary" @click="fetchData">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-col>
          </el-row>
        </el-form>
        <div class="add-row">
          <el-button type="primary" plain v-permission="PERMS.APP.ADD" @click="handleAdd">
            新增
          </el-button>
        </div>
      </div>
      <el-table class="page-table page-table--respect-column-align" :data="tableData" border style="width: 100%"
        v-loading="loading" :max-height="tableMaxHeight">
        <template #empty>
          <TableEmpty />
        </template>
        <el-table-column type="index" label="序号" width="60" align="left" header-align="left" />
        <el-table-column prop="name" label="应用名称" min-width="120" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column prop="shortName" label="应用简称" min-width="130" align="left" header-align="left"
          show-overflow-tooltip>
          <template #default="{ row }">
            <span class="short-name-cell">
              <MenuIcon :icon="row.iconName || ''" class="short-name-icon" />
              <span>{{ row.shortName || '-' }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="应用编码" width="160" align="left" header-align="left" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.code || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="isPlatformCategory" prop="activeRule" label="路由" min-width="160" align="left"
          header-align="left" show-overflow-tooltip />
        <el-table-column v-if="isPlatformCategory" prop="entry" label="服务地址" min-width="220" align="left"
          header-align="left" show-overflow-tooltip />
        <el-table-column v-else prop="entry" label="链接" min-width="220" align="left" header-align="left"
          show-overflow-tooltip />
        <el-table-column v-if="isPlatformCategory" prop="category" label="应用类型" width="160" align="left"
          header-align="left">
          <template #default="{ row }">
            {{ formatAppType(row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="140" align="center" header-align="center">
          <template #default="{ row }">
            <OpPopSwitch v-permission="PERMS.APP.EDIT" :model-value="normalizeStatus(row.status) === 1"
              :title="appToggleTitle(row)" :width="280"
              @confirm="handleToggleStatus(row, normalizeStatus(row.status) !== 1)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="260" align="left" header-align="left" />
        <el-table-column label="操作" width="180" fixed="right" align="left" header-align="left">
          <template #default="scope">
            <el-button v-permission="PERMS.APP.EDIT" link type="primary" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-popconfirm title="确认删除该应用配置吗?" width="240" confirm-button-text="确定" cancel-button-text="取消"
              :icon="WarningFilled" icon-color="#E6A23C" @confirm="handleDelete(scope.row)">
              <template #reference>
                <el-button v-permission="PERMS.APP.DEL" link type="danger">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>

  <AppFormDialog v-model="dialogVisible" :title="dialogTitle" :category="category" :form="formData" :rules="rules"
    :loading="submitLoading" @submit="submitForm" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { WarningFilled } from '@element-plus/icons-vue';
import { PERMS } from '@/constants/permissions';
import OpPopSwitch from '@/components/OpPopSwitch.vue';
import StatusTag from '@/components/StatusTag.vue';
import { updateApp, type AppCategory, type MicroApp } from '@/api/app';
import MenuIcon from '@/components/MenuIcon.vue';
import { useElTableAutoMaxHeight } from '@/hooks/useElTableAutoMaxHeight';
import AppFormDialog from './AppFormDialog.vue';
import { useAppList } from '../useAppList';
import { useAppForm } from '../useAppForm';
import { useUserStore } from '@/store/user';

const props = defineProps<{
  pageTitle: string;
  category: AppCategory;
}>();
const userStore = useUserStore();

const pageCardRef = ref<HTMLElement | null>(null);
const tableTopRef = ref<HTMLElement | null>(null);
const { tableMaxHeight } = useElTableAutoMaxHeight({
  containerRef: pageCardRef,
  subtractRefs: [tableTopRef],
  extraOffset: 24
});

const isPlatformCategory = computed(() => props.category === 'platform');

const { loading, queryParams, tableData, fetchData, resetQuery } = useAppList(props.category);

const {
  dialogVisible,
  dialogTitle,
  formData,
  rules,
  submitLoading,
  handleAdd,
  handleEdit,
  submitForm,
  handleDelete
} = useAppForm(fetchData, props.category);

const formatAppType = (category?: AppCategory) => {
  if (category === 'sso') return '单点应用';
  if (category === 'external') return '外部应用';
  return '平台应用';
};

const normalizeStatus = (status: number | string | undefined) => {
  const value = Number(status);
  return value === 1 ? 1 : value === 0 ? 0 : -1;
};

const appToggleTitle = (row: MicroApp) => {
  const onShelf = normalizeStatus(row.status) === 1;
  return onShelf ? `确认下架应用「${row.name}」吗？` : `确认上架应用「${row.name}」吗？`;
};

const handleToggleStatus = async (row: MicroApp, nextEnabled: boolean) => {
  if (row.id == null) return;
  const nextStatus = nextEnabled ? 1 : 0;
  await updateApp(row.id!, { ...row, status: nextStatus });
  ElMessage.success(nextStatus === 1 ? '上架成功' : '下架成功');
  await fetchData();
  await userStore.refreshAndSync();
};
</script>

<style scoped>
.short-name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.short-name-icon :deep(.menu-icon-wrapper) {
  width: 14px !important;
  font-size: 14px !important;
  margin-right: 0 !important;
}

.short-name-icon :deep(.custom-svg-icon) {
  width: 1em;
  height: 1em;
}
</style>
