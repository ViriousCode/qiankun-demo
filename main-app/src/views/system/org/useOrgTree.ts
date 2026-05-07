import { ref, reactive, onMounted, computed } from 'vue';
import { getOrgTree, type OrgNode } from '@/api/systemOrg';
import { useUserStore } from '@/store/user';

export function useOrgTree() {
  const loading = ref(false);
  const tableData = ref<OrgNode[]>([]);
  const userStore = useUserStore();
  const isAdmin = computed(() => userStore.userInfo.roleKey === 'admin');
  const queryParams = reactive<{
    orgCode: string;
    name: string;
    status: string | number;
    tenantId?: number | null;
  }>({
    orgCode: '',
    name: '',
    status: '',
    tenantId: userStore.userInfo.tenantId ?? null
  });

  function ensureNodeShape(n: OrgNode): OrgNode {
    const node = { ...n, children: n.children?.length ? n.children.map(ensureNodeShape) : [] };
    if (node.status === undefined) node.status = 1;
    if (!node.orgCode) node.orgCode = `ORG-${String(n.id).slice(-3).padStart(3, '0')}`;
    if (!node.updateTime) node.updateTime = '-';
    return node;
  }

  const fetchData = async () => {
    loading.value = true;
    try {
      const statusValue =
        queryParams.status === '' || queryParams.status === undefined || queryParams.status === null
          ? undefined
          : Number(queryParams.status);
      const data = await getOrgTree({
        source: 'platform',
        orgCode: queryParams.orgCode || undefined,
        name: queryParams.name || undefined,
        status: Number.isFinite(statusValue) ? statusValue : undefined,
        ...(isAdmin.value ? { tenantId: queryParams.tenantId || undefined } : {})
      });
      tableData.value = (data || []).map((n) => ensureNodeShape(n));
    } finally {
      loading.value = false;
    }
  };

  const resetQuery = () => {
    queryParams.orgCode = '';
    queryParams.name = '';
    queryParams.status = '';
    if (isAdmin.value) queryParams.tenantId = userStore.userInfo.tenantId ?? null;
    fetchData();
  };

  const maskName = (s: string | undefined) => {
    if (!s) return '-';
    if (s.length <= 1) return s;
    return s[0] + '*'.repeat(s.length - 1);
  };

  const maskPhone = (s: string | undefined) => {
    if (!s) return '-';
    if (s.length < 8) return s.slice(0, 3) + '****';
    return s.slice(0, 3) + '****' + s.slice(-4);
  };

  /** 计算节点在树中的深度（根为 1），未找到返回 0 */
  function getNodeDepth(nodes: OrgNode[], nodeId: number, depth = 1): number {
    for (const n of nodes) {
      if (n.id === nodeId) return depth;
      if (n.children?.length) {
        const d = getNodeDepth(n.children, nodeId, depth + 1);
        if (d > 0) return d;
      }
    }
    return 0;
  }

  onMounted(() => {
    fetchData();
  });

  return {
    loading,
    tableData,
    queryParams,
    isAdmin,
    fetchData,
    resetQuery,
    maskName,
    maskPhone,
    getNodeDepth
  };
}
