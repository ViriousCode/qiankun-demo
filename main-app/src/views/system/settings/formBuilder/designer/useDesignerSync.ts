import { watch } from 'vue';
import type { Ref } from 'vue';
import type { FormFieldSchema } from '@/types/formBuilder';

type UseDesignerSyncOptions = {
  schema: Ref<FormFieldSchema[]>;
  selectedUid: Ref<string>;
  selectedUids: Ref<Set<string>>;
  canvasBuckets: Ref<Record<string, FormFieldSchema[]>>;
  restoring: Ref<boolean>;
  rebuildBucketsFromSchema: () => void;
  rebuildSchemaFromBuckets: () => void;
  pushSnapshot: () => void;
};

export const useDesignerSync = ({
  schema,
  selectedUid,
  selectedUids,
  canvasBuckets,
  restoring,
  rebuildBucketsFromSchema,
  rebuildSchemaFromBuckets,
  pushSnapshot
}: UseDesignerSyncOptions) => {
  const onDragEnd = () => {
    rebuildSchemaFromBuckets();
    if (!selectedUid.value && schema.value.length > 0) {
      selectedUid.value = schema.value[schema.value.length - 1]?.uid || '';
    }
    if (selectedUid.value) {
      selectedUids.value = new Set([selectedUid.value]);
    }
    pushSnapshot();
  };

  const onGroupDragEnd = () => {
    rebuildSchemaFromBuckets();
    pushSnapshot();
  };

  watch(
    () => schema.value,
    () => {
      rebuildBucketsFromSchema();
    },
    { deep: true }
  );

  watch(
    () => canvasBuckets.value,
    () => {
      if (restoring.value) return;
      rebuildSchemaFromBuckets();
    },
    { deep: true }
  );

  return {
    onDragEnd,
    onGroupDragEnd
  };
};

