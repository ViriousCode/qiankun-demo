import { ref, reactive, computed, type Ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormRules } from 'element-plus';
import { addMenu, updateMenu, deleteMenu, type Menu } from '@/api/menu';
import { useUserStore } from '@/store/user';
import { MENU_RULES } from './constants';

const MAIN_ACTIVE_RULE_FALLBACK = '/platform';

function emptyMenu(): Menu {
  return {
    parentId: null,
    title: '',
    path: '',
    icon: '',
    sort: 1,
    permission: '',
    apiIds: [],
    type: 'menu',
    app: 'main',
    hidden: false,
    menuForm: 'route',
    openMode: 'current'
  };
}

function buildMenuOptions(nodes: Menu[], editingId: number | undefined, selfId?: number) {
  const result: any[] = [];
  nodes.forEach((node) => {
    if (node.type === 'button') return;
    const newNode: any = { ...node };
    if (editingId != null && selfId === node.id) newNode.disabled = true;
    if (newNode.children && newNode.children.length > 0) {
      newNode.children = buildMenuOptions(newNode.children, editingId, selfId);
    } else {
      newNode.children = [];
    }
    result.push(newNode);
  });
  return result;
}

function normalizeActiveRule(rule?: string): string {
  if (!rule) return '';
  const trimmed = rule.trim();
  if (!trimmed || trimmed === '/') return '';
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, '');
}

function buildPermissionPrefixByActiveRule(activeRule?: string): string {
  const normalizedRule = normalizeActiveRule(activeRule);
  if (!normalizedRule) return '';
  return `${normalizedRule.replace(/^\/+/, '')}:`;
}

function composePathWithPrefix(prefix: string, suffix: string): string {
  const p = prefix.trim();
  const s = suffix.trim();
  if (!p) return s;
  if (!s) return p;
  if (s === p || s.startsWith(`${p}/`)) return s;
  return `${p.replace(/\/+$/, '')}${s.startsWith('/') ? '' : '/'}${s}`;
}

function buildChildPermissionPrefix(permission?: string): string {
  const p = (permission || '').trim();
  if (!p) return '';
  return p.endsWith(':') ? p : `${p}:`;
}

function stripPermissionPrefix(permission: string, prefix: string): string | null {
  if (!permission) return '';
  if (!prefix) return null;
  return permission.startsWith(prefix) ? permission.slice(prefix.length) : null;
}

function normalizePathSuffixByActiveRule(path: string, activeRule: string): string {
  const rawPath = path.trim();
  if (!rawPath || !activeRule) return rawPath;
  let candidate = rawPath;
  const matchPrefix = `${activeRule}/`;
  while (candidate === activeRule || candidate.startsWith(matchPrefix)) {
    const stripped = candidate.slice(activeRule.length);
    candidate = stripped.startsWith('/') || !stripped ? stripped : `/${stripped}`;
  }
  return candidate;
}

export function useMenuForm(
  menuData: Ref<Menu[]>,
  queryParams: { filterApp: string },
  fetchData: () => Promise<void>,
  rawAppList: Ref<any[]>
) {
  const userStore = useUserStore();
  const isEdit = ref(false);
  const isAddChild = ref(false);
  const addChildPathPrefix = ref('');
  const addChildPermissionPrefix = ref('');
  const dialogVisible = ref(false);
  const dialogTitle = ref('新增菜单');
  const submitLoading = ref(false);
  const permissionSuffix = ref('');
  /** 旧数据 permission 与当前应用前缀不匹配时，按整段输入保留 */
  const permissionInputMode = ref<'platform' | 'legacy'>('platform');
  const formData = reactive<Menu>(emptyMenu());
  const rules: FormRules = MENU_RULES;

  const menuOptions = computed(() => {
    const editingId = isEdit.value ? formData.id : undefined;
    return [
      { id: null, title: '主目录', children: [], disabled: false },
      ...buildMenuOptions(menuData.value, editingId, formData.id)
    ];
  });

  const appActiveRulePrefix = computed(() => {
    if (!formData.app || formData.app === 'main') return MAIN_ACTIVE_RULE_FALLBACK;
    const targetApp = rawAppList.value.find((app: any) => app.name === formData.app);
    return normalizeActiveRule(targetApp?.activeRule) || MAIN_ACTIVE_RULE_FALLBACK;
  });
  const appPermissionPrefix = computed(() =>
    buildPermissionPrefixByActiveRule(appActiveRulePrefix.value)
  );
  const currentAppPrefix = computed(() =>
    isAddChild.value && addChildPathPrefix.value
      ? addChildPathPrefix.value
      : appActiveRulePrefix.value
  );
  const currentPermissionPrefix = computed(() =>
    isAddChild.value && addChildPermissionPrefix.value
      ? addChildPermissionPrefix.value
      : appPermissionPrefix.value
  );

  const resolveFullMenuPath = (menu: Menu): string => {
    const menuPath = (menu.path || '').trim();
    const appPrefix =
      menu.app === 'main'
        ? MAIN_ACTIVE_RULE_FALLBACK
        : normalizeActiveRule(
            rawAppList.value.find((app: any) => app.name === menu.app)?.activeRule
          ) || MAIN_ACTIVE_RULE_FALLBACK;
    if (!menuPath) return appPrefix;
    if (menuPath === appPrefix || menuPath.startsWith(`${appPrefix}/`)) return menuPath;
    return composePathWithPrefix(appPrefix, menuPath);
  };

  const resetForm = () => {
    Object.assign(formData, emptyMenu());
    permissionSuffix.value = '';
    permissionInputMode.value = 'platform';
    isAddChild.value = false;
    addChildPathPrefix.value = '';
    addChildPermissionPrefix.value = '';
  };

  const handleAdd = (row?: Menu) => {
    resetForm();
    isEdit.value = false;
    dialogTitle.value = '新增菜单';
    if (row?.id != null) {
      isAddChild.value = true;
      formData.parentId = row.id;
      if (row.app) formData.app = row.app;
      addChildPathPrefix.value = resolveFullMenuPath(row);
      addChildPermissionPrefix.value =
        buildChildPermissionPrefix(row.permission) || appPermissionPrefix.value;
    }
    if (queryParams.filterApp && (!row || row.id == null)) {
      formData.app = queryParams.filterApp;
    }
    permissionInputMode.value = 'platform';
    permissionSuffix.value = '';
    dialogVisible.value = true;
  };

  const handleEdit = (row: Menu) => {
    resetForm();
    isEdit.value = true;
    dialogTitle.value = '编辑菜单';
    const { children: _c, ...rest } = row;
    Object.assign(formData, emptyMenu(), rest, {
      menuForm: row.menuForm ?? 'route',
      openMode: row.openMode ?? 'current',
      apiIds: Array.isArray(row.apiIds) ? [...row.apiIds] : [],
      hidden: row.hidden === true
    });
    formData.path = normalizePathSuffixByActiveRule(formData.path || '', currentAppPrefix.value);
    const p = (row.permission || '').trim();
    const stripped = stripPermissionPrefix(p, currentPermissionPrefix.value);
    if (stripped != null) {
      permissionInputMode.value = 'platform';
      permissionSuffix.value = stripped;
    } else if (p.includes(':')) {
      permissionInputMode.value = 'legacy';
      permissionSuffix.value = p;
    } else {
      permissionInputMode.value = 'platform';
      permissionSuffix.value = p;
    }
    dialogVisible.value = true;
  };

  const handleDelete = async (row: Menu) => {
    if (row.id == null) return;
    await deleteMenu(row.id);
    ElMessage.success('删除成功');
    await fetchData();
    await userStore.refreshAndSync();
  };

  const applyPermissionFromSuffix = () => {
    if (permissionInputMode.value === 'legacy') {
      formData.permission = permissionSuffix.value.trim();
    } else {
      const suffix = permissionSuffix.value.trim();
      const prefix = currentPermissionPrefix.value;
      formData.permission = suffix ? `${prefix}${suffix}` : '';
    }
  };

  const submitForm = async () => {
    submitLoading.value = true;
    try {
      applyPermissionFromSuffix();
      if (formData.menuForm == null) formData.menuForm = 'route';
      if (formData.openMode == null) formData.openMode = 'current';
      const rawPath = (formData.path || '').trim();
      const composedPath = isAddChild.value
        ? composePathWithPrefix(currentAppPrefix.value, rawPath)
        : rawPath;
      formData.path = normalizePathSuffixByActiveRule(composedPath, appActiveRulePrefix.value);
      const payload = { ...formData };
      delete (payload as { children?: unknown }).children;
      if (isEdit.value && formData.id != null) {
        await updateMenu(formData.id, payload);
      } else {
        await addMenu(payload);
      }
      ElMessage.success('保存成功');
      dialogVisible.value = false;
      await fetchData();
      await userStore.refreshAndSync();
    } finally {
      submitLoading.value = false;
    }
  };

  const onDialogClose = () => {
    resetForm();
  };

  return {
    isEdit,
    isAddChild,
    dialogVisible,
    dialogTitle,
    submitLoading,
    formData,
    permissionSuffix,
    permissionInputMode,
    rules,
    menuOptions,
    currentAppPrefix,
    currentPermissionPrefix,
    resetForm,
    handleAdd,
    handleEdit,
    handleDelete,
    submitForm,
    onDialogClose
  };
}
