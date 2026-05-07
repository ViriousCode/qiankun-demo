import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormRules } from 'element-plus';
import { getSystemUserList, type SystemUser } from '@/api/systemUser';
import { getSystemTenantList } from '@/api/systemTenant';
import { addSystemAccount } from '@/api/systemAccount';
import { updateSystemUser } from '@/api/systemUser';
import { getAccountAuthKind } from './accountAuthUtils';
export type AccountUserOption = { id: number; label: string; tenantShortName?: string };

export type AccountFormAccountType = '' | 'name' | 'phone' | 'zzd';

export interface AccountFormModel {
  id?: number;
  linkedUserId: number | undefined;
  accountType: AccountFormAccountType;
  authIdentifier: string;
  status: 0 | 1;
}

const phoneRe = /^1\d{10}$/;

function inferAccountType(row: SystemUser): AccountFormAccountType {
  const kind = getAccountAuthKind(row);
  if (kind === '浙政钉') return 'zzd';
  if (kind === '手机号') return 'phone';
  return 'name';
}

function resolveLinkedUserId(row: SystemUser): number | undefined {
  if (typeof row.platformUserId === 'number') return row.platformUserId;
  // 平台账号编辑时，关联用户就是自身
  if (row.source === 'platform') return row.id;
  return undefined;
}

function validateAuthIdentifier(_rule: unknown, value: string, callback: (e?: Error) => void) {
  const v = String(value || '').trim();
  if (!v) {
    callback(new Error('请输入认证标识'));
    return;
  }
  callback();
}

export function useAccountForm(fetchData: () => Promise<void>) {
  const dialogVisible = ref(false);
  const dialogTitle = ref('新增账号');
  const submitLoading = ref(false);
  const userOptions = ref<AccountUserOption[]>([]);
  const linkedUsersMap = ref<Map<number, SystemUser>>(new Map());

  const form = reactive<AccountFormModel>({
    id: undefined,
    linkedUserId: undefined,
    accountType: '',
    authIdentifier: '',
    status: 1
  });

  const rules: FormRules = {
    linkedUserId: [{ required: true, message: '请选择关联用户', trigger: 'change' }],
    accountType: [{ required: true, message: '请选择账号类型', trigger: 'change' }],
    authIdentifier: [
      { required: true, validator: validateAuthIdentifier, trigger: 'blur' },
      {
        validator: (_rule, value, callback) => {
          const v = String(value || '').trim();
          if (!v) {
            callback();
            return;
          }
          if (form.accountType === 'phone' && !phoneRe.test(v)) {
            callback(new Error('请输入正确的11位手机号'));
            return;
          }
          callback();
        },
        trigger: 'blur'
      }
    ]
  };

  const loadPlatformUsers = async () => {
    const tenantRes = await getSystemTenantList({ pageIndex: 1, pageSize: 500 });
    const tenantShortNameById = new Map<number, string>();
    (tenantRes?.list ?? []).forEach((t) => {
      if (t?.id != null) tenantShortNameById.set(t.id, t.shortName || t.tenantName || '');
    });

    const res = await getSystemUserList({
      source: 'platform',
      pageIndex: 1,
      pageSize: 5000
    });
    const list = res?.list ?? [];
    const map = new Map<number, SystemUser>();
    userOptions.value = list.map((u) => {
      map.set(u.id, u);
      const nick = (u.nickName || '').trim();
      const name = (u.name || '').trim();
      const left = nick || name;
      const label = `${left} / ${name || left}`;
      const tid = u.tenantId ?? undefined;
      const tenantShortName = typeof tid === 'number' ? tenantShortNameById.get(tid) : undefined;
      return { id: u.id, label, tenantShortName: tenantShortName || undefined };
    });
    linkedUsersMap.value = map;
  };

  const resetForm = () => {
    form.id = undefined;
    form.linkedUserId = undefined;
    form.accountType = '';
    form.authIdentifier = '';
    form.status = 1;
  };

  const handleAdd = async () => {
    resetForm();
    dialogTitle.value = '新增账号';
    try {
      await loadPlatformUsers();
    } catch {
      userOptions.value = [];
      linkedUsersMap.value = new Map();
    }
    dialogVisible.value = true;
  };

  const handleEdit = async (row: SystemUser) => {
    resetForm();
    dialogTitle.value = '编辑账号';
    form.id = row.id;
    form.status = row.status === 0 ? 0 : 1;
    form.authIdentifier = String(row.authIdentifier || row.name || '').trim();
    // 编辑时关联用户与账号类型仅展示不可改，这里仍回填，方便弹窗显示
    form.linkedUserId = resolveLinkedUserId(row);
    form.accountType = inferAccountType(row);
    try {
      await loadPlatformUsers();
    } catch {
      userOptions.value = [];
      linkedUsersMap.value = new Map();
    }
    dialogVisible.value = true;
  };

  const submitForm = async () => {
    const auth = form.authIdentifier.trim();
    if (form.accountType === 'phone' && !phoneRe.test(auth)) {
      ElMessage.warning('请输入正确的11位手机号');
      return;
    }

    submitLoading.value = true;
    try {
      if (form.id != null) {
        // 编辑：仅允许修改认证标识
        await updateSystemUser(form.id, { authIdentifier: auth });
      } else {
        const linked =
          form.linkedUserId != null ? linkedUsersMap.value.get(form.linkedUserId) : undefined;
        if (!linked) {
          ElMessage.warning('请选择有效的关联用户');
          return;
        }
        await addSystemAccount({
          platformUserId: linked.id,
          accountType: form.accountType as 'name' | 'phone' | 'zzd',
          authIdentifier: auth,
          status: form.status
        });
      }
      ElMessage.success('保存成功');
      dialogVisible.value = false;
      await fetchData();
    } finally {
      submitLoading.value = false;
    }
  };

  return {
    dialogVisible,
    dialogTitle,
    form,
    rules,
    submitLoading,
    userOptions,
    handleAdd,
    handleEdit,
    submitForm
  };
}
