<template>
  <el-dialog
    :model-value="modelValue"
    title="分配权限"
    width="800px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="perm-meta">
      <div class="perm-meta-item">
        <span class="perm-meta-label">当前租户：</span>
        <span class="perm-meta-value">{{ tenantName || '-' }}</span>
      </div>
      <div class="perm-meta-item">
        <span class="perm-meta-label">当前角色：</span>
        <span class="perm-meta-value">
          {{ roleName || '-' }}
          <span v-if="roleCode" class="perm-meta-sub">（{{ roleCode }}）</span>
        </span>
      </div>
    </div>
    <div class="perm-toolbar">
      <div class="perm-toolbar-left">
        <div class="perm-app-select">
          <el-select
            :model-value="appFilter"
            placeholder="请选择应用"
            style="width: 160px"
            @update:model-value="onAppFilterUpdate"
          >
            <el-option
              v-for="o in appFilterOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
          <el-tooltip placement="top" trigger="hover" content="保存只针对选中应用做修改">
            <el-icon class="perm-app-hint-icon" tabindex="-1">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
        <el-input
          v-model="permFilterText"
          placeholder="请输入菜单名称/权限标识"
          clearable
          prefix-icon="Search"
        />
      </div>
      <div class="perm-toolbar-right">
        <span class="perm-toolbar-label">父子节点不联动</span>
        <el-switch
          :model-value="checkStrictly"
          :active-value="true"
          :inactive-value="false"
          @update:model-value="emit('update:checkStrictly', Boolean($event))"
        />
      </div>
    </div>
    <el-tree
      ref="treeRef"
      class="perm-tree"
      :data="permissionData"
      :props="{ label: 'title', children: 'children' }"
      :filter-node-method="filterPermNode"
      show-checkbox
      node-key="id"
      :check-strictly="checkStrictly"
      default-expand-all
    >
      <template #default="{ data }">
        <div class="perm-node">
          <span class="perm-node-title">{{ data.title }}</span>
          <span class="perm-node-code">{{ data.permission || '' }}</span>
        </div>
      </template>
    </el-tree>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { nextTick, ref, watch } from 'vue';
  import { QuestionFilled } from '@element-plus/icons-vue';
  import type { ElTree } from 'element-plus';

  const props = defineProps<{
    modelValue: boolean;
    tenantName: string;
    roleName: string;
    roleCode: string;
    permissionData: any[];
    appFilter: string;
    appFilterOptions: { label: string; value: string }[];
    checkStrictly: boolean;
    initialCheckedIds: number[];
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'update:appFilter': [value: string];
    'update:checkStrictly': [value: boolean];
    'app-filter-change': [];
    save: [payload: { checkedKeys: (string | number)[]; halfCheckedKeys: (string | number)[] }];
  }>();

  const treeRef = ref<InstanceType<typeof ElTree>>();
  const permFilterText = ref('');

  const filterPermNode = (value: string, data: any) => {
    const v = String(value || '')
      .trim()
      .toLowerCase();
    if (!v) return true;
    const title = String(data?.title || '').toLowerCase();
    const perm = String(data?.permission || '').toLowerCase();
    return title.includes(v) || perm.includes(v);
  };

  const getLeafKeys = (tree: any[], targetIds: number[]) => {
    const leafKeys: number[] = [];
    const traverse = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (!node.children || node.children.length === 0) {
          if (targetIds.includes(node.id)) leafKeys.push(node.id);
        } else {
          traverse(node.children);
        }
      });
    };
    traverse(tree);
    return leafKeys;
  };

  const collectAllNodeIds = (tree: any[]): Set<number> => {
    const ids = new Set<number>();
    const traverse = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (node.id != null) ids.add(node.id);
        if (node.children?.length) traverse(node.children);
      });
    };
    traverse(tree);
    return ids;
  };

  const applyCheckedKeys = () => {
    const el = treeRef.value;
    if (!el || !props.modelValue) return;
    const shownTree = props.permissionData || [];
    const selected = props.initialCheckedIds || [];
    if (props.checkStrictly) {
      const idSet = collectAllNodeIds(shownTree);
      const toCheck = selected.filter((id) => idSet.has(id));
      el.setCheckedKeys(toCheck);
    } else {
      const leafKeys = getLeafKeys(shownTree, selected);
      el.setCheckedKeys(leafKeys);
    }
  };

  watch(
    () => permFilterText.value,
    (v) => {
      treeRef.value?.filter(v);
    }
  );

  watch(
    () => props.modelValue,
    (open) => {
      if (open) {
        permFilterText.value = '';
        nextTick(() => {
          treeRef.value?.filter('');
          applyCheckedKeys();
        });
      }
    }
  );

  watch(
    () => [props.permissionData, props.checkStrictly, props.initialCheckedIds] as const,
    () => {
      if (!props.modelValue) return;
      nextTick(() => {
        treeRef.value?.filter(permFilterText.value);
        applyCheckedKeys();
      });
    },
    { deep: true }
  );

  const onAppFilterUpdate = (v: string) => {
    emit('update:appFilter', v);
    emit('app-filter-change');
  };

  const handleSave = () => {
    const el = treeRef.value;
    if (!el) return;
    emit('save', {
      checkedKeys: el.getCheckedKeys(),
      halfCheckedKeys: el.getHalfCheckedKeys()
    });
  };
</script>

<style scoped>
  .perm-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .perm-meta {
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

  .perm-meta-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .perm-meta-label {
    flex: none;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .perm-meta-value {
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-regular);
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .perm-meta-sub {
    font-weight: 400;
    color: var(--el-text-color-secondary);
  }

  .perm-toolbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .perm-app-select {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: none;
  }

  .perm-app-hint-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    cursor: default;
    outline: none;
  }

  .perm-toolbar-left :deep(.el-input) {
    flex: 1;
    min-width: 0;
  }

  .perm-toolbar-right {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }

  .perm-toolbar-label {
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .perm-tree {
    max-height: 420px;
    overflow: auto;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    padding: 8px 6px;
  }

  .perm-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding-right: 8px;
  }

  .perm-node-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .perm-node-code {
    flex: none;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
