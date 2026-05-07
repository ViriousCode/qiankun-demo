import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormRules } from 'element-plus';
import { addLink, updateLink, deleteLink, type LinkItem } from '@/api/link';
import { LINK_RULES } from './constants';

export function useLinkForm(fetchData: () => Promise<void>) {
  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const submitLoading = ref(false);
  const form = reactive({
    id: undefined as number | undefined,
    name: '',
    url: '',
    sort: 1,
    status: 1
  });
  const rules: FormRules = LINK_RULES;

  const handleAdd = () => {
    dialogTitle.value = '新增链接';
    form.id = undefined;
    form.name = '';
    form.url = '';
    form.sort = 1;
    form.status = 1;
    dialogVisible.value = true;
  };

  const handleEdit = (row: LinkItem) => {
    dialogTitle.value = '编辑链接';
    form.id = row.id;
    form.name = row.name ?? '';
    form.url = row.url ?? '';
    form.sort = Number(row.sort ?? 0);
    form.status = row.status === 0 ? 0 : 1;
    dialogVisible.value = true;
  };

  const submitForm = async () => {
    submitLoading.value = true;
    try {
      const payload = {
        name: form.name.trim(),
        url: form.url.trim(),
        sort: Number(form.sort || 0),
        status: form.status
      };
      if (form.id != null) {
        const { status: _status, ...patch } = payload as any;
        await updateLink(form.id, patch);
      } else {
        await addLink(payload);
      }
      ElMessage.success('保存成功');
      dialogVisible.value = false;
      await fetchData();
    } finally {
      submitLoading.value = false;
    }
  };

  const handleDelete = async (row: LinkItem) => {
    if (row.id == null) return;
    await deleteLink(row.id);
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
