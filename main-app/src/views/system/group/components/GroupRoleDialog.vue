<template>
  <el-dialog :model-value="modelValue" title="配置角色" width="880px"
    @update:model-value="emit('update:modelValue', $event)">
    <el-alert class="top-alert" type="warning" :closable="false" show-icon title="仅展示当前租户下的角色；保存后会覆盖当前群组的角色配置。" />

    <div class="meta">
      <div class="meta-item">
        <span class="meta-label">当前租户：</span>
        <span class="meta-value">{{ tenantName || '-' }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">当前群组：</span>
        <span class="meta-value">
          {{ groupName || '-' }}
          <span v-if="groupCode" class="meta-sub">（{{ groupCode }}）</span>
        </span>
      </div>
      <div class="meta-item meta-right">
        <span class="meta-label">已选：</span>
        <span class="meta-value">{{ selectedRoleIds.length }} 个</span>
      </div>
    </div>

    <div v-if="selectedRoles.length" class="selected-box">
      <span class="selected-box-label">已配置角色：</span>
      <div class="selected-tags">
        <el-tag v-for="r in selectedRoles" :key="String(r.id)" class="selected-tag" closable
          @close="removeSelected(Number(r.id))">
          {{ r.roleName }}
        </el-tag>
      </div>
    </div>

    <div class="toolbar">
      <el-input :model-value="keyword" placeholder="请输入角色名称/编码" clearable prefix-icon="Search"
        @update:model-value="emit('update:keyword', $event)" />
    </div>

    <el-table ref="tableRef" v-loading="loading" class="page-table page-table--respect-column-align" :data="roleList"
      border table-layout="auto" @selection-change="onSelectionChange" :row-key="(row) => row.id">
      <template #empty>
        <TableEmpty />
      </template>
      <el-table-column type="selection" width="50" align="center" header-align="center" reserve-selection />
      <el-table-column type="index" label="序号" width="70" align="left" header-align="left" />
      <el-table-column prop="roleName" label="角色名称" min-width="140" align="left" header-align="left"
        show-overflow-tooltip />
      <el-table-column prop="roleCode" label="角色编码" min-width="140" align="left" header-align="left"
        show-overflow-tooltip />
      <el-table-column prop="description" label="描述" min-width="200" align="left" header-align="left"
        show-overflow-tooltip />
      <el-table-column label="状态" width="110" align="center" header-align="center">
        <template #default="{ row }">
          <el-tag :type="Number(row.status) === 1 ? 'success' : 'danger'">
            {{ Number(row.status) === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="emit('save')">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { Role } from '@/api/role';
import type { ElTable } from 'element-plus';

const props = defineProps<{
  modelValue: boolean;
  tenantName: string;
  tenantId: number | null;
  groupName: string;
  groupCode: string;
  keyword: string;
  roleListAll: Role[];
  roleList: Role[];
  selectedRoleIds: number[];
  loading: boolean;
  saving: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:keyword': [value: string];
  'update:selectedRoleIds': [value: number[]];
  save: [];
}>();

const tableRef = ref<InstanceType<typeof ElTable>>();
const syncingSelection = ref(false);

const selectedRoles = computed(() => {
  const idSet = new Set(
    (props.selectedRoleIds || []).map((x) => Number(x)).filter((n) => Number.isFinite(n))
  );
  const list = Array.isArray(props.roleListAll) ? props.roleListAll : [];
  const resolved = list
    .filter((r: any) => r?.id != null && idSet.has(Number(r.id)))
    .filter((r: any) =>
      props.tenantId == null
        ? true
        : Number(r?.tenantId ?? props.tenantId) === Number(props.tenantId)
    );
  // 保持与 selectedRoleIds 的顺序一致
  const map = new Map(resolved.map((r: any) => [Number(r.id), r]));
  return (props.selectedRoleIds || []).map((id) => map.get(Number(id))).filter(Boolean) as Role[];
});

function onSelectionChange(rows: Role[]) {
  if (syncingSelection.value) return;
  const ids = (rows || []).map((r) => Number(r?.id)).filter((n) => Number.isFinite(n));
  emit('update:selectedRoleIds', ids);
}

function removeSelected(id: number) {
  const next = (props.selectedRoleIds || []).filter((x) => Number(x) !== Number(id));
  emit('update:selectedRoleIds', next);
}

const applyTableSelection = async () => {
  const table = tableRef.value as any;
  if (!table) return;
  const idSet = new Set(
    (props.selectedRoleIds || []).map((x) => Number(x)).filter((n) => Number.isFinite(n))
  );
  await nextTick();
  syncingSelection.value = true;
  try {
    table.clearSelection();
    (props.roleList || []).forEach((row: any) => {
      if (row?.id != null && idSet.has(Number(row.id))) {
        table.toggleRowSelection(row, true);
      }
    });
  } finally {
    // 让 element-plus selection-change 事件先跑完再解锁，避免递归
    setTimeout(() => {
      syncingSelection.value = false;
    }, 0);
  }
};

watch(
  () => props.modelValue,
  (open) => {
    if (open) emit('update:keyword', '');
  }
);

watch(
  () => [props.modelValue, props.roleList, props.selectedRoleIds] as const,
  ([open]) => {
    if (!open) return;
    applyTableSelection();
  },
  { deep: true }
);
</script>

<style scoped>
.top-alert {
  margin-bottom: 10px;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 18px;
  padding: 6px 10px;
  margin-bottom: 10px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  color: var(--el-text-color-regular);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.meta-right {
  margin-left: auto;
}

.meta-label {
  flex: none;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.meta-value {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-sub {
  font-weight: 400;
  color: var(--el-text-color-secondary);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.selected-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  margin: 0 0 10px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.selected-box-label {
  flex: none;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 22px;
  padding-top: 2px;
}

.selected-tag {
  max-width: 220px;
}

.page-table {
  width: 100%;
}
</style>
