<template>
  <div class="page-container">
    <h2 class="page-title">菜单管理</h2>
    <div class="page-card" ref="pageCardRef">
      <div ref="tableTopRef">
        <el-form :model="queryParams" @submit.prevent="handleSearch">
          <el-row :gutter="20">
            <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
              <el-form-item prop="menuName" label="菜单名称">
                <el-input v-model="queryParams.menuName" placeholder="请输入菜单名称" clearable />
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
                <el-select
                  v-model="queryParams.filterApp"
                  filterable
                  placeholder="请选择所属应用"
                  style="width: 100%"
                >
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
              </el-col>
              <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6" class="add-row">
                <el-button type="primary" plain v-permission="PERMS.MENU.ADD" @click="handleAdd()">
                  新增菜单
                </el-button>
                <el-button style="margin-left: 12px" @click="handleExpandAll">展开</el-button>
                <el-button @click="handleCollapseAll">收起</el-button>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>

      <MenuTreeTable
        ref="menuTreeTableRef"
        :data="filteredMenuData"
        :loading="loading"
        :raw-app-list="rawAppList"
        :max-height="tableMaxHeight"
        :app-options="appOptions"
        @add-child="handleAdd($event)"
        @associate-api="openAssociateApiDialog"
        @edit="handleEdit($event)"
        @delete="handleDelete($event)"
      />
    </div>
  </div>

  <MenuFormDialog
    v-model:visible="dialogVisible"
    v-model:permission-suffix="permissionSuffix"
    :title="dialogTitle"
    :is-edit="isEdit"
    :show-type-field="isAddChild || isEdit"
    :form="formData"
    :permission-input-mode="permissionInputMode"
    :app-options="appOptions"
    :rules="rules"
    :loading="submitLoading"
    :current-app-prefix="currentAppPrefix"
    :current-permission-prefix="currentPermissionPrefix"
    @submit="submitForm"
    @close="onDialogClose"
  />

  <MenuApiAssociateDialog
    v-model="associateApiVisible"
    :menu="currentApiMenu"
    :app-options="appOptions"
    @saved="handleAssociateApiSaved"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import type { Menu } from '@/api/menu';
  import { PERMS } from '@/constants/permissions';
  import { useElTableAutoMaxHeight } from '@/hooks/useElTableAutoMaxHeight';
  import MenuFormDialog from './components/MenuFormDialog.vue';
  import MenuApiAssociateDialog from './components/MenuApiAssociateDialog.vue';
  import MenuTreeTable from './components/MenuTreeTable.vue';
  import MenuIcon from '@/components/MenuIcon.vue';
  import { useMenuList } from './useMenuList';
  import { useMenuForm } from './useMenuForm';

  const pageCardRef = ref<HTMLElement | null>(null);
  const tableTopRef = ref<HTMLElement | null>(null);
  const { tableMaxHeight } = useElTableAutoMaxHeight({
    containerRef: pageCardRef,
    subtractRefs: [tableTopRef],
    extraOffset: 24
  });

  const menuTreeTableRef = ref<{
    expandAll: () => void;
    collapseAll: () => void;
  } | null>(null);
  const associateApiVisible = ref(false);
  const currentApiMenu = ref<Menu | null>(null);

  const {
    loading,
    menuData,
    appOptions,
    rawAppList,
    queryParams,
    filteredMenuData,
    fetchData,
    handleSearch,
    resetQuery
  } = useMenuList();

  const {
    isEdit,
    isAddChild,
    dialogVisible,
    dialogTitle,
    submitLoading,
    formData,
    permissionSuffix,
    permissionInputMode,
    rules,
    currentAppPrefix,
    currentPermissionPrefix,
    handleAdd,
    handleEdit,
    handleDelete,
    submitForm,
    onDialogClose
  } = useMenuForm(menuData, queryParams, fetchData, rawAppList);

  function handleExpandAll() {
    menuTreeTableRef.value?.expandAll();
  }

  function handleCollapseAll() {
    menuTreeTableRef.value?.collapseAll();
  }

  function openAssociateApiDialog(row: Menu) {
    currentApiMenu.value = row;
    associateApiVisible.value = true;
  }

  async function handleAssociateApiSaved() {
    await fetchData();
  }

  const getAppIconByValue = (value: string) =>
    appOptions.value.find((item) => item.value === value)?.iconName || '';
</script>

<style scoped>
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
