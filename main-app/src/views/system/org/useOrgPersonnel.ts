import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { getOrgPersonnel, updateOrgPersonnel, getOrgUserOptions } from '@/api/systemOrg';
import type { OrgNode } from '@/api/systemOrg';

export function useOrgPersonnel() {
  const personnelDialogVisible = ref(false);
  const personnelOrgId = ref(0);
  const personnelOrgName = ref('');
  const personnelSubmitLoading = ref(false);
  const personnelForm = reactive<{ userIds: number[] }>({ userIds: [] });
  const userOptions = ref<
    {
      id: number;
      name: string;
      nickName: string;
      orgId?: number | null;
      orgName?: string;
    }[]
  >([]);

  const handlePersonnel = async (row: OrgNode) => {
    personnelOrgId.value = row.id;
    personnelOrgName.value = row.name || '';
    try {
      const [personnelData, usersList] = await Promise.all([
        getOrgPersonnel(row.id),
        getOrgUserOptions()
      ]);
      personnelForm.userIds = Array.isArray(personnelData?.userIds) ? personnelData.userIds : [];
      userOptions.value = Array.isArray(usersList) ? usersList : [];
    } catch {
      personnelForm.userIds = [];
      userOptions.value = [];
    }
    personnelDialogVisible.value = true;
  };

  const submitPersonnelForm = async () => {
    personnelSubmitLoading.value = true;
    try {
      await updateOrgPersonnel(personnelOrgId.value, personnelForm.userIds);
      ElMessage.success('保存成功');
      personnelDialogVisible.value = false;
    } finally {
      personnelSubmitLoading.value = false;
    }
  };

  return {
    personnelDialogVisible,
    personnelOrgId,
    personnelOrgName,
    personnelForm,
    userOptions,
    personnelSubmitLoading,
    handlePersonnel,
    submitPersonnelForm
  };
}
