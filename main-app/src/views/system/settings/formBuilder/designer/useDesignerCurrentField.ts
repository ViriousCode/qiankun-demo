import { computed } from 'vue';
import type { Ref } from 'vue';
import type { FormFieldSchema } from '@/types/formBuilder';

type UseDesignerCurrentFieldOptions = {
  schema: Ref<FormFieldSchema[]>;
  selectedUid: Ref<string>;
  rebuildBucketsFromSchema: () => void;
  pushSnapshot: () => void;
};

export const useDesignerCurrentField = ({
  schema,
  selectedUid,
  rebuildBucketsFromSchema,
  pushSnapshot
}: UseDesignerCurrentFieldOptions) => {
  const currentField = computed<FormFieldSchema | null>(() => {
    const uid = selectedUid.value;
    if (!uid) return null;
    return schema.value.find((x) => x.uid === uid) || null;
  });

  const updateCurrentFieldGroupId = (value: unknown) => {
    if (!currentField.value) return;
    (currentField.value as any).groupId = String(value || '').trim() || undefined;
    rebuildBucketsFromSchema();
    pushSnapshot();
  };

  const applyCurrentFieldPatch = (next: FormFieldSchema) => {
    if (!currentField.value) return;
    Object.assign(currentField.value, next || {});
  };

  return {
    currentField,
    updateCurrentFieldGroupId,
    applyCurrentFieldPatch
  };
};

