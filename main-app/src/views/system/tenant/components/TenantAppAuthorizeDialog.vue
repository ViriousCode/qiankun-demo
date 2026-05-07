<template>
  <el-dialog :model-value="modelValue" title="授权应用" width="920px" @update:model-value="emitVisible">
    <div class="dialog-header">
      <div class="tenant-info">
        <div class="tenant-name">{{ tenant?.tenantName || '-' }}</div>
      </div>
      <div class="selected-count">已选 {{ selectedAppIds.length }} 个应用</div>
    </div>

    <div class="query-row">
      <el-input :model-value="searchName" placeholder="请输入应用名称" clearable style="width: 260px"
        @update:model-value="emitSearch" />
    </div>

    <div v-loading="loading" class="apps-container">
      <el-checkbox-group :model-value="selectedAppIds" @update:model-value="emitSelected">
        <div class="app-section">
          <div class="section-header">
            <div class="section-title">平台应用</div>
            <div class="section-actions">
              <el-button link type="primary" @click="toggleAll('platform', true)">全选</el-button>
              <el-button link type="primary" @click="toggleAll('platform', false)">清空</el-button>
            </div>
          </div>
          <div class="cards-grid">
            <el-checkbox v-for="app in platformApps" :key="app.id" :label="Number(app.id)" class="app-card-checkbox"
              :class="{ selected: isSelected(app.id) }">
              <div class="card-body">
                <MenuIcon :icon="app.iconName || ''" class="card-icon" />
                <div class="card-main">
                  <div class="card-title-row">
                    <span class="card-title">{{ app.shortName || app.name }}</span>
                    <el-tag :type="Number(app.status) === 1 ? 'success' : 'info'" effect="plain">
                      {{ Number(app.status) === 1 ? '已上架' : '未上架' }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-checkbox>
            <div v-if="platformApps.length === 0" class="empty-hint">暂无数据</div>
          </div>
        </div>

        <div class="app-section">
          <div class="section-header">
            <div class="section-title">单点应用</div>
            <div class="section-actions">
              <el-button link type="primary" @click="toggleAll('sso', true)">全选</el-button>
              <el-button link type="primary" @click="toggleAll('sso', false)">清空</el-button>
            </div>
          </div>
          <div class="cards-grid">
            <el-checkbox v-for="app in ssoApps" :key="app.id" :label="Number(app.id)" class="app-card-checkbox"
              :class="{ selected: isSelected(app.id) }">
              <div class="card-body">
                <MenuIcon :icon="app.iconName || ''" class="card-icon" />
                <div class="card-main">
                  <div class="card-title-row">
                    <span class="card-title">{{ app.shortName || app.name }}</span>
                    <el-tag :type="Number(app.status) === 1 ? 'success' : 'info'" effect="plain">
                      {{ Number(app.status) === 1 ? '已上架' : '未上架' }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-checkbox>
            <div v-if="ssoApps.length === 0" class="empty-hint">暂无数据</div>
          </div>
        </div>

        <div class="app-section">
          <div class="section-header">
            <div class="section-title">外部应用</div>
            <div class="section-actions">
              <el-button link type="primary" @click="toggleAll('external', true)">全选</el-button>
              <el-button link type="primary" @click="toggleAll('external', false)">清空</el-button>
            </div>
          </div>
          <div class="cards-grid">
            <el-checkbox v-for="app in externalApps" :key="app.id" :label="Number(app.id)" class="app-card-checkbox"
              :class="{ selected: isSelected(app.id) }">
              <div class="card-body">
                <MenuIcon :icon="app.iconName || ''" class="card-icon" />
                <div class="card-main">
                  <div class="card-title-row">
                    <span class="card-title">{{ app.shortName || app.name }}</span>
                    <el-tag :type="Number(app.status) === 1 ? 'success' : 'info'" effect="plain">
                      {{ Number(app.status) === 1 ? '已上架' : '未上架' }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-checkbox>
            <div v-if="externalApps.length === 0" class="empty-hint">暂无数据</div>
          </div>
        </div>
      </el-checkbox-group>
    </div>

    <template #footer>
      <el-button @click="emitVisible(false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="$emit('save')">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AppCategory, MicroApp } from '@/api/app';
import type { SystemTenant } from '@/api/systemTenant';
import MenuIcon from '@/components/MenuIcon.vue';

const props = defineProps<{
  modelValue: boolean;
  tenant: SystemTenant | null;
  searchName: string;
  appsByCategory: Record<AppCategory, MicroApp[]>;
  loading: boolean;
  saving: boolean;
  selectedAppIds: number[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:searchName': [value: string];
  'update:selectedAppIds': [value: number[]];
  save: [];
}>();

function emitVisible(value: boolean) {
  emit('update:modelValue', value);
}

function emitSearch(value: string) {
  emit('update:searchName', value);
}

function emitSelected(value: Array<string | number>) {
  const ids = (value || []).map((v) => Number(v)).filter((n) => Number.isFinite(n));
  emit('update:selectedAppIds', ids);
}

const platformApps = computed(() => props.appsByCategory?.platform || []);
const ssoApps = computed(() => props.appsByCategory?.sso || []);
const externalApps = computed(() => props.appsByCategory?.external || []);

const selectedSet = computed(() => new Set((props.selectedAppIds || []).map((x) => Number(x))));
function isSelected(id: unknown) {
  const num = Number(id);
  if (!Number.isFinite(num)) return false;
  return selectedSet.value.has(num);
}

function toggleAll(cat: AppCategory, checked: boolean) {
  const current = new Set((props.selectedAppIds || []).map((x) => Number(x)));
  const target = (props.appsByCategory?.[cat] || [])
    .map((a) => Number(a.id))
    .filter((id) => Number.isFinite(id));
  if (checked) target.forEach((id) => current.add(id));
  else target.forEach((id) => current.delete(id));
  emit('update:selectedAppIds', [...current]);
}
</script>

<style scoped>
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.tenant-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.tenant-meta {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.selected-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding-top: 2px;
}

.query-row {
  display: flex;
  justify-content: flex-end;
  margin: 8px 0 10px;
}

.apps-container {
  max-height: 520px;
  overflow: auto;
  padding-right: 2px;
}

.app-section {
  margin-bottom: 14px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 6px 0 8px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.app-card-checkbox {
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 10px 10px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  width: 100%;
  margin-right: 0;
  min-height: 42px;
}

.app-card-checkbox.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--el-color-primary) 35%, transparent);
}

.app-card-checkbox :deep(.el-checkbox__label) {
  padding-left: 10px;
  width: 100%;
}

.app-card-checkbox :deep(.el-checkbox__input) {
  align-self: center;
  margin-top: 0;
}

.card-body {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.card-icon :deep(.menu-icon-wrapper) {
  width: 22px !important;
  font-size: 22px !important;
  margin-right: 0 !important;
}

.card-icon :deep(.custom-svg-icon) {
  width: 1em;
  height: 1em;
}

.card-main {
  min-width: 0;
  flex: 1;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-hint {
  grid-column: 1 / -1;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  padding: 6px 0;
}
</style>
