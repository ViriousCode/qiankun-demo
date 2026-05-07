import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormRules } from 'element-plus';
import { addDict, updateDict, deleteDict, type DictItem } from '@/api/dict';
import { DICT_RULES } from './constants';

export function useDictForm(fetchData: () => Promise<void>) {
  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const submitLoading = ref(false);
  const form = reactive({
    id: undefined as number | undefined,
    categoryCode: '',
    name: '',
    code: '',
    value: 0,
    sort: 1,
    status: 1,
    ext: '',
    description: ''
  });
  const rules: FormRules = DICT_RULES;

  const handleAdd = () => {
    dialogTitle.value = '新增字典';
    form.id = undefined;
    form.categoryCode = '';
    form.name = '';
    form.code = '';
    form.value = 0;
    form.sort = 1;
    form.status = 1;
    form.ext = '';
    form.description = '';
    dialogVisible.value = true;
  };

  const handleEdit = (row: DictItem) => {
    dialogTitle.value = '修改字典';
    form.id = row.id;
    form.categoryCode = row.categoryCode ?? '';
    form.name = row.name ?? '';
    form.code = row.code ?? '';
    form.value = (row as any).value ?? 0;
    form.sort = row.sort ?? 1;
    form.status = row.status ?? 1;
    form.ext = row.ext ?? '';
    form.description = row.description ?? '';
    dialogVisible.value = true;
  };

  const submitForm = async () => {
    submitLoading.value = true;
    try {
      if (form.id != null) {
        await updateDict(form.id, {
          categoryCode: form.categoryCode,
          name: form.name,
          code: form.code,
          value: form.value,
          sort: form.sort,
          ext: form.ext,
          description: form.description
        });
      } else {
        await addDict({
          categoryCode: form.categoryCode,
          name: form.name,
          code: form.code,
          value: form.value,
          sort: form.sort,
          status: form.status,
          ext: form.ext,
          description: form.description
        });
      }
      ElMessage.success('操作成功');
      dialogVisible.value = false;
      await fetchData();
    } finally {
      submitLoading.value = false;
    }
  };

  const handleDelete = async (row: DictItem) => {
    await deleteDict(row.id!);
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
