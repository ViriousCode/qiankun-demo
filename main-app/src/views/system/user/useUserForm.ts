import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormRules } from 'element-plus';
import {
  addSystemUser,
  updateSystemUser,
  deleteSystemUser,
  type SystemUser
} from '@/api/systemUser';
import { USER_RULES } from './constants';

export function useUserForm(fetchData: () => Promise<void>) {
  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const submitLoading = ref(false);
  const form = reactive({
    id: undefined as number | undefined,
    tenantId: undefined as number | undefined,
    name: '',
    nickName: '',
    gender: 'male' as 'male' | 'female',
    status: 1
  });
  const rules: FormRules = USER_RULES;

  const handleAdd = () => {
    dialogTitle.value = '新增用户';
    form.id = undefined;
    form.tenantId = undefined;
    form.name = '';
    form.nickName = '';
    form.gender = 'male';
    form.status = 1;
    dialogVisible.value = true;
  };

  const handleEdit = (row: SystemUser) => {
    dialogTitle.value = '编辑用户';
    form.id = row.id;
    form.tenantId = row.tenantId ?? undefined;
    form.name = row.name ?? '';
    form.nickName = row.nickName ?? '';
    form.gender = row.gender === 'female' ? 'female' : 'male';
    form.status = row.status ?? 1;
    dialogVisible.value = true;
  };

  const submitForm = async () => {
    submitLoading.value = true;
    try {
      const tenantId = form.tenantId != null ? form.tenantId : null;
      if (form.id != null) {
        await updateSystemUser(form.id, {
          tenantId,
          name: form.name.trim(),
          nickName: form.nickName.trim(),
          gender: form.gender
        });
      } else {
        await addSystemUser({
          tenantId,
          status: form.status,
          name: form.name.trim(),
          nickName: form.nickName.trim(),
          gender: form.gender,
          phone: '',
          email: ''
        });
      }
      ElMessage.success('保存成功');
      dialogVisible.value = false;
      await fetchData();
    } finally {
      submitLoading.value = false;
    }
  };

  const handleDelete = async (row: SystemUser) => {
    await deleteSystemUser(row.id);
    ElMessage.success('删除成功');
    await fetchData();
  };

  const handleToggleEnable = async (row: SystemUser, nextEnabled: boolean) => {
    const nextStatus = nextEnabled ? 1 : 0;
    const actionText = nextStatus === 1 ? '启用' : '禁用';
    await updateSystemUser(row.id, { status: nextStatus });
    ElMessage.success(`${actionText}成功`);
    await fetchData();
  };

  return {
    dialogVisible,
    dialogTitle,
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
