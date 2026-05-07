import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import type { FormCanvasGroup, FormFieldSchema } from '@/types/formBuilder';

type UseDesignerDiffOptions = {
  schema: Ref<FormFieldSchema[]>;
  publishedSchema: Ref<FormFieldSchema[] | null>;
  canvasGroups: Ref<FormCanvasGroup[]>;
};

type DiffItem = { kind: 'added' | 'removed'; key: string; label: string };
type DiffGroup = { id: string; title: string };
type DiffFieldMoved = {
  field: string;
  label: string;
  fromId: string;
  toId: string;
  fromTitle: string;
  toTitle: string;
};

export const useDesignerDiff = ({ schema, publishedSchema, canvasGroups }: UseDesignerDiffOptions) => {
  const diffOpen = ref(false);

  const diffItems = computed<DiffItem[]>(() => {
    const pub = Array.isArray(publishedSchema.value) ? publishedSchema.value : [];
    const draft = Array.isArray(schema.value) ? schema.value : [];
    const pubMap = new Map<string, any>();
    pub.forEach((f: any) => {
      const k = String(f?.field || '').trim();
      if (k) pubMap.set(k, f);
    });
    const draftMap = new Map<string, any>();
    draft.forEach((f: any) => {
      const k = String(f?.field || '').trim();
      if (k) draftMap.set(k, f);
    });

    const allKeys = Array.from(new Set([...pubMap.keys(), ...draftMap.keys()])).sort();
    const out: DiffItem[] = [];

    allKeys.forEach((k) => {
      const p = pubMap.get(k);
      const d = draftMap.get(k);
      if (!p && d) {
        out.push({ kind: 'added', key: k, label: String(d?.label || '') });
        return;
      }
      if (p && !d) {
        out.push({ kind: 'removed', key: k, label: String(p?.label || '') });
        return;
      }
    });
    return out;
  });

  const diffAdded = computed(() => diffItems.value.filter((x) => x.kind === 'added'));
  const diffRemoved = computed(() => diffItems.value.filter((x) => x.kind === 'removed'));

  const groupTitleMapDraft = computed(() => {
    const map = new Map<string, string>();
    (canvasGroups.value || []).forEach((g) => {
      const id = String((g as any)?.id || '').trim();
      const title = String((g as any)?.title || '').trim();
      if (id) map.set(id, title || id);
    });
    return map;
  });

  const getGroupId = (f: any) => String(f?.groupId || '').trim();
  const groupTitle = (id: string) => {
    if (!id) return '未分组';
    return groupTitleMapDraft.value.get(id) || id;
  };

  const diffGroups = computed(() => {
    const pub = Array.isArray(publishedSchema.value) ? publishedSchema.value : [];
    const draft = Array.isArray(schema.value) ? schema.value : [];
    const pubGroups = new Set(pub.map((f: any) => getGroupId(f)).filter(Boolean));
    const draftGroups = new Set<string>();
    (canvasGroups.value || []).forEach((g) => {
      const id = String((g as any)?.id || '').trim();
      if (id) draftGroups.add(id);
    });
    draft.forEach((f: any) => {
      const id = getGroupId(f);
      if (id) draftGroups.add(id);
    });

    const added: DiffGroup[] = Array.from(draftGroups)
      .filter((id) => !pubGroups.has(id))
      .sort()
      .map((id) => ({ id, title: groupTitle(id) }));
    const removed: DiffGroup[] = Array.from(pubGroups)
      .filter((id) => !draftGroups.has(id))
      .sort()
      .map((id) => ({ id, title: id }));

    const pubMap = new Map<string, any>();
    pub.forEach((f: any) => {
      const k = String(f?.field || '').trim();
      if (k) pubMap.set(k, f);
    });
    const moved: DiffFieldMoved[] = [];
    draft.forEach((f: any) => {
      const k = String(f?.field || '').trim();
      if (!k) return;
      const pf = pubMap.get(k);
      if (!pf) return;
      const fromId = getGroupId(pf);
      const toId = getGroupId(f);
      if (fromId === toId) return;
      moved.push({
        field: k,
        label: String(f?.label || pf?.label || ''),
        fromId,
        toId,
        fromTitle: fromId ? fromId : '未分组',
        toTitle: toId ? groupTitle(toId) : '未分组'
      });
    });
    moved.sort((a, b) => a.field.localeCompare(b.field));

    return { added, removed, moved };
  });

  const diffGroupAdded = computed(() => diffGroups.value.added);
  const diffGroupRemoved = computed(() => diffGroups.value.removed);
  const diffFieldMoved = computed(() => diffGroups.value.moved);

  const diffHasAny = computed(() => {
    return (
      diffAdded.value.length > 0 ||
      diffRemoved.value.length > 0 ||
      diffGroupAdded.value.length > 0 ||
      diffGroupRemoved.value.length > 0 ||
      diffFieldMoved.value.length > 0
    );
  });

  const openDiff = () => {
    diffOpen.value = true;
  };

  return {
    diffOpen,
    diffHasAny,
    diffAdded,
    diffRemoved,
    diffGroupAdded,
    diffGroupRemoved,
    diffFieldMoved,
    openDiff
  };
};

