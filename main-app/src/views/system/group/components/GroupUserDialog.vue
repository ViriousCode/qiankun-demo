<template>
  <el-dialog :model-value="modelValue" title="授权账户" width="980px"
    @update:model-value="emit('update:modelValue', $event)">
    <el-alert class="top-alert" type="warning" :closable="false" show-icon title="仅展示当前租户下的用户；保存后会覆盖当前群组的授权账户配置。" />

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
        <span class="meta-value">{{ selectedUserIds.length }} 个</span>
      </div>
    </div>

    <div v-if="selectedUsers.length" class="selected-box">
      <span class="selected-box-label">已授权用户：</span>
      <div class="selected-tags">
        <el-tag v-for="u in selectedUsers" :key="String(u.id)" class="selected-tag" closable
          @close="removeSelected(Number(u.id))">
          {{ u.nickName || u.name }}
        </el-tag>
      </div>
    </div>

    <div class="toolbar">
      <el-input :model-value="keyword" placeholder="请输入姓名/昵称/手机号" clearable prefix-icon="Search"
        @update:model-value="emit('update:keyword', $event)" />
    </div>

    <el-table ref="tableRef" v-loading="loading" class="page-table page-table--respect-column-align" :data="userList"
      border table-layout="auto" @selection-change="onSelectionChange" :row-key="(row) => row.id">
      <template #empty>
        <TableEmpty />
      </template>
      <el-table-column type="selection" width="50" align="center" header-align="center" reserve-selection />
      <el-table-column type="index" label="序号" width="70" align="left" header-align="left" />
      <el-table-column prop="name" label="用户名称" min-width="140" align="left" header-align="left"
        show-overflow-tooltip />
      <el-table-column prop="nickName" label="昵称" min-width="140" align="left" header-align="left"
        show-overflow-tooltip />
      <el-table-column prop="authIdentifier" label="认证标识" min-width="180" align="left" header-align="left"
        show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" min-width="170" align="left" header-align="left"
        show-overflow-tooltip />
      <el-table-column label="状态" width="90" align="center" header-align="center">
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
import type { SystemUser } from '@/api/systemUser';
import type { ElTable } from 'element-plus';

const props = defineProps<{
  modelValue: boolean;
  tenantName: string;
  tenantId: number | null;
  groupName: string;
  groupCode: string;
  keyword: string;
  userListAll: SystemUser[];
  userList: SystemUser[];
  selectedUserIds: number[];
  loading: boolean;
  saving: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:keyword': [value: string];
  'update:selectedUserIds': [value: number[]];
  save: [];
}>();

const tableRef = ref<InstanceType<typeof ElTable>>();
const syncingSelection = ref(false);

const selectedUsers = computed(() => {
  const idSet = new Set(
    (props.selectedUserIds || []).map((x) => Number(x)).filter((n) => Number.isFinite(n))
  );
  const list = Array.isArray(props.userListAll) ? props.userListAll : [];
  const resolved = list
    .filter((u: any) => u?.id != null && idSet.has(Number(u.id)))
    .filter((u: any) =>
      props.tenantId == null
        ? true
        : Number(u?.tenantId ?? props.tenantId) === Number(props.tenantId)
    );
  const map = new Map(resolved.map((u: any) => [Number(u.id), u]));
  return (props.selectedUserIds || [])
    .map((id) => map.get(Number(id)))
    .filter(Boolean) as SystemUser[];
});

function onSelectionChange(rows: SystemUser[]) {
  if (syncingSelection.value) return;
  const ids = (rows || []).map((r) => Number(r?.id)).filter((n) => Number.isFinite(n));
  emit('update:selectedUserIds', ids);
}

function removeSelected(id: number) {
  const next = (props.selectedUserIds || []).filter((x) => Number(x) !== Number(id));
  emit('update:selectedUserIds', next);
}

const applyTableSelection = async () => {
  const table = tableRef.value as any;
  if (!table) return;
  const idSet = new Set(
    (props.selectedUserIds || []).map((x) => Number(x)).filter((n) => Number.isFinite(n))
  );
  await nextTick();
  syncingSelection.value = true;
  try {
    table.clearSelection();
    (props.userList || []).forEach((row: any) => {
      if (row?.id != null && idSet.has(Number(row.id))) {
        table.toggleRowSelection(row, true);
      }
    });
  } finally {
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
  () => [props.modelValue, props.userList, props.selectedUserIds] as const,
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
  max-width: 260px;
}

.page-table {
  width: 100%;
}
</style>
