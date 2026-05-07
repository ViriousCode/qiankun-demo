<template>
  <div class="page-container" v-loading="loading">
    <h2 class="page-title">个人中心</h2>

    <div class="page-card">
      <ProfileHeader
        :display-name="displayName"
        :user-name="userStore.userInfo.userName || '—'"
        :avatar-src="displayAvatar"
        :email-display="emailDisplay"
        :role-tags="roleTags"
        :org-display="orgDisplay"
      />

      <SecuritySection
        :has-email="hasEmail"
        :has-phone="hasPhone"
        :email="userStore.userInfo.email || ''"
        :masked-phone="maskedPhone"
        @modify-password="openModifyPassword"
        @email-action="onEmailAction"
        @phone-action="onPhoneAction"
      />
    </div>

    <ModifyPassword ref="modifyPwdRef" />
    <PhoneVerifyDialog ref="phoneVerifyRef" />
  </div>
</template>

<script setup lang="ts">
import ModifyPassword from '@/components/ModifyPassword.vue';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProfileHeader from './components/ProfileHeader.vue';
import SecuritySection from './components/SecuritySection.vue';
import PhoneVerifyDialog from './components/PhoneVerifyDialog.vue';
import { useProfileInfo } from './useProfileInfo';

const route = useRoute();
const router = useRouter();

const modifyPwdRef = ref<InstanceType<typeof ModifyPassword>>();
const phoneVerifyRef = ref<InstanceType<typeof PhoneVerifyDialog>>();
const {
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
  openModifyPassword,
  onEmailAction,
  onPhoneAction
} = useProfileInfo(modifyPwdRef, phoneVerifyRef);

function clearActionQuery() {
  const { action, ...rest } = route.query;
  router.replace({ query: rest });
}

watch(
  () => route.query.action,
  (action) => {
    if (action === 'modifyPwd') {
      openModifyPassword();
      clearActionQuery();
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss"></style>
