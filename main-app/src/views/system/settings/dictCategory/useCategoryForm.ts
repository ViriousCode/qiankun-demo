import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormRules } from 'element-plus';
import {
  addDictCategory,
  deleteDictCategory,
  updateDictCategory,
  type DictCategory
} from '@/api/dict';
import { DICT_CATEGORY_RULES } from './constants';

export function useCategoryForm(fetchData: () => Promise<void>) {
  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const submitLoading = ref(false);
  const form = reactive({
    id: undefined as number | undefined,
    categoryName: '',
    categoryCode: '',
    sort: 1,
    status: 1,
    description: ''
  });
  const rules: FormRules = DICT_CATEGORY_RULES;

  const handleAdd = () => {
    dialogTitle.value = '新增分类';
    form.id = undefined;
    form.categoryName = '';
    form.categoryCode = '';
    form.sort = 1;
    form.status = 1;
    form.description = '';
    dialogVisible.value = true;
  };

  const handleEdit = (row: DictCategory) => {
    dialogTitle.value = '修改分类';
    form.id = row.id;
    form.categoryName = row.categoryName ?? '';
    form.categoryCode = row.categoryCode ?? '';
    form.sort = row.sort ?? 1;
    form.status = row.status ?? 1;
    form.description = row.description ?? '';
    dialogVisible.value = true;
  };

  const submitForm = async () => {
    submitLoading.value = true;
    try {
      if (form.id != null) {
        await updateDictCategory(form.id, {
          categoryName: form.categoryName,
          categoryCode: form.categoryCode,
          sort: form.sort,
          description: form.description
        });
      } else {
        await addDictCategory({
          categoryName: form.categoryName,
          categoryCode: form.categoryCode,
          sort: form.sort,
          status: form.status,
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

  const handleDelete = async (row: DictCategory) => {
    if (row.id == null) return;
    await deleteDictCategory(row.id);
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

