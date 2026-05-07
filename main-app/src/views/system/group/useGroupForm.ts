import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormRules } from 'element-plus';
import {
  addSystemGroup,
  updateSystemGroup,
  deleteSystemGroup,
  type SystemGroup
} from '@/api/systemGroup';
import { GROUP_RULES } from './constants';
import type { GroupFormModel } from './components/GroupFormDialog.vue';
import { useUserStore } from '@/store/user';

export function useGroupForm(options: {
  fetchData: () => Promise<void>;
  resolveCurrentTenantId: () => number | null;
}) {
  const { fetchData, resolveCurrentTenantId } = options;
  const userStore = useUserStore();

  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const isEdit = ref(false);
  const submitLoading = ref(false);

  const form = reactive<GroupFormModel>({
    id: undefined,
    tenantId: null,
    groupName: '',
    groupCode: '',
    description: '',
    isDefault: false,
    status: 1
  });

  const rules: FormRules = GROUP_RULES;

  const handleAdd = () => {
    dialogTitle.value = '新增群组';
    isEdit.value = false;
    form.id = undefined;
    form.tenantId = resolveCurrentTenantId();
    form.groupName = '';
    form.groupCode = '';
    form.description = '';
    form.isDefault = false;
    form.status = 1;
    dialogVisible.value = true;
  };

  const handleEdit = (row: SystemGroup) => {
    dialogTitle.value = '编辑群组';
    isEdit.value = true;
    form.id = row.id;
    form.tenantId = resolveCurrentTenantId();
    form.groupName = String(row.groupName || '');
    form.groupCode = String((row as any).groupCode || '');
    form.description = String(row.description || '');
    form.isDefault = row.isDefault === true;
    form.status = row.status != null ? Number(row.status) : 1;
    dialogVisible.value = true;
  };

  const submitForm = async () => {
    submitLoading.value = true;
    try {
      const tenantId = resolveCurrentTenantId();
      if (tenantId == null) throw new Error('tenantId missing');

      const payload: Partial<SystemGroup> = {
        tenantId,
        groupName: form.groupName.trim(),
        groupCode: form.groupCode.trim(),
        description: (form.description ?? '').trim(),
        status: form.status
      };

      if (form.id != null) {
        // 编辑时不允许修改群组编码
        const { groupCode: _groupCode, status: _status, ...patch } = payload as any;
        await updateSystemGroup(form.id, patch);
      } else {
        await addSystemGroup(payload as SystemGroup);
      }

      ElMessage.success('保存成功');
      dialogVisible.value = false;
      await fetchData();
      await userStore.refreshAndSync();
    } finally {
      submitLoading.value = false;
    }
  };

  const handleDelete = async (row: SystemGroup) => {
    await deleteSystemGroup(row.id!);
    ElMessage.success('删除成功');
    await fetchData();
    await userStore.refreshAndSync();
  };

  const handleToggleEnable = async (row: SystemGroup, nextEnabled: boolean) => {
    const nextStatus = nextEnabled ? 1 : 0;
    const actionText = nextStatus === 1 ? '启用' : '禁用';
    await updateSystemGroup(row.id!, { status: nextStatus });
    ElMessage.success(`${actionText}成功`);
    await fetchData();
    await userStore.refreshAndSync();
  };

  return {
    dialogVisible,
    dialogTitle,
    isEdit,
    form,
    rules,
    submitLoading,
    handleAdd,
    handleEdit,
    submitForm,
    handleDelete,
    handleToggleEnable
  };
}
