<template>
  <el-dialog
    :model-value="modelValue"
    title="关联API"
    width="1200px"
    @update:model-value="onVisibleChange"
  >
    <el-form label-width="76px" class="api-menu-info">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="菜单名称">
            <el-input :model-value="menu?.title || '-'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="类型">
            <el-input :model-value="menuTypeText(menu?.type)" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="所属应用">
            <el-input :model-value="menuAppText(menu)" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div class="api-selected-title">
      <span>已选 {{ selectedApiIds.length }} 个 API</span>
      <span class="api-selected-hint">支持关联跨应用 API，可按所属应用筛选</span>
    </div>
    <div class="api-selected-panel">
      <div class="api-selected-label">已关联API</div>
      <div class="api-selected-tags">
        <el-tag v-for="id in selectedApiIds" :key="id" effect="plain" class="api-selected-tag">
          {{ selectedApiLabel(id) }}
        </el-tag>
        <span v-if="selectedApiIds.length === 0" class="api-selected-empty">暂未关联</span>
      </div>
    </div>

    <el-form inline class="api-query-row">
      <el-form-item label="所属应用">
        <el-select v-model="apiQuery.appName" placeholder="全部" clearable style="width: 140px">
          <el-option label="全部" value="" />
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
          <el-option
            v-for="item in appOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <span class="app-option-cell">
              <MenuIcon v-if="item.iconName" :icon="item.iconName" class="app-option-icon" />
              <span>{{ item.label }}</span>
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="API名称">
        <el-input v-model="apiQuery.name" placeholder="请输入API名称" clearable />
      </el-form-item>
      <!-- <el-form-item label="接口路径">
        <el-input v-model="apiQuery.path" placeholder="请输入接口路径" clearable />
      </el-form-item> -->
      <el-form-item label="请求方式">
        <el-select v-model="apiQuery.method" placeholder="全部" clearable style="width: 120px">
          <el-option label="全部" value="" />
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
          <el-option label="PUT" value="PUT" />
          <el-option label="DELETE" value="DELETE" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="apiQuery.enabled" placeholder="全部" clearable style="width: 120px">
          <el-option label="全部" value="" />
          <el-option label="启用" :value="true">
            <StatusTag :status-key="1" variant="outline" />
          </el-option>
          <el-option label="禁用" :value="false">
            <StatusTag :status-key="0" variant="outline" />
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadApiOptions">查询</el-button>
        <el-button @click="resetApiQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
      ref="apiTableRef"
      class="page-table page-table--respect-column-align"
      :data="apiOptions"
      v-loading="apiLoading"
      border
      height="360px"
      row-key="id"
      @selection-change="onApiSelectionChange"
    >
      <template #empty>
        <TableEmpty />
      </template>
      <el-table-column type="selection" width="48" align="center" header-align="center" />
      <el-table-column type="index" label="序号" width="64" align="left" header-align="left" />
      <el-table-column
        prop="name"
        label="API名称"
        min-width="160"
        align="left"
        header-align="left"
        show-overflow-tooltip
      />
      <el-table-column
        prop="appName"
        label="所属应用"
        min-width="140"
        align="left"
        header-align="left"
        show-overflow-tooltip
      />
      <el-table-column
        prop="path"
        label="接口路径"
        min-width="220"
        align="left"
        header-align="left"
        show-overflow-tooltip
      />
      <el-table-column
        prop="method"
        label="请求方式"
        width="90"
        align="center"
        header-align="center"
      />
      <el-table-column
        prop="permissionCode"
        label="权限标识"
        min-width="220"
        align="left"
        header-align="left"
        show-overflow-tooltip
      />
      <el-table-column label="状态" width="80" align="center" header-align="center">
        <template #default="{ row }">
          <StatusTag :status-key="row.enabled ? 1 : 0" variant="outline" />
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="onVisibleChange(false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="saveAssociateApi">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { nextTick, reactive, ref, watch } from 'vue';
  import type { TableInstance } from 'element-plus';
  import { ElMessage } from 'element-plus';
  import StatusTag from '@/components/StatusTag.vue';
  import MenuIcon from '@/components/MenuIcon.vue';
  import { getApiList, type ApiItem, type ApiMethod } from '@/api/systemApi';
  import { updateMenu, type Menu } from '@/api/menu';
  import type { AppOption } from '../useMenuList';

  const props = defineProps<{
    modelValue: boolean;
    menu: Menu | null;
    appOptions: AppOption[];
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    saved: [];
  }>();

  const apiTableRef = ref<TableInstance>();
  const saving = ref(false);
  const apiLoading = ref(false);
  const apiOptions = ref<ApiItem[]>([]);
  const selectedApiIds = ref<number[]>([]);
  const apiQuery = reactive({
    appName: '',
    name: '',
    path: '',
    method: '',
    enabled: '' as '' | boolean
  });

  function onVisibleChange(value: boolean) {
    emit('update:modelValue', value);
  }

  function menuTypeText(type?: Menu['type']) {
    if (type === 'button') return '按钮';
    if (type === 'directory') return '目录';
    return '菜单';
  }

  function menuAppText(menu: Menu | null) {
    if (!menu?.app || menu.app === 'main') return '主系统';
    return props.appOptions.find((a) => a.value === menu.app)?.label || menu.app;
  }

  function selectedApiLabel(id: number) {
    const api = apiOptions.value.find((item) => item.id === id);
    if (!api) return `API #${id}`;
    return `${api.appName || '主系统'} ${api.method} ${api.name}`;
  }

  const getAppIconByValue = (value: string) =>
    props.appOptions.find((item) => item.value === value)?.iconName || '';

  async function loadApiOptions() {
    apiLoading.value = true;
    try {
      const queryAppName = apiQuery.appName === 'main' ? '主系统' : apiQuery.appName;
      const res = await getApiList({
        name: apiQuery.name || undefined,
        path: apiQuery.path || undefined,
        method: apiQuery.method as ApiMethod | undefined,
        appName: queryAppName || undefined,
        enabled: apiQuery.enabled === '' ? undefined : apiQuery.enabled,
        pageIndex: 1,
        pageSize: 500
      });
      apiOptions.value = res?.list || [];
      await nextTick();
      apiOptions.value.forEach((row) => {
        apiTableRef.value?.toggleRowSelection(row, selectedApiIds.value.includes(row.id));
      });
    } finally {
      apiLoading.value = false;
    }
  }

  function onApiSelectionChange(rows: ApiItem[]) {
    selectedApiIds.value = rows.map((row) => row.id);
  }

  function resetApiQuery() {
    apiQuery.appName = '';
    apiQuery.name = '';
    apiQuery.path = '';
    apiQuery.method = '';
    apiQuery.enabled = '';
    loadApiOptions();
  }

  async function saveAssociateApi() {
    if (!props.menu?.id) return;
    saving.value = true;
    try {
      await updateMenu(props.menu.id, { apiIds: [...selectedApiIds.value] });
      ElMessage.success('关联API已更新');
      emit('saved');
      onVisibleChange(false);
    } finally {
      saving.value = false;
    }
  }

  watch(
    () => props.modelValue,
    async (open) => {
      if (!open) return;
      selectedApiIds.value = Array.isArray(props.menu?.apiIds) ? [...props.menu!.apiIds!] : [];
      resetApiQuery();
    }
  );
</script>

<style scoped>
  .api-query-row {
    margin-bottom: 10px;
  }

  .api-menu-info {
    margin-bottom: 8px;
  }

  .api-selected-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 4px 0 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .api-selected-hint {
    color: var(--el-text-color-placeholder);
  }

  .api-selected-panel {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 10px;
    background: var(--el-fill-color-lighter);
  }

  .api-selected-label {
    font-size: 12px;
    color: var(--el-text-color-regular);
    margin-bottom: 8px;
  }

  .api-selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .api-selected-tag {
    max-width: 100%;
  }

  .api-selected-empty {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
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
