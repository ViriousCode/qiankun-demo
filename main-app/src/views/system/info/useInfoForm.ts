import { computed, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  addSystemInfo,
  getSystemInfoDetail,
  updateSystemInfo,
  type SystemInfo,
  type SystemInfoSavePayload
} from '@/api/systemInfo';
import { INFO_RULES } from './constants';

export interface InfoFormModel {
  id?: number;
  title: string;
  infoCategory: string;
  infoType: 'internal' | 'external';
  externalLink: string;
  publisher: string;
  content: string;
  publishTime?: string;
}

const createInitialForm = (): InfoFormModel => ({
  id: undefined,
  title: '',
  infoCategory: '',
  infoType: 'internal',
  externalLink: '',
  publisher: '',
  content: '',
  publishTime: ''
});

const pad = (value: number) => String(value).padStart(2, '0');

const formatDateTime = (time = new Date()) => {
  const yyyy = time.getFullYear();
  const mm = pad(time.getMonth() + 1);
  const dd = pad(time.getDate());
  const hh = pad(time.getHours());
  const mi = pad(time.getMinutes());
  const ss = pad(time.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

const toPayload = (formData: InfoFormModel, targetStatus: 0 | 1): SystemInfoSavePayload => {
  const trimmedTitle = formData.title.trim();
  const trimmedInfoCategory = formData.infoCategory.trim();
  const trimmedPublisher = formData.publisher.trim();
  const trimmedExternalLink = formData.externalLink.trim();
  const publishTime =
    targetStatus === 1
      ? formData.publishTime || formatDateTime()
      : formData.publishTime || undefined;
  return {
    title: trimmedTitle,
    infoCategory: trimmedInfoCategory,
    infoType: formData.infoType,
    externalLink: formData.infoType === 'external' ? trimmedExternalLink : '',
    publisher: trimmedPublisher,
    content: formData.infoType === 'internal' ? formData.content : '',
    status: targetStatus,
    publishTime
  };
};

const assignFormData = (target: InfoFormModel, source: Partial<SystemInfo>) => {
  const legacy = source as any;
  target.id = source.id;
  target.title = source.title || '';
  target.infoCategory = source.infoCategory || legacy.category || '';
  target.infoType =
    source.infoType === 'external' || legacy.category === '外部' ? 'external' : 'internal';
  target.externalLink = source.externalLink || '';
  target.publisher = source.publisher || legacy.author || '';
  target.content = source.content || '';
  target.publishTime = source.publishTime || '';
};

export function useInfoForm() {
  const formData = reactive<InfoFormModel>(createInitialForm());
  const detailLoading = ref(false);
  const submitLoading = ref(false);
  const rules = INFO_RULES;
  const pageTitle = computed(() => (formData.id ? '编辑资讯' : '新增资讯'));
  const isExternal = computed(() => formData.infoType === 'external');

  watch(
    () => formData.infoType,
    (value) => {
      if (value === 'external') {
        formData.content = '';
      } else {
        formData.externalLink = '';
      }
    }
  );

  const resetForm = () => {
    assignFormData(formData, createInitialForm());
  };

  const loadDetail = async (id: number) => {
    detailLoading.value = true;
    try {
      const detail = await getSystemInfoDetail(id);
      assignFormData(formData, detail || {});
    } finally {
      detailLoading.value = false;
    }
  };

  const submitForm = async (targetStatus: 0 | 1) => {
    submitLoading.value = true;
    try {
      if (targetStatus === 1 && formData.infoType === 'external' && !formData.externalLink.trim()) {
        throw new Error('请输入外部链接');
      }
      if (
        targetStatus === 1 &&
        formData.infoType === 'external' &&
        !/^https?:\/\//i.test(formData.externalLink.trim())
      ) {
        throw new Error('外部链接需以 http:// 或 https:// 开头');
      }
      if (targetStatus === 1 && formData.infoType === 'internal' && !formData.content.trim()) {
        throw new Error('请输入正文内容');
      }
      const payload = toPayload(formData, targetStatus);
      if (formData.id != null) {
        await updateSystemInfo(formData.id, payload);
      } else {
        await addSystemInfo(payload);
      }
      ElMessage.success('保存成功');
    } catch (error: any) {
      ElMessage.error(error?.message || '保存失败');
      throw error;
    } finally {
      submitLoading.value = false;
    }
  };

  return {
    formData,
    detailLoading,
    submitLoading,
    rules,
    isExternal,
    pageTitle,
    resetForm,
    loadDetail,
    submitForm
  };
}
