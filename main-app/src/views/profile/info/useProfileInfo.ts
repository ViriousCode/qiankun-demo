import { computed, onMounted, ref, type Ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';
import iconUserMale from '@/assets/image/workbench/icon_user_male.webp';
import iconUserFemale from '@/assets/image/workbench/icon_user_female.webp';
import type ModifyPassword from '@/components/ModifyPassword.vue';

type PhoneVerifyDialogExpose = {
  open: (options?: { mode?: 'bind' | 'edit'; phone?: string }) => void;
};

export function useProfileInfo(
  modifyPwdRef: Ref<InstanceType<typeof ModifyPassword> | undefined>,
  phoneVerifyRef?: Ref<PhoneVerifyDialogExpose | undefined>
) {
  const userStore = useUserStore();
  const loading = ref(false);

  const displayName = computed(
    () => userStore.userInfo.nickName || userStore.userInfo.userName || '—'
  );

  // 头像展示逻辑：与工作台保持一致（根据性别显示默认头像）
  const displayAvatar = computed(() =>
    userStore.userInfo?.gender === 'male' ? iconUserMale : iconUserFemale
  );

  const emailDisplay = computed(() => userStore.userInfo.email || '—');

  const orgDisplay = computed(
    () => userStore.userInfo.orgPath || userStore.userInfo.deptName || '—'
  );

  const roleTags = computed(() => userStore.userInfo.roleNames || []);

  const hasEmail = computed(() => !!userStore.userInfo.email?.trim());
  const hasPhone = computed(() => !!userStore.userInfo.phone?.trim());

  const maskedPhone = computed(() => {
    const p = userStore.userInfo.phone?.trim() || '';
    if (p.length < 7) return p;
    return `${p.slice(0, 3)}****${p.slice(-4)}`;
  });

  async function refresh() {
    loading.value = true;
    try {
      await userStore.getUserInfo();
    } catch {
      /* request 已提示 */
    } finally {
      loading.value = false;
    }
  }

  function openModifyPassword() {
    modifyPwdRef.value?.open();
  }

  function onEmailAction() {
    ElMessage.info('邮箱维护请通过系统管理中的用户管理进行配置');
  }

  function onPhoneAction() {
    if (phoneVerifyRef) {
      phoneVerifyRef.value?.open({
        phone: userStore.userInfo.phone?.trim() || undefined
      });
      return;
    }
    ElMessage.info('手机号维护请通过系统管理中的用户管理进行配置');
  }

  onMounted(() => {
    void refresh();
  });

  return {
    userStore,
    loading,
    displayName,
    displayAvatar,
    emailDisplay,
    orgDisplay,
    roleTags,
    hasEmail,
    hasPhone,
    maskedPhone,
    refresh,
    openModifyPassword,
    onEmailAction,
    onPhoneAction
  };
}

