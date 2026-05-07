import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { addApi, updateApi, deleteApi, type ApiItem } from '@/api/systemApi';
import { API_FORM_RULES, API_PATH_PREFIX_MAP } from './constants';

export interface ApiFormModel {
  id?: number;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  appName: string;
  needAuth: boolean;
  isCommon: boolean;
  enabled: boolean;
}

const initialForm: ApiFormModel = {
  id: undefined,
  name: '',
  path: '',
  method: 'GET',
  appName: '主系统',
  needAuth: true,
  isCommon: false,
  enabled: true
};

function buildPermissionCode(path: string, method: ApiFormModel['method']) {
  const normalizedMethod = String(method || 'GET').toLowerCase();
  const normalizedPath = String(path || '')
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+/g, '.');
  return normalizedPath ? `${normalizedMethod}:${normalizedPath}` : `${normalizedMethod}:`;
}

function normalizeApiPath(path: string) {
  return String(path || '')
    .trim()
    .replace(/\/{2,}/g, '/');
}

export function useApiForm(fetchData: () => Promise<void> | void) {
  const dialogVisible = ref(false);
  const dialogTitle = ref('新增API');
  const submitLoading = ref(false);
  const formData = reactive<ApiFormModel>({ ...initialForm });
  const rules = API_FORM_RULES;
  const pathPrefix = computed(() => API_PATH_PREFIX_MAP[formData.appName] || '/platform');
  const permissionCode = computed(() => buildPermissionCode(formData.path, formData.method));

  const resetForm = () => {
    Object.assign(formData, { ...initialForm });
  };

  const handleAdd = () => {
    dialogTitle.value = '新增API';
    resetForm();
    dialogVisible.value = true;
  };

  const handleEdit = (row: ApiItem) => {
    dialogTitle.value = '编辑API';
    Object.assign(formData, {
      id: row.id,
      name: row.name || '',
      path: row.path || '',
      method: row.method || 'GET',
      appName: row.appName || '主系统',
      needAuth: row.needAuth !== false,
      isCommon: row.isCommon === true,
      enabled: row.enabled !== false
    });
    dialogVisible.value = true;
  };

  const submitForm = async () => {
    submitLoading.value = true;
    try {
      const payload: Omit<ApiItem, 'id' | 'createTime'> = {
        name: formData.name.trim(),
        path: normalizeApiPath(formData.path),
        method: formData.method,
        permissionCode: permissionCode.value,
        appName: formData.appName,
        needAuth: formData.needAuth,
        isCommon: formData.isCommon,
        enabled: formData.enabled
      };
      if (formData.id != null) {
        const { enabled: _enabled, ...patch } = payload as any;
        await updateApi(formData.id, patch);
      } else {
        await addApi(payload);
      }
      ElMessage.success('保存成功');
      dialogVisible.value = false;
      await Promise.resolve(fetchData());
    } finally {
      submitLoading.value = false;
    }
  };

  const handleDelete = async (row: ApiItem) => {
    await deleteApi(row.id);
    ElMessage.success('删除成功');
    await Promise.resolve(fetchData());
  };

  const handleToggleEnable = async (row: ApiItem, nextEnabled: boolean) => {
    const actionText = nextEnabled ? '启用' : '禁用';
    await updateApi(row.id, { enabled: nextEnabled });
    ElMessage.success(`${actionText}成功`);
    await Promise.resolve(fetchData());
  };

  return {
    dialogVisible,
    dialogTitle,
    formData,
    pathPrefix,
    permissionCode,
    rules,
    submitLoading,
    handleAdd,
    handleEdit,
    submitForm,
    handleDelete,
    handleToggleEnable
  };
}
