import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormRules } from 'element-plus';
import { addFault, updateFault, deleteFault, type FaultItem } from '@/api/fault';
import { FAULT_RULES } from './constants';

export function useFaultForm(fetchData: () => Promise<void>) {
  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const submitLoading = ref(false);
  const form = reactive({
    id: undefined as number | undefined,
    faultCode: '',
    faultName: '',
    faultLevel: '2',
    status: 1,
    suggestion: ''
  });
  const rules: FormRules = FAULT_RULES;

  const handleAdd = () => {
    dialogTitle.value = '新增故障字码';
    form.id = undefined;
    form.faultCode = '';
    form.faultName = '';
    form.faultLevel = '2';
    form.status = 1;
    form.suggestion = '';
    dialogVisible.value = true;
  };

  const handleEdit = (row: FaultItem) => {
    dialogTitle.value = '修改故障字码';
    form.id = row.id;
    form.faultCode = row.faultCode ?? '';
    form.faultName = row.faultName ?? '';
    form.faultLevel = String(row.faultLevel ?? '2');
    form.status = row.status ?? 1;
    form.suggestion = row.suggestion ?? '';
    dialogVisible.value = true;
  };

  const submitForm = async () => {
    submitLoading.value = true;
    try {
      if (form.id != null) {
        await updateFault(form.id, {
          faultCode: form.faultCode,
          faultName: form.faultName,
          faultLevel: form.faultLevel,
          suggestion: form.suggestion
        });
      } else {
        await addFault({
          faultCode: form.faultCode,
          faultName: form.faultName,
          faultLevel: form.faultLevel,
          suggestion: form.suggestion,
          status: form.status
        });
      }
      ElMessage.success('操作成功');
      dialogVisible.value = false;
      await fetchData();
    } finally {
      submitLoading.value = false;
    }
  };

  const handleDelete = async (row: FaultItem) => {
    await deleteFault(row.id!);
    ElMessage.success('删除成功');
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
    handleDelete
  };
}
