import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import type { FormCanvasGroup, FormCrossFieldRule, FormFieldSchema } from '@/types/formBuilder';

type DesignerBase = { name: string; code: string; status: number };

type SnapshotState = {
  base: DesignerBase;
  schema: FormFieldSchema[];
  crossFieldRules: FormCrossFieldRule[];
  canvasGroups: FormCanvasGroup[];
  selectedUids: string[];
  selectedUid: string;
};

type Snapshot = SnapshotState & { signature: string };

type UseDesignerSnapshotsOptions = {
  base: Ref<DesignerBase>;
  schema: Ref<FormFieldSchema[]>;
  crossFieldRules: Ref<FormCrossFieldRule[]>;
  canvasGroups: Ref<FormCanvasGroup[]>;
  selectedUid: Ref<string>;
  selectedUids: Ref<Set<string>>;
  rebuildBucketsFromSchema: () => void;
  maxSize?: number;
};

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const buildSnapshotSignature = (state: SnapshotState) =>
  JSON.stringify({
    base: state.base,
    schema: state.schema,
    crossFieldRules: state.crossFieldRules || [],
    canvasGroups: state.canvasGroups || [],
    selectedUids: state.selectedUids || [],
    selectedUid: state.selectedUid || ''
  });

export const useDesignerSnapshots = ({
  base,
  schema,
  crossFieldRules,
  canvasGroups,
  selectedUid,
  selectedUids,
  rebuildBucketsFromSchema,
  maxSize = 60
}: UseDesignerSnapshotsOptions) => {
  const undoStack = ref<Snapshot[]>([]);
  const redoStack = ref<Snapshot[]>([]);
  const restoring = ref(false);

  let snapshotTimer: ReturnType<typeof setTimeout> | null = null;

  const makeSnapshot = (): Snapshot => {
    const state: SnapshotState = {
      base: deepClone(base.value),
      schema: deepClone(schema.value),
      crossFieldRules: deepClone(crossFieldRules.value),
      canvasGroups: deepClone(canvasGroups.value),
      selectedUids: Array.from(selectedUids.value),
      selectedUid: selectedUid.value
    };
    return {
      ...state,
      signature: buildSnapshotSignature(state)
    };
  };

  const initSnapshots = () => {
    undoStack.value = [makeSnapshot()];
    redoStack.value = [];
  };

  const pushSnapshot = () => {
    if (restoring.value) return;
    const cur = makeSnapshot();
    const last = undoStack.value[undoStack.value.length - 1];
    if (!last) {
      undoStack.value.push(cur);
      redoStack.value = [];
      return;
    }
    if (last.signature === cur.signature) return;
    undoStack.value.push(cur);
    if (undoStack.value.length > maxSize) undoStack.value.shift();
    redoStack.value = [];
  };

  const pushSnapshotDebounced = () => {
    if (restoring.value) return;
    if (snapshotTimer) clearTimeout(snapshotTimer);
    snapshotTimer = setTimeout(() => pushSnapshot(), 250);
  };

  const restoreSnapshot = (snap: Snapshot) => {
    restoring.value = true;
    base.value = deepClone(snap.base);
    schema.value = deepClone(snap.schema);
    crossFieldRules.value = deepClone(snap.crossFieldRules || []);
    canvasGroups.value = deepClone(snap.canvasGroups || []);
    rebuildBucketsFromSchema();
    selectedUids.value = new Set(snap.selectedUids || []);
    selectedUid.value = snap.selectedUid;
    setTimeout(() => {
      restoring.value = false;
    }, 0);
  };

  const canUndo = computed(() => undoStack.value.length > 1);
  const canRedo = computed(() => redoStack.value.length > 0);

  const undo = () => {
    if (!canUndo.value) return;
    const cur = undoStack.value.pop();
    if (!cur) return;
    redoStack.value.push(cur);
    const prev = undoStack.value[undoStack.value.length - 1];
    if (!prev) return;
    restoreSnapshot(prev);
  };

  const redo = () => {
    if (!canRedo.value) return;
    const next = redoStack.value.pop();
    if (!next) return;
    undoStack.value.push(next);
    restoreSnapshot(next);
  };

  const disposeSnapshots = () => {
    if (!snapshotTimer) return;
    clearTimeout(snapshotTimer);
    snapshotTimer = null;
  };

  return {
    restoring,
    canUndo,
    canRedo,
    initSnapshots,
    pushSnapshot,
    pushSnapshotDebounced,
    undo,
    redo,
    disposeSnapshots
  };
};
