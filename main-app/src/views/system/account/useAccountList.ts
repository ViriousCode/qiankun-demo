import { ref, reactive, onMounted } from 'vue';
import type { FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import {
  getSystemUserList,
  updateSystemUser,
  deleteSystemUser,
  unlockSystemUser,
  resetSystemUserPassword,
  type SystemUser
} from '@/api/systemUser';
import type { SystemUserListParams, UserSource } from '@/api/systemUser';
import { getSystemTenantList } from '@/api/systemTenant';
import { DEFAULT_PAGE_SIZE } from '@/config';
import { getAccountAuthValue } from './accountAuthUtils';

export type AccountType = '' | 'name' | 'phone' | 'zzd';
export interface AccountUserOption {
  value: string;
  label: string;
  tenantShortName?: string;
}

export interface AccountQueryParams {
  source: '' | 'platform' | 'third' | 'zzd';
  name: string;
  keyword: string;
  status: number | undefined;
  pageIndex: number;
  pageSize: number;
}

export function useAccountList() {
  const loading = ref(false);
  const tableData = ref<SystemUser[]>([]);
  const total = ref(0);
  /** 用户筛选项（来自用户列表去重） */
  const nameOptions = ref<AccountUserOption[]>([]);
  /** 平台用户 id -> 展示姓名（用于外部账号关联用户展示） */
  const platformUserNameById = ref<Map<number, string>>(new Map());

  const accountType = ref<AccountType>('');

  /** 重置密码弹窗 */
  const resetPwdVisible = ref(false);
  const resetPwdRow = ref<SystemUser | null>(null);
  const resetPwdAuthIdentifier = ref('');
  const resetPwdLoading = ref(false);
  const resetPwdForm = reactive({ newPassword: '' });
  const resetPwdRules: FormRules = {
    newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }]
  };

  const queryParams = reactive<AccountQueryParams>({
    name: '',
    source: '',
    keyword: '',
    status: undefined,
    pageIndex: 1,
    pageSize: DEFAULT_PAGE_SIZE
  });

  const fetchData = async () => {
    loading.value = true;
    try {
      const trimmedName = queryParams.name.trim();
      const trimmedKeyword = queryParams.keyword.trim();
      const effectiveType = accountType.value;

      const sourceFromType = effectiveType === 'zzd' ? 'zzd' : '';
      const effectiveSource = queryParams.source || sourceFromType;

      const params: SystemUserListParams = {
        source: effectiveSource ? effectiveSource : 'all',
        accountType: effectiveType,
        name: trimmedName || undefined,
        keyword: trimmedKeyword || undefined,
        status: queryParams.status,
        pageIndex: queryParams.pageIndex,
        pageSize: queryParams.pageSize
      };
      const res = await getSystemUserList(params);
      tableData.value = res?.list ?? [];
      total.value = res?.total ?? 0;
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => {
    queryParams.pageIndex = 1;
    fetchData();
  };

  const handlePageChange = (page: number) => {
    queryParams.pageIndex = page;
    fetchData();
  };

  const handleSizeChange = (size: number) => {
    queryParams.pageSize = size;
    queryParams.pageIndex = 1;
    fetchData();
  };

  const resetQuery = () => {
    accountType.value = '';
    queryParams.source = '';
    queryParams.name = '';
    queryParams.keyword = '';
    queryParams.status = undefined;
    queryParams.pageIndex = 1;
    fetchData();
  };

  const handleToggleEnable = async (row: SystemUser, nextEnabled: boolean) => {
    const nextStatus = nextEnabled ? 1 : 0;
    const actionText = nextStatus === 1 ? '启用' : '禁用';
    await updateSystemUser(row.id, { status: nextStatus });
    ElMessage.success(`${actionText}成功`);
    await fetchData();
  };

  const handleUnlock = async (row: SystemUser) => {
    await unlockSystemUser(row.id);
    ElMessage.success('解锁成功');
    await fetchData();
  };

  const handleResetPassword = (row: SystemUser) => {
    resetPwdRow.value = row;
    resetPwdAuthIdentifier.value = getAccountAuthValue(row);
    resetPwdForm.newPassword = '';
    resetPwdVisible.value = true;
  };

  const submitResetPassword = async () => {
    const row = resetPwdRow.value;
    if (!row) return;
    const pwd = resetPwdForm.newPassword.trim();
    if (!pwd) {
      ElMessage.warning('请输入新密码');
      return;
    }
    resetPwdLoading.value = true;
    try {
      await resetSystemUserPassword(row.id, { password: pwd });
      ElMessage.success('密码已重置');
      resetPwdVisible.value = false;
      resetPwdRow.value = null;
      await fetchData();
    } finally {
      resetPwdLoading.value = false;
    }
  };

  const handleRemove = async (row: SystemUser) => {
    await deleteSystemUser(row.id);
    ElMessage.success('已移除');
    await fetchData();
  };

  const formatSource = (source?: UserSource) => {
    if (source === 'platform') return '平台';
    if (source === 'third') return '第三方';
    if (source === 'zzd') return '浙政钉';
    return '-';
  };

  const loadNameOptions = async () => {
    try {
      const tenantRes = await getSystemTenantList({ pageIndex: 1, pageSize: 500 });
      const tenantShortNameById = new Map<number, string>();
      (tenantRes?.list ?? []).forEach((t) => {
        if (t?.id != null) tenantShortNameById.set(t.id, t.shortName || t.tenantName || '');
      });

      const res = await getSystemUserList({
        source: 'platform',
        pageIndex: 1,
        pageSize: 500
      });
      const map = new Map<string, AccountUserOption>();
      const userNameMap = new Map<number, string>();
      (res?.list ?? []).forEach((u) => {
        const n = (u.name || '').trim();
        if (!n) return;
        userNameMap.set(u.id, n || (u.nickName || '').trim() || '-');
        const tid = u.tenantId ?? undefined;
        const tenantShortName = typeof tid === 'number' ? tenantShortNameById.get(tid) : undefined;
        if (!map.has(n)) {
          map.set(n, { value: n, label: n, tenantShortName: tenantShortName || undefined });
        }
      });
      nameOptions.value = Array.from(map.values()).sort((a, b) =>
        a.label.localeCompare(b.label, 'zh-CN')
      );
      platformUserNameById.value = userNameMap;
    } catch {
      nameOptions.value = [];
      platformUserNameById.value = new Map();
    }
  };

  function displayLinkedUserName(row: SystemUser) {
    // 平台用户：直接显示自身姓名/昵称
    if (row.source === 'platform') return row.name || '-';

    // 外部账号：显示绑定的平台用户姓名（对应弹窗“关联用户”）
    const pid = row.platformUserId;
    if (typeof pid === 'number') return platformUserNameById.value.get(pid) || '-';
    return '-';
  }

  onMounted(() => {
    void loadNameOptions();
    fetchData();
  });

  return {
    loading,
    tableData,
    total,
    nameOptions,
    accountType,
    queryParams,
    fetchData,
    handleSearch,
    handlePageChange,
    handleSizeChange,
    resetQuery,
    handleToggleEnable,
    handleUnlock,
    handleResetPassword,
    submitResetPassword,
    resetPwdVisible,
    resetPwdAuthIdentifier,
    resetPwdForm,
    resetPwdRules,
    resetPwdLoading,
    handleRemove,
    formatSource,
    displayLinkedUserName
  };
}
