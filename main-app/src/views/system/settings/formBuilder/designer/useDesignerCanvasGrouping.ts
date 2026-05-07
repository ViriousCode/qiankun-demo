import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import type { FormCanvasGroup, FormFieldSchema } from '@/types/formBuilder';
import { confirmInAppMain, promptInAppMain } from '@/utils/messageBox';

type UseDesignerCanvasGroupingOptions = {
  schema: Ref<FormFieldSchema[]>;
  canvasGroups: Ref<FormCanvasGroup[]>;
  canvasKeyword: Ref<string>;
};

export const useDesignerCanvasGrouping = ({
  schema,
  canvasGroups,
  canvasKeyword
}: UseDesignerCanvasGroupingOptions) => {
  const UNGROUPED_ID = '__ungrouped__';
  const canvasBuckets = ref<Record<string, FormFieldSchema[]>>({ [UNGROUPED_ID]: [] });
  const syncingFromBuckets = ref(false);

  const normalizeCanvasGroups = () => {
    const list = Array.isArray(canvasGroups.value) ? canvasGroups.value : [];
    const seen = new Set<string>();
    canvasGroups.value = list
      .filter((g) => g && typeof g === 'object')
      .map((g) => ({
        id: String((g as any).id || '').trim(),
        title: String((g as any).title || '').trim(),
        collapsed: Boolean((g as any).collapsed)
      }))
      .filter((g) => {
        if (!g.id || seen.has(g.id)) return false;
        seen.add(g.id);
        return true;
      })
      .map((g) => ({ ...g, title: g.title || g.id }));
  };

  const ensureGroup = (id: string, title?: string) => {
    const gid = String(id || '').trim();
    if (!gid || gid === UNGROUPED_ID) return;
    if ((canvasGroups.value || []).some((g) => g.id === gid)) return;
    canvasGroups.value = [
      ...(canvasGroups.value || []),
      { id: gid, title: String(title || gid).trim() || gid, collapsed: false }
    ];
  };

  const rebuildBucketsFromSchema = () => {
    if (syncingFromBuckets.value) return;
    normalizeCanvasGroups();
    const buckets: Record<string, FormFieldSchema[]> = { [UNGROUPED_ID]: [] };
    (canvasGroups.value || []).forEach((g) => (buckets[g.id] = []));
    for (const f of schema.value || []) {
      const gid = String((f as any).groupId || '').trim();
      if (gid) ensureGroup(gid);
    }
    (canvasGroups.value || []).forEach((g) => (buckets[g.id] = buckets[g.id] || []));

    for (const f of schema.value || []) {
      const gid = String((f as any).groupId || '').trim();
      const target = gid && buckets[gid] ? gid : UNGROUPED_ID;
      if (!buckets[target]) buckets[target] = [];
      buckets[target]!.push(f);
    }
    canvasBuckets.value = buckets;
  };

  const rebuildSchemaFromBuckets = () => {
    if (syncingFromBuckets.value) return;
    syncingFromBuckets.value = true;
    const next: FormFieldSchema[] = [];
    const buckets = canvasBuckets.value || {};
    const pushList = (gid: string) => {
      const list = Array.isArray(buckets[gid]) ? buckets[gid] : [];
      list.forEach((f) => {
        if (gid === UNGROUPED_ID) delete (f as any).groupId;
        else (f as any).groupId = gid;
        next.push(f);
      });
    };
    pushList(UNGROUPED_ID);
    (canvasGroups.value || []).forEach((g) => pushList(g.id));
    schema.value = next;
    setTimeout(() => {
      syncingFromBuckets.value = false;
    }, 0);
  };

  const canvasKeywordNormalized = computed(() =>
    String(canvasKeyword.value || '')
      .trim()
      .toLowerCase()
  );
  const visibleUidSet = computed<Set<string> | null>(() => {
    const q = canvasKeywordNormalized.value;
    if (!q) return null;
    const set = new Set<string>();
    (schema.value || []).forEach((f) => {
      const hay = `${f.label || ''} ${f.field || ''} ${f.type || ''}`.toLowerCase();
      if (hay.includes(q)) set.add(String(f.uid || ''));
    });
    return set;
  });

  const canvasItemVisible = (f: FormFieldSchema) => {
    const visibleSet = visibleUidSet.value;
    if (!visibleSet) return true;
    return visibleSet.has(String(f.uid || ''));
  };
  const canvasVisibleCount = computed(() => visibleUidSet.value?.size ?? schema.value.length);

  const groupVisibleCountMap = computed<Record<string, number>>(() => {
    const buckets = canvasBuckets.value || { [UNGROUPED_ID]: [] };
    const visibleSet = visibleUidSet.value;
    const result: Record<string, number> = {};
    Object.keys(buckets).forEach((gid) => {
      const list = Array.isArray(buckets[gid]) ? buckets[gid] : [];
      if (!visibleSet) {
        result[gid] = list.length;
        return;
      }
      result[gid] = list.reduce((acc, item) => (visibleSet.has(item.uid) ? acc + 1 : acc), 0);
    });
    return result;
  });

  const groupedCanvas = computed(() => {
    const groups = (canvasGroups.value || []).map((g) => ({
      id: g.id,
      title: g.title,
      collapsed: Boolean(g.collapsed)
    }));
    const buckets = canvasBuckets.value || { [UNGROUPED_ID]: [] };
    const all = [{ id: UNGROUPED_ID, title: '未分组', collapsed: false }, ...groups].map((g) => {
      const list: FormFieldSchema[] = Array.isArray(buckets[g.id]) ? (buckets[g.id] as FormFieldSchema[]) : [];
      const visibleCount = groupVisibleCountMap.value[g.id] || 0;
      const hasSearch = Boolean(canvasKeywordNormalized.value);
      const effectiveCollapsed = g.id !== UNGROUPED_ID && g.collapsed && !(hasSearch && visibleCount > 0);
      return {
        ...g,
        totalCount: list.length,
        visibleCount,
        effectiveCollapsed
      };
    });
    return all;
  });

  const toggleGroupCollapsed = (gid: string) => {
    if (gid === UNGROUPED_ID) return false;
    const g = (canvasGroups.value || []).find((x) => x.id === gid);
    if (!g) return false;
    g.collapsed = !g.collapsed;
    return true;
  };

  const promptCreateGroup = async () => {
    try {
      const res: any = await promptInAppMain('请输入分组名称', '新建分组', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '例如：基础信息'
      });
      const title = String(res?.value || '').trim();
      if (!title) return false;
      const id = `g_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
      ensureGroup(id, title);
      canvasBuckets.value = { ...(canvasBuckets.value || { [UNGROUPED_ID]: [] }), [id]: [] };
      return true;
    } catch {
      return false;
    }
  };

  const renameGroup = async (gid: string) => {
    if (gid === UNGROUPED_ID) return false;
    const g = (canvasGroups.value || []).find((x) => x.id === gid);
    if (!g) return false;
    try {
      const res: any = await promptInAppMain('请输入新的分组名称', '重命名分组', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: g.title || ''
      });
      const title = String(res?.value || '').trim();
      if (!title) return false;
      g.title = title;
      return true;
    } catch {
      return false;
    }
  };

  const removeGroup = async (gid: string) => {
    if (gid === UNGROUPED_ID) return false;
    const g = (canvasGroups.value || []).find((x) => x.id === gid);
    if (!g) return false;
    const count = (canvasBuckets.value?.[gid] || []).length;
    try {
      await confirmInAppMain(
        `确认删除分组「${g.title}」？该分组下的 ${count} 个字段会移动到「未分组」。`,
        '提示',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      );
    } catch {
      return false;
    }
    const moved = canvasBuckets.value?.[gid] || [];
    canvasBuckets.value[UNGROUPED_ID] = [...(canvasBuckets.value[UNGROUPED_ID] || []), ...(moved || [])];
    delete canvasBuckets.value[gid];
    canvasGroups.value = (canvasGroups.value || []).filter((x) => x.id !== gid);
    rebuildSchemaFromBuckets();
    return true;
  };

  return {
    UNGROUPED_ID,
    canvasBuckets,
    syncingFromBuckets,
    rebuildBucketsFromSchema,
    rebuildSchemaFromBuckets,
    groupVisibleCountMap,
    groupedCanvas,
    canvasItemVisible,
    canvasVisibleCount,
    toggleGroupCollapsed,
    promptCreateGroup,
    renameGroup,
    removeGroup
  };
};

