import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAppList, type MicroApp } from '@/api/app';
import type { WorkbenchItem } from '@/api/workbench';
import { ElMessage } from 'element-plus';

function mapAppToWorkbenchItem(app: MicroApp): WorkbenchItem {
  return {
    id: app.id,
    title: app.shortName || app.name,
    category: '业务系统',
    iconName: app.iconName || '',
    targetType: 'internal',
    path: app.activeRule,
    description: app.description || '',
    sort: app.sort,
    createTime: app.createTime
  };
}

export function useWorkbenchApps() {
  const router = useRouter();
  const loading = ref(false);
  const rawList = ref<WorkbenchItem[]>([]);

  const groupedApps = computed(() => {
    const groups: Record<string, WorkbenchItem[]> = {};
    rawList.value.forEach((item) => {
      const cat = item.category || '未分类';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  });

  const flatApps = computed(() => {
    const list: WorkbenchItem[] = [];
    Object.values(groupedApps.value).forEach((arr) => list.push(...arr));
    return list.slice(0, 10);
  });

  const fetchData = async () => {
    loading.value = true;
    try {
      const res = await getAppList();
      rawList.value = (res ?? [])
        .filter((item) => item.showInWorkbench && Number(item.status) === 1)
        .sort((a, b) => {
          const aSort = Number(a.sort ?? Number.MAX_SAFE_INTEGER);
          const bSort = Number(b.sort ?? Number.MAX_SAFE_INTEGER);
          return aSort - bSort;
        })
        .map(mapAppToWorkbenchItem);
    } catch {
      rawList.value = [];
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
      const url = item.path.startsWith('http') ? item.path : `https://${item.path}`;
      window.open(url, '_blank');
    } else {
      router.push(item.path);
    }
  };

  onMounted(() => {
    fetchData();
  });

  return {
    loading,
    rawList,
    groupedApps,
    flatApps,
    fetchData,
    handleJump
  };
}
