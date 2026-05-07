import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getAppList, type AppCategory, type MicroApp } from '@/api/app';
import {
  getTenantAuthorizedApps,
  updateTenantAuthorizedApps,
  type SystemTenant
} from '@/api/systemTenant';
import { useUserStore } from '@/store/user';

export function useTenantAppAuth(options: { refreshTenantList: () => Promise<void> }) {
  const { refreshTenantList } = options;
  const userStore = useUserStore();

  const dialogVisible = ref(false);
  const currentTenant = ref<SystemTenant | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  const appsByCategory = ref<Record<AppCategory, MicroApp[]>>({
    platform: [],
    sso: [],
    external: []
  });
  const selectedAppIds = ref<number[]>([]);
  const searchName = ref('');

  const filterApps = (list: MicroApp[]) => {
    const kw = searchName.value.trim().toLowerCase();
    if (!kw) return list;
    return list.filter((a) =>
      String(a.name || '')
        .toLowerCase()
        .includes(kw)
    );
  };

  const filteredPlatformApps = computed(() => filterApps(appsByCategory.value.platform || []));
  const filteredSsoApps = computed(() => filterApps(appsByCategory.value.sso || []));
  const filteredExternalApps = computed(() => filterApps(appsByCategory.value.external || []));

  const loadApps = async () => {
    loading.value = true;
    try {
      const [platform, sso, external] = await Promise.all([
        getAppList({ category: 'platform' }),
        getAppList({ category: 'sso' }),
        getAppList({ category: 'external' })
      ]);
      appsByCategory.value = {
        platform: Array.isArray(platform) ? platform : [],
        sso: Array.isArray(sso) ? sso : [],
        external: Array.isArray(external) ? external : []
      };
    } finally {
      loading.value = false;
    }
  };

  const loadAuthorized = async (tenantId: number) => {
    const res = await getTenantAuthorizedApps(tenantId);
    selectedAppIds.value = Array.isArray(res?.appIds) ? [...res.appIds] : [];
  };

  const open = async (tenant: SystemTenant) => {
    currentTenant.value = tenant;
    dialogVisible.value = true;
    searchName.value = '';
    loading.value = true;
    try {
      await Promise.all([loadAuthorized(tenant.id), loadApps()]);
    } finally {
      loading.value = false;
    }
  };

  const close = () => {
    dialogVisible.value = false;
    currentTenant.value = null;
    appsByCategory.value = { platform: [], sso: [], external: [] };
    selectedAppIds.value = [];
    searchName.value = '';
  };

  const updateSelection = (nextIds: number[]) => {
    selectedAppIds.value = Array.isArray(nextIds) ? [...nextIds] : [];
  };

  watch(
    () => dialogVisible.value,
    (open) => {
      if (!open) {
        currentTenant.value = null;
        appsByCategory.value = { platform: [], sso: [], external: [] };
        selectedAppIds.value = [];
        searchName.value = '';
      }
    }
  );

  const save = async () => {
    const tenantId = currentTenant.value?.id;
    if (!tenantId) return;
    saving.value = true;
    try {
      await updateTenantAuthorizedApps(tenantId, selectedAppIds.value);
      ElMessage.success('授权应用已更新');
      dialogVisible.value = false;
      await refreshTenantList();
      await userStore.refreshAndSync();
    } finally {
      saving.value = false;
    }
  };

  return {
    dialogVisible,
    currentTenant,
    loading,
    saving,
    searchName,
    appsByCategory,
    filteredPlatformApps,
    filteredSsoApps,
    filteredExternalApps,
    selectedAppIds,
    open,
    close,
    updateSelection,
    save
  };
}
