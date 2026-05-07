import { computed } from 'vue';
import type { Ref } from 'vue';
import type { FormFieldSchema } from '@/types/formBuilder';
import { confirmInAppMain, promptInAppMain } from '@/utils/messageBox';

type UseDesignerSelectionOptions = {
  schema: Ref<FormFieldSchema[]>;
  selectedUid: Ref<string>;
  selectedUids: Ref<Set<string>>;
  pushSnapshot: () => void;
};

export const useDesignerSelection = ({
  schema,
  selectedUid,
  selectedUids,
  pushSnapshot
}: UseDesignerSelectionOptions) => {
  const isSelected = (uid: string) => selectedUids.value.has(uid);
  const selectedCount = computed(() => selectedUids.value.size);

  const uidToIndexMap = computed(() => {
    const map = new Map<string, number>();
    (schema.value || []).forEach((item, index) => map.set(item.uid, index));
    return map;
  });

  const selectOnly = (uid: string) => {
    selectedUids.value = new Set(uid ? [uid] : []);
    selectedUid.value = uid || '';
  };

  const toggleSelect = (uid: string) => {
    const next = new Set(selectedUids.value);
    if (next.has(uid)) next.delete(uid);
    else next.add(uid);
    selectedUids.value = next;
    if (!next.has(selectedUid.value)) {
      selectedUid.value = next.values().next().value || '';
    }
  };

  const rangeSelect = (uid: string) => {
    const list = schema.value || [];
    const from = selectedUid.value || uid;
    const a = list.findIndex((x) => x.uid === from);
    const b = list.findIndex((x) => x.uid === uid);
    if (a < 0 || b < 0) return selectOnly(uid);
    const [start, end] = a < b ? [a, b] : [b, a];
    selectedUids.value = new Set(list.slice(start, end + 1).map((x) => x.uid));
    selectedUid.value = uid;
  };

  const onCanvasItemClick = (e: MouseEvent, uid: string) => {
    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
    const multi = isMac ? e.metaKey : e.ctrlKey;
    if (e.shiftKey) return rangeSelect(uid);
    if (multi) return toggleSelect(uid);
    return selectOnly(uid);
  };

  const removeField = (index: number) => {
    const removed = schema.value.splice(index, 1)[0];
    if (removed) {
      const next = new Set(selectedUids.value);
      next.delete(removed.uid);
      selectedUids.value = next;
      if (removed.uid === selectedUid.value) {
        selectedUid.value = next.values().next().value || '';
      }
    }
    pushSnapshot();
  };

  const removeFieldByUid = (uid: string) => {
    const index = uidToIndexMap.value.get(uid);
    if (index == null) return;
    removeField(index);
  };

  const batchRemoveSelected = async () => {
    if (selectedUids.value.size === 0) return;
    try {
      await confirmInAppMain(`确认移除选中的 ${selectedUids.value.size} 个字段？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
    } catch {
      return;
    }
    const set = new Set(selectedUids.value);
    schema.value = (schema.value || []).filter((x) => !set.has(x.uid));
    selectedUids.value = new Set();
    selectedUid.value = schema.value[0]?.uid || '';
    pushSnapshot();
  };

  const batchSetDisabled = (disabled: boolean) => {
    const set = new Set(selectedUids.value);
    if (set.size === 0) return;
    (schema.value || []).forEach((x) => {
      if (set.has(x.uid)) x.disabled = disabled;
    });
    pushSnapshot();
  };

  const batchSetSpan = async () => {
    const set = new Set(selectedUids.value);
    if (set.size === 0) return;
    try {
      const res: any = await promptInAppMain('请输入占用列（1-24）', '批量设置占用列', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^(?:[1-9]|1\d|2[0-4])$/,
        inputErrorMessage: '请输入 1-24 的整数'
      });
      const span = Number(res?.value);
      (schema.value || []).forEach((x) => {
        if (set.has(x.uid)) x.span = span;
      });
      pushSnapshot();
    } catch {
      // cancelled
    }
  };

  return {
    isSelected,
    selectedCount,
    onCanvasItemClick,
    removeField,
    removeFieldByUid,
    batchRemoveSelected,
    batchSetDisabled,
    batchSetSpan
  };
};

