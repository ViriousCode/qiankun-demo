import { ref, reactive, computed, type Ref } from 'vue';
import { ElMessage } from 'element-plus';
import { addOrgNode, updateOrgNode, deleteOrgNode, type OrgNode } from '@/api/systemOrg';
import { LEVEL_NAMES, ORG_RULES } from './constants';
import type { FormRules } from 'element-plus';

export function useOrgForm(tableData: Ref<OrgNode[]>, fetchData: () => Promise<void>) {
  const orgDialogVisible = ref(false);
  const orgDialogTitle = ref('新增组织');
  const orgSubmitLoading = ref(false);
  const orgForm = reactive({
    id: undefined as number | undefined,
    parentId: null as number | null,
    orgCode: '',
    name: '',
    leader: '',
    phone: '',
    status: 1
  });
  const orgRules: FormRules = ORG_RULES;

  const parentOrgName = computed(() => {
    if (orgForm.parentId == null) return '无（一级）';
    const find = (nodes: OrgNode[], id: number): string => {
      for (const n of nodes) {
        if (n.id === id) return n.name || '';
        if (n.children?.length) {
          const t = find(n.children, id);
          if (t) return t;
        }
      }
      return '';
    };
    return find(tableData.value, orgForm.parentId) || '-';
  });

  function getNodeDepth(nodes: OrgNode[], nodeId: number, depth = 1): number {
    for (const n of nodes) {
      if (n.id === nodeId) return depth;
      if (n.children?.length) {
        const d = getNodeDepth(n.children, nodeId, depth + 1);
        if (d > 0) return d;
      }
    }
    return 0;
  }

  const orgLevelLabel = computed(() => {
    if (orgForm.id != null) {
      const d = getNodeDepth(tableData.value, orgForm.id);
      return d > 0 ? LEVEL_NAMES[d - 1] || `${d}级` : '-';
    }
    if (orgForm.parentId == null) return '一级';
    const parentDepth = getNodeDepth(tableData.value, orgForm.parentId);
    const newDepth = parentDepth + 1;
    return LEVEL_NAMES[newDepth - 1] || `${newDepth}级`;
  });

  const handleAddSub = (row?: OrgNode) => {
    orgDialogTitle.value = '新增组织';
    orgForm.id = undefined;
    // 顶部“新增组织”默认挂到根组织下
    const rootId = tableData.value?.[0]?.id ?? null;
    orgForm.parentId = row ? row.id : rootId;
    orgForm.orgCode = '';
    orgForm.name = '';
    orgForm.leader = '';
    orgForm.phone = '';
    orgForm.status = 1;
    orgDialogVisible.value = true;
  };

  const handleEdit = (row: OrgNode) => {
    orgDialogTitle.value = '编辑组织';
    orgForm.id = row.id;
    orgForm.parentId = row.parentId ?? null;
    orgForm.orgCode = row.orgCode || '';
    orgForm.name = row.name || '';
    orgForm.leader = row.leader || '';
    orgForm.phone = row.phone || '';
    orgForm.status = row.status ?? 1;
    orgDialogVisible.value = true;
  };

  const submitOrgForm = async () => {
    orgSubmitLoading.value = true;
    try {
      if (orgForm.id != null) {
        await updateOrgNode(orgForm.id, {
          name: orgForm.name,
          orgCode: orgForm.orgCode,
          leader: orgForm.leader,
          phone: orgForm.phone
        });
        ElMessage.success('修改成功');
      } else {
        await addOrgNode({
          parentId: orgForm.parentId,
          name: orgForm.name,
          orgCode: orgForm.orgCode || undefined,
          leader: orgForm.leader || undefined,
          phone: orgForm.phone || undefined,
          status: orgForm.status
        });
        ElMessage.success('新增成功');
      }
      orgDialogVisible.value = false;
      await fetchData();
    } finally {
      orgSubmitLoading.value = false;
    }
  };

  const handleDelete = async (row: OrgNode) => {
    await deleteOrgNode(row.id);
    ElMessage.success('删除成功');
    await fetchData();
  };

  return {
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
  };
}
