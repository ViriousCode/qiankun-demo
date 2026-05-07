<template>
  <div class="page-container" v-loading="loading">
    <h2 class="page-title">我的应用</h2>
    <div class="page-card">
      <AppsSection
        title="工作台展示的应用"
        :apps="workbenchApps"
        :edit-mode="editMode"
        section-type="my"
        @app-click="(item) => handleAppClick(item, 'my')"
        @reorder-my="reorderWorkbenchApps"
      >
        <template #head-action>
          <el-button type="primary" link @click="toggleEditMode">
            {{ editMode ? '完成' : '编辑' }}
          </el-button>
        </template>
      </AppsSection>

      <AppsSection
        title="所有应用"
        :apps="allApps"
        :added-keys="workbenchAppKeys"
        :edit-mode="editMode"
        section-type="all"
        @app-click="(item) => handleAppClick(item, 'all')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppsSection from './components/AppsSection.vue';
  import { useProfileAppsList } from './useProfileAppsList';

  const {
    loading,
    editMode,
    workbenchApps,
    allApps,
    workbenchAppKeys,
    toggleEditMode,
    handleAppClick,
    reorderWorkbenchApps
  } = useProfileAppsList();
</script>

<style scoped lang="scss"></style>
