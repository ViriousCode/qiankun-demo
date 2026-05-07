import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getAppList, updateApp, type MicroApp } from '@/api/app';
import type { WorkbenchItem } from '@/api/workbench';
import { MY_APPS_LIMIT, STORAGE_KEY_MY_APP_IDS } from './constants';

function mapAppToWorkbenchItem(app: MicroApp): WorkbenchItem {
  return {
    id: app.id,
    title: app.shortName || app.name,
    category: '业务系统',
    iconName: app.iconName || '',
    targetType: 'internal',
    path: app.activeRule,
    description: app.code || '',
    sort: app.id,
    createTime: app.createTime
  };
}

function getItemKey(app: MicroApp): string {
  return app.id != null ? String(app.id) : app.name;
}

function safeParseMyAppIds(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((v) => String(v)).filter(Boolean);
  } catch {
    return [];
  }
}

function writeMyAppIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY_MY_APP_IDS, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

function buildSortMap(ids: string[]): Map<string, number> {
  // 使用连续正整数（越小越靠前），便于后端排序
  return new Map(ids.map((id, idx) => [id, idx + 1]));
}

export function useProfileAppsList() {
  const router = useRouter();
  const loading = ref(false);
  const rawApps = ref<MicroApp[]>([]);
  const draftApps = ref<MicroApp[]>([]);
  const editMode = ref(false);
  const myAppIds = ref<string[]>(safeParseMyAppIds(localStorage.getItem(STORAGE_KEY_MY_APP_IDS)));

  function cloneApps(list: MicroApp[]) {
    return list.map((item) => ({ ...item }));
  }

  const currentApps = computed(() => (editMode.value ? draftApps.value : rawApps.value));

  const sortedApps = computed(() => {
    const list = currentApps.value.filter((item) => Number(item.status) !== 0);
    return list.sort((a, b) => {
      const aSort = a.id ?? Number.MAX_SAFE_INTEGER;
      const bSort = b.id ?? Number.MAX_SAFE_INTEGER;
      return aSort - bSort;
    });
  });

  const workbenchApps = computed(() => {
    const workbenchList = sortedApps.value
      .filter((item) => item.showInWorkbench)
      .map(mapAppToWorkbenchItem);

    const order = myAppIds.value;
    if (order.length === 0) return workbenchList.slice(0, MY_APPS_LIMIT);

    const indexMap = new Map(order.map((id, idx) => [id, idx]));
    const withIndex = workbenchList.map((item) => ({
      item,
      idx: indexMap.get(String(item.id)) ?? Number.MAX_SAFE_INTEGER
    }));
    withIndex.sort((a, b) => a.idx - b.idx);
    return withIndex.map((x) => x.item);
  });

  const allApps = computed(() => sortedApps.value.map(mapAppToWorkbenchItem));

  const workbenchAppKeys = computed(() =>
    workbenchApps.value.map((item) => (item.id != null ? String(item.id) : item.title))
  );

  const fetchData = async () => {
    loading.value = true;
    try {
      const res = await getAppList();
      rawApps.value = res ?? [];
      if (myAppIds.value.length === 0) {
        // 首次进入：用当前展示应用顺序作为默认排序（截断到 MY_APPS_LIMIT）
        const defaultIds = rawApps.value
          .filter((item) => item.showInWorkbench && Number(item.status) !== 0 && item.id != null)
          .map((item) => String(item.id))
          .slice(0, MY_APPS_LIMIT);
        if (defaultIds.length > 0) {
          myAppIds.value = defaultIds;
          writeMyAppIds(defaultIds);
        }
      }
      if (!editMode.value) {
        draftApps.value = [];
      }
    } catch {
      rawApps.value = [];
    } finally {
      loading.value = false;
    }
  };

  const handleJump = (item: WorkbenchItem) => {
    if (!item.path) {
      ElMessage.warning('该应用未配置跳转路径');
      return;
    }
    if (item.targetType === 'external') {
      const url = item.path.startsWith('http') ? item.path : `http://${item.path}`;
      window.open(url, '_blank');
    } else {
      router.push(item.path);
    }
  };

  function updateDraftWorkbenchFlag(id: number, visible: boolean) {
    draftApps.value = draftApps.value.map((item) =>
      item.id === id ? { ...item, showInWorkbench: visible } : item
    );

    const key = String(id);
    if (visible) {
      if (!myAppIds.value.includes(key)) {
        myAppIds.value = [...myAppIds.value, key];
        writeMyAppIds(myAppIds.value);
      }
    } else {
      if (myAppIds.value.includes(key)) {
        myAppIds.value = myAppIds.value.filter((x) => x !== key);
        writeMyAppIds(myAppIds.value);
      }
    }
  }

  function findAppByItem(item: WorkbenchItem, list: MicroApp[]): MicroApp | undefined {
    return list.find(
      (app) => app.id === item.id || app.name === item.title || app.shortName === item.title
    );
  }

  const syncWorkbenchChanges = async () => {
    // 1) 需要展示在工作台的应用顺序（拖拽结果）
    const orderedWorkbenchIds = myAppIds.value.filter((id) =>
      draftApps.value.some(
        (a) => String(a.id) === id && Boolean(a.showInWorkbench) && Number(a.status) !== 0
      )
    );
    const sortMap = buildSortMap(orderedWorkbenchIds);

    const changedApps = draftApps.value.filter((draft) => {
      const source = findAppByItem(mapAppToWorkbenchItem(draft), rawApps.value);
      return source && Boolean(source.showInWorkbench) !== Boolean(draft.showInWorkbench);
    });

    const sortChangedApps = draftApps.value.filter((draft) => {
      if (!draft.id) return false;
      if (!draft.showInWorkbench) return false;
      const desired = sortMap.get(String(draft.id));
      if (desired == null) return false;
      const current = Number(draft.sort ?? 0);
      return current !== desired;
    });

    if (changedApps.length === 0 && sortChangedApps.length === 0) {
      editMode.value = false;
      draftApps.value = [];
      ElMessage.success('已完成');
      return;
    }

    loading.value = true;
    try {
      // 先把 draft 内的 sort 同步成本地排序（用于 UI 立即一致）
      if (sortMap.size > 0) {
        draftApps.value = draftApps.value.map((app) => {
          if (!app.id) return app;
          const desired = sortMap.get(String(app.id));
          if (desired == null) return app;
          return { ...app, sort: desired };
        });
      }

      await Promise.all([
        ...changedApps.map((app) =>
          updateApp(app.id as number, { ...app, showInWorkbench: Boolean(app.showInWorkbench) })
        ),
        ...sortChangedApps.map((app) => {
          const desired = sortMap.get(String(app.id));
          return updateApp(app.id as number, { ...app, sort: desired });
        })
      ]);
      rawApps.value = cloneApps(draftApps.value);
      editMode.value = false;
      draftApps.value = [];
      ElMessage.success('工作台展示应用顺序已同步');
    } catch {
      ElMessage.error('同步失败，请重试');
    } finally {
      loading.value = false;
    }
  };

  const toggleEditMode = async () => {
    if (!editMode.value) {
      draftApps.value = cloneApps(rawApps.value);
      editMode.value = true;
      return;
    }
    await syncWorkbenchChanges();
  };

  const updateWorkbenchVisibility = (item: WorkbenchItem, visible: boolean) => {
    const app = findAppByItem(item, draftApps.value);
    if (!app?.id) {
      ElMessage.warning('未找到对应的应用配置');
      return;
    }

    if (Boolean(app.showInWorkbench) === visible) {
      return;
    }
    updateDraftWorkbenchFlag(app.id, visible);
  };

  /** 编辑模式下：上半部分点击移除工作台展示，下半部分点击加入工作台展示；非编辑模式跳转 */
  const handleAppClick = (item: WorkbenchItem, section: 'my' | 'all') => {
    if (editMode.value) {
      if (section === 'my') updateWorkbenchVisibility(item, false);
      else updateWorkbenchVisibility(item, true);
    } else {
      handleJump(item);
    }
  };

  /** 编辑模式下：拖拽后更新「工作台展示应用」顺序（本地持久化） */
  const reorderWorkbenchApps = (ordered: WorkbenchItem[]) => {
    const ids = ordered.map((x) => (x.id != null ? String(x.id) : '')).filter(Boolean);
    myAppIds.value = ids;
    writeMyAppIds(ids);
  };

  onMounted(() => {
    fetchData();
  });

  return {
    loading,
    editMode,
    workbenchApps,
    allApps,
    workbenchAppKeys,
    fetchData,
    handleJump,
    toggleEditMode,
    handleAppClick,
    reorderWorkbenchApps
  };
}
