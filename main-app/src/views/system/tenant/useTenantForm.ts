import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormRules } from 'element-plus';
import {
  addSystemTenant,
  updateSystemTenant,
  deleteSystemTenant,
  type SystemTenant
} from '@/api/systemTenant';
import { TENANT_RULES } from './constants';

export function useTenantForm(fetchData: () => Promise<void>) {
  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const submitLoading = ref(false);
  const form = reactive({
    id: undefined as number | undefined,
    tenantName: '',
    shortName: '',
    tenantCode: '',
    adminName: '',
    status: 1
  });
  const rules: FormRules = TENANT_RULES;

  const handleAdd = () => {
    dialogTitle.value = '新增租户';
    form.id = undefined;
    form.tenantName = '';
    form.shortName = '';
    form.tenantCode = '';
    form.adminName = '';
    form.status = 1;
    dialogVisible.value = true;
  };

  const handleEdit = (row: SystemTenant) => {
    dialogTitle.value = '编辑租户';
    form.id = row.id;
    form.tenantName = row.tenantName;
    form.shortName = row.shortName;
    form.tenantCode = row.tenantCode;
    form.adminName = row.adminName;
    form.status = row.status ?? 1;
    dialogVisible.value = true;
  };

  const submitForm = async () => {
    submitLoading.value = true;
    try {
      if (form.id != null) {
        await updateSystemTenant(form.id, {
          tenantName: form.tenantName,
          shortName: form.shortName,
          tenantCode: form.tenantCode,
          adminName: form.adminName
        });
      } else {
        await addSystemTenant({
          tenantName: form.tenantName,
          shortName: form.shortName,
          tenantCode: form.tenantCode,
          adminName: form.adminName,
          status: form.status
        });
      }
      ElMessage.success('保存成功');
      dialogVisible.value = false;
      await fetchData();
    } finally {
      submitLoading.value = false;
    }
  };

  const handleDelete = async (row: SystemTenant) => {
    await deleteSystemTenant(row.id);
    ElMessage.success('删除成功');
    await fetchData();
  };

  const handleToggleEnable = async (row: SystemTenant, nextEnabled: boolean) => {
    const nextStatus = nextEnabled ? 1 : 0;
    const actionText = nextStatus === 1 ? '启用' : '禁用';
    await updateSystemTenant(row.id, { status: nextStatus });
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
