<template>
  <el-table ref="tableRef" class="page-table page-table--respect-column-align" :data="data" v-loading="loading"
    style="width: 100%" :max-height="maxHeight" row-key="id" border default-expand-all
    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
    <template #empty>
      <TableEmpty />
    </template>
    <el-table-column type="index" label="序号" width="60" align="left" header-align="left" />
    <el-table-column prop="title" label="菜单名称" min-width="200" align="left" header-align="left">
      <template #default="{ row }">
        <span class="menu-name-cell">
          <MenuIcon v-if="row.icon && row.type !== 'button'" class="menu-name-icon" :icon="row.icon" :width="14"
            :height="14" />
          <span class="menu-name-text" :class="{ 'menu-name-text--button': row.type === 'button' }">
            {{ row.title }}
          </span>
        </span>
      </template>
    </el-table-column>
    <el-table-column label="菜单地址" min-width="160" align="left" header-align="left" show-overflow-tooltip>
      <template #default="{ row }">
        {{ displayPath(row) }}
      </template>
    </el-table-column>
    <el-table-column prop="permission" label="权限标识" width="240" align="left" header-align="left"
      show-overflow-tooltip />
    <el-table-column label="类型" min-width="100" align="center" header-align="center">
      <template #default="{ row }">
        <el-tag v-if="row.type === 'directory'" type="info">目录</el-tag>
        <el-tag v-else-if="row.type === 'menu'" type="success">菜单</el-tag>
        <el-tag v-else type="warning">按钮</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="菜单形式" min-width="100" align="left" header-align="left">
      <template #default="{ row }">
        <template v-if="row.type === 'button'">—</template>
        <template v-else>{{ row.menuForm === 'link' ? '链接' : '路由' }}</template>
      </template>
    </el-table-column>
    <el-table-column label="打开方式" min-width="100" align="left" header-align="left">
      <template #default="{ row }">
        <template v-if="row.type === 'button'">—</template>
        <template v-else>{{ row.openMode === 'other' ? '新页面' : '本页面' }}</template>
      </template>
    </el-table-column>
    <el-table-column label="是否展示" min-width="100" align="center" header-align="center">
      <template #default="{ row }">
        <StatusTag :status-key="row.hidden ? 0 : 1" source="menuVisible" variant="outline" />
      </template>
    </el-table-column>
    <el-table-column label="所属应用" min-width="100" align="center" header-align="center">
      <template #default="{ row }">
        <el-tag v-if="row.app === 'main'" type="primary">{{ appDisplayName(row.app) }}</el-tag>
        <el-tag v-else type="success">{{ appDisplayName(row.app) }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="sort" label="排序" width="80" align="center" header-align="center" />
    <el-table-column label="操作" width="280" fixed="right" align="left" header-align="left">
      <template #default="{ row }">
        <el-button v-if="row.type !== 'button'" v-permission="PERMS.MENU.ADD" link type="primary"
          @click="$emit('add-child', row)">
          新增下级
        </el-button>
        <el-button v-if="row.type !== 'directory'" v-permission="PERMS.MENU.EDIT" link type="primary"
          @click="$emit('associate-api', row)">
          关联API
        </el-button>
        <el-button v-permission="PERMS.MENU.EDIT" link type="primary" @click="$emit('edit', row)">
          编辑
        </el-button>
        <el-popconfirm title="确认删除该菜单及其子项吗?" width="260" confirm-button-text="确定" cancel-button-text="取消"
          :icon="WarningFilled" icon-color="#E6A23C" @confirm="$emit('delete', row)">
          <template #reference>
            <el-button v-permission="PERMS.MENU.DEL" link type="danger">
              删除
            </el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue';
import type { TableInstance } from 'element-plus';
import { WarningFilled } from '@element-plus/icons-vue';
import type { Menu } from '@/api/menu';
import { PERMS } from '@/constants/permissions';
import StatusTag from '@/components/StatusTag.vue';
import type { AppOption } from '../useMenuList';

const props = defineProps<{
  data: Menu[];
  loading: boolean;
  rawAppList: any[];
  appOptions: AppOption[];
  maxHeight?: number;
}>();

defineEmits<{
  'add-child': [row: Menu];
  'associate-api': [row: Menu];
  edit: [row: Menu];
  delete: [row: Menu];
}>();

const tableRef = ref<TableInstance>();

function appDisplayName(appKey?: string) {
  if (!appKey || appKey === 'main') return '主系统';
  const target = props.appOptions.find((opt) => opt.value === appKey);
  return target ? target.label : appKey;
}

function displayPath(row: Menu) {
  if (row.type === 'button') return '—';
  const p = row.path || '';
  if (!row.app || row.app === 'main') return p || '—';
  const targetApp = props.rawAppList.find((a: any) => a.name === row.app);
  const prefix = targetApp?.activeRule || '';
  if (!prefix) return p || '—';
  if (p === prefix || p.startsWith(`${prefix}/`)) return p;
  const normalized = `${prefix.replace(/\/+$/, '')}${p.startsWith('/') ? p : p ? `/${p}` : ''}`;
  return normalized || '—';
}

function walkNodes(nodes: Menu[], cb: (node: Menu) => void) {
  nodes.forEach((node) => {
    cb(node);
    if (node.children?.length) walkNodes(node.children, cb);
  });
}

async function expandAll() {
  await nextTick();
  if (!tableRef.value) return;
  walkNodes(props.data, (node) => {
    tableRef.value?.toggleRowExpansion(node, true);
  });
}

async function collapseAll() {
  await nextTick();
  if (!tableRef.value) return;
  walkNodes(props.data, (node) => {
    tableRef.value?.toggleRowExpansion(node, false);
  });
}

defineExpose({
  expandAll,
  collapseAll
});
</script>

<style scoped>
.menu-name-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 10px;
}

.menu-name-icon {
  flex-shrink: 0;
}

.menu-name-text--button {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  line-height: 1.5;
}
</style>
