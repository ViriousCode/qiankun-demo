import { computed, ref, watch } from 'vue';
import type { Ref } from 'vue';
import type { FormFieldConditionOp, FormFieldDataSource, FormFieldSchema, FormFieldType } from '@/types/formBuilder';

type UseDesignerFieldPropsOptions = {
  schema: Ref<FormFieldSchema[]>;
  currentField: Ref<FormFieldSchema | null>;
  pushSnapshot: () => void;
  pushSnapshotDebounced: () => void;
};

export const useDesignerFieldProps = ({
  schema,
  currentField,
  pushSnapshot,
  pushSnapshotDebounced
}: UseDesignerFieldPropsOptions) => {
  const supportsOptions = (type: FormFieldType) =>
    type === 'select' || type === 'radio' || type === 'checkbox' || type === 'autocomplete';
  const supportsPlaceholder = (type: FormFieldType) =>
    type === 'input' ||
    type === 'textarea' ||
    type === 'autocomplete' ||
    type === 'select' ||
    type === 'cascader' ||
    type === 'date' ||
    type === 'datetime' ||
    type === 'time';
  const supportsPattern = (type: FormFieldType) =>
    type === 'input' || type === 'textarea' || type === 'number';
  const supportsTextLength = (type: FormFieldType) => type === 'input' || type === 'textarea';
  const supportsNumberRange = (type: FormFieldType) =>
    type === 'number' || type === 'slider' || type === 'rate';

  const normalizeDesignerSchema = (list: FormFieldSchema[]) => {
    for (const f of list || []) {
      if (!supportsOptions(f.type)) continue;
      const ds = f.dataSource as any;
      if (ds && ds.type === 'remote') {
        f.dataSourceType = 'remote';
      } else if (!f.dataSourceType) {
        f.dataSourceType = 'static';
      }
    }
  };

  const dataSourceJsonError = ref('');
  const handleDataSourceTypeChange = () => {
    if (!currentField.value) return;
    const f = currentField.value;
    if (!supportsOptions(f.type)) return;
    if (f.dataSourceType === 'remote') {
      f.dataSource = {
        type: 'remote',
        method: 'GET',
        url: '/api/system/form-builder/options/demo',
        listPath: 'list',
        labelKey: 'label',
        valueKey: 'value',
        cacheTtlMs: 60000
      } as any;
    } else {
      delete (f as any).dataSource;
      f.dataSourceType = 'static';
    }
    dataSourceJsonError.value = '';
    pushSnapshot();
  };

  const conditionOps = [
    { value: '==' as FormFieldConditionOp, label: '=' },
    { value: '!=' as FormFieldConditionOp, label: '!=' },
    { value: '>' as FormFieldConditionOp, label: '>' },
    { value: '>=' as FormFieldConditionOp, label: '>=' },
    { value: '<' as FormFieldConditionOp, label: '<' },
    { value: '<=' as FormFieldConditionOp, label: '<=' },
    { value: 'includes' as FormFieldConditionOp, label: '包含(includes)' },
    { value: 'not_includes' as FormFieldConditionOp, label: '不包含' }
  ];

  const linkageFieldOptions = (self: FormFieldSchema) => {
    return schema.value
      .filter((x) => x.field && x.uid !== self.uid)
      .map((x) => ({
        value: x.field,
        label: `${x.label || x.field}（${x.field}）`
      }));
  };
  const currentLinkageFieldOptions = computed(() => {
    if (!currentField.value) return [];
    return linkageFieldOptions(currentField.value);
  });

  const normalizeConditionValue = (v: any) => {
    if (typeof v !== 'string') return v;
    const s = v.trim();
    if (s === '') return '';
    if (s === 'true') return true;
    if (s === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    return s;
  };

  watch(
    () => currentField.value?.visibleWhen,
    (arr) => {
      if (!arr) return;
      arr.forEach((c) => (c.value = normalizeConditionValue(c.value)));
    },
    { deep: true }
  );
  watch(
    () => currentField.value?.disabledWhen,
    (arr) => {
      if (!arr) return;
      arr.forEach((c) => (c.value = normalizeConditionValue(c.value)));
    },
    { deep: true }
  );

  const patternPresets = [
    { key: 'digits', label: '纯数字', pattern: '^\\d+$', message: '请输入数字' },
    { key: 'phone_cn', label: '手机号(中国)', pattern: '^1\\d{10}$', message: '请输入11位手机号' },
    {
      key: 'email',
      label: '邮箱',
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      message: '请输入正确的邮箱'
    },
    {
      key: 'idcard_cn',
      label: '身份证(中国)',
      pattern: '^(\\d{15}|\\d{17}[0-9Xx])$',
      message: '请输入正确的身份证号'
    },
    { key: 'url', label: 'URL', pattern: '^(https?:\\/\\/).+', message: '请输入正确的URL' }
  ] as Array<{ key: string; label: string; pattern: string; message: string }>;

  const handlePatternPresetChange = (key: string | undefined) => {
    if (!currentField.value) return;
    if (!key) return;
    const preset = patternPresets.find((p) => p.key === key);
    if (!preset) return;
    currentField.value.pattern = preset.pattern;
    if (!currentField.value.patternMessage) {
      currentField.value.patternMessage = preset.message;
    }
    pushSnapshot();
  };

  const cascaderJsonError = ref('');
  const cascaderOptionsText = computed({
    get: () => {
      if (currentField.value?.type !== 'cascader') return '';
      try {
        return JSON.stringify(currentField.value.treeOptions || [], null, 2);
      } catch {
        return '';
      }
    },
    set: (text: string) => {
      if (currentField.value?.type !== 'cascader') return;
      const raw = String(text || '').trim();
      if (!raw) {
        currentField.value.treeOptions = [];
        cascaderJsonError.value = '';
        pushSnapshotDebounced();
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        currentField.value.treeOptions = Array.isArray(parsed) ? parsed : [];
        cascaderJsonError.value = '';
        pushSnapshotDebounced();
      } catch {
        cascaderJsonError.value = 'JSON 格式不正确（暂未生效）';
      }
    }
  });

  const formatCascaderOptions = () => {
    if (currentField.value?.type !== 'cascader') return;
    try {
      const next = JSON.stringify(currentField.value.treeOptions || [], null, 2);
      cascaderOptionsText.value = next;
      cascaderJsonError.value = '';
    } catch {
      cascaderJsonError.value = '无法格式化：当前选项不是可序列化的 JSON';
    }
  };
  const updateCascaderOptionsText = (text: string) => {
    cascaderOptionsText.value = text;
  };

  const componentPropsJsonError = ref('');
  const componentPropsDraftText = ref('');
  const componentPropsText = computed({
    get: () => {
      return componentPropsDraftText.value;
    },
    set: (text: string) => {
      if (!currentField.value) return;
      componentPropsDraftText.value = String(text ?? '');
      const raw = String(text ?? '').trim();
      if (!raw) {
        currentField.value.componentProps = undefined;
        componentPropsJsonError.value = '';
        pushSnapshotDebounced();
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        currentField.value.componentProps = parsed && typeof parsed === 'object' ? parsed : {};
        componentPropsJsonError.value = '';
        pushSnapshotDebounced();
      } catch {
        componentPropsJsonError.value = 'JSON 格式不正确（暂未生效）';
      }
    }
  });

  watch(
    () => currentField.value?.uid,
    () => {
      if (!currentField.value) {
        componentPropsDraftText.value = '';
        componentPropsJsonError.value = '';
        return;
      }
      try {
        componentPropsDraftText.value = JSON.stringify(currentField.value.componentProps || {}, null, 2);
      } catch {
        componentPropsDraftText.value = '';
      }
      componentPropsJsonError.value = '';
    },
    { immediate: true }
  );

  const formatComponentProps = () => {
    if (!currentField.value) return;
    try {
      const next = JSON.stringify(currentField.value.componentProps || {}, null, 2);
      componentPropsText.value = next;
      componentPropsJsonError.value = '';
    } catch {
      componentPropsJsonError.value = '无法格式化：当前 Props 不是可序列化的 JSON';
    }
  };
  const updateComponentPropsText = (text: string) => {
    componentPropsText.value = text;
  };

  const addOption = () => {
    if (!currentField.value) return;
    currentField.value.options = currentField.value.options || [];
    currentField.value.options.push({
      label: '新选项',
      value: `v${currentField.value.options.length + 1}`
    });
    pushSnapshot();
  };
  const removeOption = (idx: number) => {
    if (!currentField.value?.options) return;
    currentField.value.options.splice(idx, 1);
    pushSnapshot();
  };

  const dataSourceText = computed({
    get: () => {
      if (!currentField.value) return '';
      if (!supportsOptions(currentField.value.type)) return '';
      if (currentField.value.dataSourceType !== 'remote') return '';
      try {
        return JSON.stringify(currentField.value.dataSource || {}, null, 2);
      } catch {
        return '';
      }
    },
    set: (text: string) => {
      if (!currentField.value) return;
      if (!supportsOptions(currentField.value.type)) return;
      if (currentField.value.dataSourceType !== 'remote') return;
      const raw = String(text || '').trim();
      if (!raw) {
        currentField.value.dataSource = undefined;
        dataSourceJsonError.value = '';
        pushSnapshotDebounced();
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || (parsed as any).type !== 'remote') {
          dataSourceJsonError.value = 'dataSource 必须是对象且 type 为 remote';
          return;
        }
        currentField.value.dataSource = parsed as FormFieldDataSource;
        dataSourceJsonError.value = '';
        pushSnapshotDebounced();
      } catch {
        dataSourceJsonError.value = 'JSON 格式不正确（暂未生效）';
      }
    }
  });

  const formatDataSource = () => {
    if (!currentField.value) return;
    if (currentField.value.dataSourceType !== 'remote') return;
    try {
      const next = JSON.stringify(currentField.value.dataSource || {}, null, 2);
      dataSourceText.value = next;
      dataSourceJsonError.value = '';
    } catch {
      dataSourceJsonError.value = '无法格式化：当前 dataSource 不是可序列化的 JSON';
    }
  };
  const updateDataSourceText = (text: string) => {
    dataSourceText.value = text;
  };

  return {
    supportsOptions,
    supportsPlaceholder,
    supportsPattern,
    supportsTextLength,
    supportsNumberRange,
    normalizeDesignerSchema,
    dataSourceJsonError,
    handleDataSourceTypeChange,
    conditionOps,
    currentLinkageFieldOptions,
    patternPresets,
    handlePatternPresetChange,
    cascaderJsonError,
    cascaderOptionsText,
    formatCascaderOptions,
    updateCascaderOptionsText,
    componentPropsJsonError,
    componentPropsText,
    formatComponentProps,
    updateComponentPropsText,
    addOption,
    removeOption,
    dataSourceText,
    formatDataSource,
    updateDataSourceText
  };
};

