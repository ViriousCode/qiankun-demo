import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormRules } from 'element-plus';
import { addRole, updateRole, deleteRole, type Role } from '@/api/role';
import { ROLE_RULES } from './constants';
import type { RoleFormModel } from './components/RoleFormDialog.vue';
import { useUserStore } from '@/store/user';

export function useRoleForm(options: {
  fetchData: () => Promise<void>;
  resolveCurrentTenantId: () => number | null;
}) {
  const { fetchData, resolveCurrentTenantId } = options;
  const userStore = useUserStore();

  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const isEdit = ref(false);
  const submitLoading = ref(false);

  const form = reactive<RoleFormModel>({
    id: undefined,
    tenantId: null,
    roleName: '',
    roleCode: '',
    description: '',
    status: 1
  });

  const rules: FormRules = ROLE_RULES;

  const handleAdd = () => {
    dialogTitle.value = '新增角色';
    isEdit.value = false;
    form.id = undefined;
    form.tenantId = resolveCurrentTenantId();
    form.roleName = '';
    form.roleCode = '';
    form.description = '';
    form.status = 1;
    dialogVisible.value = true;
  };

  const handleEdit = (row: Role) => {
    dialogTitle.value = '编辑角色';
    isEdit.value = true;
    form.id = row.id;
    form.tenantId = resolveCurrentTenantId();
    form.roleName = row.roleName ?? '';
    form.roleCode = (row as any).roleCode ?? (row as any).roleKey ?? '';
    form.description = row.description ?? '';
    form.status = row.status != null ? Number(row.status) : 1;
    dialogVisible.value = true;
  };

  const submitForm = async () => {
    submitLoading.value = true;
    try {
      const tenantId = resolveCurrentTenantId();
      if (tenantId == null) throw new Error('tenantId missing');

      const payload: Partial<Role> = {
        tenantId,
        roleName: form.roleName.trim(),
        roleCode: form.roleCode.trim(),
        description: (form.description ?? '').trim(),
        status: form.status,
        app: 'main'
      };

      if (form.id != null) {
        // 编辑时不允许修改角色编码
        const { roleCode: _roleCode, status: _status, ...patch } = payload as any;
        await updateRole(form.id, patch);
      } else {
        await addRole(payload as Role);
      }

      ElMessage.success('保存成功');
      dialogVisible.value = false;
      await fetchData();
      await userStore.refreshAndSync();
    } finally {
      submitLoading.value = false;
    }
  };

  const handleDelete = async (row: Role) => {
    await deleteRole(row.id!);
    ElMessage.success('删除成功');
    await fetchData();
    await userStore.refreshAndSync();
  };

  const handleToggleEnable = async (row: Role, nextEnabled: boolean) => {
    const nextStatus = nextEnabled ? 1 : 0;
    const actionText = nextStatus === 1 ? '启用' : '禁用';
    const roleCode = (row as any).roleCode ?? (row as any).roleKey ?? '';
    await updateRole(row.id!, { ...row, roleCode, status: nextStatus });
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
