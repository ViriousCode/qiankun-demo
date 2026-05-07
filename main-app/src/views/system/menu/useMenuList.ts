import { ref, reactive, computed, onMounted } from 'vue';
import { getMenuList, type Menu } from '@/api/menu';
import { getAppList } from '@/api/app';
import { APP_DISPLAY_NAME } from './constants';

export interface AppOption {
  label: string;
  value: string;
  iconName?: string;
}

function filterTreeByApp(nodes: Menu[], filterApp: string): Menu[] {
  if (!filterApp) return nodes;
  const filterTree = (list: Menu[]): Menu[] => {
    return list
      .map((node) => ({ ...node }))
      .filter((node) => {
        if (node.children && node.children.length > 0) {
          node.children = filterTree(node.children);
        }
        return node.app === filterApp || (node.children && node.children.length > 0);
      });
  };
  return filterTree(nodes);
}

function filterTreeByTitle(nodes: Menu[], keyword: string): Menu[] {
  const k = keyword.trim().toLowerCase();
  if (!k) return nodes;
  const walk = (list: Menu[]): Menu[] => {
    const out: Menu[] = [];
    list.forEach((node) => {
      const clone = { ...node };
      const children = clone.children ? walk(clone.children) : [];
      const selfMatch = (node.title || '').toLowerCase().includes(k);
      if (selfMatch || children.length > 0) {
        clone.children = children;
        out.push(clone);
      }
    });
    return out;
  };
  return walk(nodes);
}

function isAppShellNode(node: Menu): boolean {
  if (node.parentId != null) return false;
  if (node.type !== 'directory') return false;
  if ((node.path || '').trim()) return false;
  const children = node.children || [];
  if (children.length === 0) return false;
  // 应用壳节点的子菜单一般都属于同一个 app
  return children.every((child) => child.app === node.app);
}

function unwrapAppShellNodes(nodes: Menu[]): Menu[] {
  return nodes.flatMap((node) => (isAppShellNode(node) ? node.children || [] : [node]));
}

function excludePersonalCenter(nodes: Menu[]): Menu[] {
  const walk = (list: Menu[]): Menu[] => {
    return list
      .filter((node) => {
        const isPersonalCenterRoot =
          node.app === 'main' && (node.title || '').trim() === '个人中心';
        return !isPersonalCenterRoot;
      })
      .map((node) => ({
        ...node,
        children: node.children ? walk(node.children) : []
      }));
  };
  return walk(nodes);
}

export function useMenuList() {
  const loading = ref(false);
  const menuData = ref<Menu[]>([]);
  const appOptions = ref<AppOption[]>([]);
  const rawAppList = ref<any[]>([]);

  const queryParams = reactive({
    menuName: '',
    /** 默认主应用，且不允许清空 */
    filterApp: 'main'
  });

  const filteredMenuData = computed(() => {
    let tree = menuData.value;
    tree = filterTreeByApp(tree, queryParams.filterApp);
    tree = filterTreeByTitle(tree, queryParams.menuName);
    return tree;
  });

  const fetchData = async () => {
    loading.value = true;
    try {
      const res = await getMenuList();
      menuData.value = excludePersonalCenter(unwrapAppShellNodes(res || []));
    } finally {
      loading.value = false;
    }
  };

  const loadAppOptions = async () => {
    try {
      const res = await getAppList();
      const subApps = res || [];
      rawAppList.value = subApps;
      appOptions.value = [
        { label: APP_DISPLAY_NAME.main ?? '主系统', value: 'main' },
        ...subApps.map((app: any) => ({
          label: app.shortName || app.name,
          value: app.name,
          iconName: app.iconName || ''
        }))
      ];
    } catch (e) {
      console.error('加载应用列表失败', e);
    }
  };

  /** 重新拉取菜单树；名称与应用筛选由 filteredMenuData 客户端计算 */
  const handleSearch = () => {
    return fetchData();
  };

  const resetQuery = () => {
    queryParams.menuName = '';
    queryParams.filterApp = 'main';
    fetchData();
  };

  onMounted(() => {
    loadAppOptions();
    fetchData();
  });

  return {
    loading,
    menuData,
    appOptions,
    rawAppList,
    queryParams,
    filteredMenuData,
    fetchData,
    loadAppOptions,
    handleSearch,
    resetQuery
  };
}
