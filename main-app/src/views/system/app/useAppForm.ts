import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormRules } from 'element-plus';
import { addApp, updateApp, deleteApp, type MicroApp, type AppCategory } from '@/api/app';
import { useUserStore } from '@/store/user';
import { APP_RULES } from './constants';

const buildInitialForm = (category: AppCategory): MicroApp => ({
  name: '',
  shortName: '',
  code: '',
  category,
  entry: '',
  iconName: '',
  iconUrl: '',
  leader: '',
  status: 1,
  activeRule: '',
  container: '#sub-app-container',
  showInWorkbench: false
});

const getCategoryLabel = (category: AppCategory) => {
  if (category === 'sso') return '单点应用';
  if (category === 'external') return '外部应用';
  return '平台应用';
};

export function useAppForm(fetchData: () => Promise<void>, category: AppCategory = 'platform') {
  const userStore = useUserStore();
  const dialogVisible = ref(false);
  const dialogTitle = ref('新增应用');
  const submitLoading = ref(false);
  const formData = reactive<MicroApp>({ ...buildInitialForm(category) });
  const rules: FormRules = {
    ...APP_RULES,
    ...(category === 'platform' ? {} : { activeRule: [] })
  };

  const resetForm = () => {
    Object.assign(formData, { ...buildInitialForm(category), id: undefined });
  };

  const handleAdd = () => {
    dialogTitle.value = `新增${getCategoryLabel(category)}`;
    resetForm();
    dialogVisible.value = true;
  };

  const handleEdit = (row: MicroApp) => {
    dialogTitle.value = `编辑${getCategoryLabel(category)}`;
    Object.assign(formData, { ...row });
    dialogVisible.value = true;
  };

  const submitForm = async () => {
    submitLoading.value = true;
    try {
      if (formData.id != null) {
        const { status: _status, ...patch } = formData as any;
        await updateApp(formData.id, patch);
      } else {
        await addApp(formData);
      }
      ElMessage.success('保存成功');
      dialogVisible.value = false;
      await fetchData();
      await userStore.refreshAndSync();
    } finally {
      submitLoading.value = false;
    }
  };

  const handleDelete = async (row: MicroApp) => {
    if (row.id == null) return;
    await deleteApp(row.id);
    ElMessage.success('删除成功');
    await fetchData();
    await userStore.refreshAndSync();
  };

  return {
    dialogVisible,
    dialogTitle,
    formData,
    rules,
    submitLoading,
    handleAdd,
    handleEdit,
    submitForm,
    handleDelete
  };
}
