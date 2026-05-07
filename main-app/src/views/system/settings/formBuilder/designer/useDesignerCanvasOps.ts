import { ElMessage } from 'element-plus';
import type { Ref } from 'vue';
import type { FormFieldSchema } from '@/types/formBuilder';

type UseDesignerCanvasOpsOptions = {
  schema: Ref<FormFieldSchema[]>;
  selectedUid: Ref<string>;
  selectedUids: Ref<Set<string>>;
  previewRendererRef: Ref<any>;
  pushSnapshot: () => void;
  undo: () => void;
  redo: () => void;
  removeField: (index: number) => void;
  batchRemoveSelected: () => Promise<void> | void;
  createUid: () => string;
  createUniqueField: (prefix: string, fieldSet: Set<string>) => string;
  buildFieldSet: () => Set<string>;
  deepClone: <T>(obj: T) => T;
};

export const useDesignerCanvasOps = ({
  schema,
  selectedUid,
  selectedUids,
  previewRendererRef,
  pushSnapshot,
  undo,
  redo,
  removeField,
  batchRemoveSelected,
  createUid,
  createUniqueField,
  buildFieldSet,
  deepClone
}: UseDesignerCanvasOpsOptions) => {
  const validatePreview = async () => {
    const formInst = previewRendererRef.value?.formRef;
    if (!formInst) return;
    try {
      const runValidate = () =>
        new Promise<{ valid: boolean; fields?: Record<string, any> }>((resolve) => {
          formInst.validate((valid: boolean, fields: any) => resolve({ valid, fields }));
        });

      const extractFromFields = (fields: any) => {
        if (!fields || typeof fields !== 'object') return '';
        const preferKey = '__fb_crossfield__';
        const keys = Object.keys(fields);
        const ordered = keys.includes(preferKey) ? [preferKey, ...keys.filter((k) => k !== preferKey)] : keys;
        for (const k of ordered) {
          const arr = fields[k];
          const msg = Array.isArray(arr) ? arr[0]?.message : '';
          if (msg) return String(msg);
        }
        return '';
      };

      const { valid, fields } = await runValidate();
      if (valid) {
        ElMessage.success('校验通过');
        return;
      }
      const msg = extractFromFields(fields) || '校验未通过：请检查字段校验或跨字段规则';
      ElMessage.error(msg);
    } catch {
      ElMessage.error('校验未通过：请检查字段校验或跨字段规则');
    }
  };

  const indexOfSelected = () => schema.value.findIndex((x) => x.uid === selectedUid.value);

  const removeSelected = () => {
    if (selectedUids.value.size > 1) return batchRemoveSelected();
    const idx = indexOfSelected();
    if (idx < 0) return;
    removeField(idx);
  };

  const moveSelected = (delta: number) => {
    const idx = indexOfSelected();
    if (idx < 0) return;
    const to = idx + delta;
    if (to < 0 || to >= schema.value.length) return;
    const [it] = schema.value.splice(idx, 1);
    if (!it) return;
    schema.value.splice(to, 0, it);
    pushSnapshot();
  };

  const moveSelectedTo = (pos: 'top' | 'bottom') => {
    const idx = indexOfSelected();
    if (idx < 0) return;
    const [it] = schema.value.splice(idx, 1);
    if (!it) return;
    if (pos === 'top') schema.value.unshift(it);
    else schema.value.push(it);
    pushSnapshot();
  };

  const duplicateSelected = () => {
    const idx = indexOfSelected();
    if (idx < 0) return;
    const src = schema.value[idx];
    if (!src) return;
    const fieldSet = buildFieldSet();
    const copy: FormFieldSchema = deepClone(src);
    copy.uid = createUid();
    copy.field = createUniqueField(src.type, fieldSet);
    schema.value.splice(idx + 1, 0, copy);
    selectedUid.value = copy.uid;
    pushSnapshot();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (!mod) return;
    const key = e.key.toLowerCase();
    if (key === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    } else if (key === 'y') {
      e.preventDefault();
      redo();
    }
  };

  return {
    validatePreview,
    removeSelected,
    moveSelected,
    moveSelectedTo,
    duplicateSelected,
    onKeyDown
  };
};

