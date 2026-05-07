<template>
  <section class="profile-header">
    <div class="profile-header__col profile-header__user">
      <el-avatar class="profile-avatar" :size="72" :src="avatarSrc">
        {{ displayName.slice(0, 1) }}
      </el-avatar>
      <div class="profile-header__text">
        <div class="profile-name">{{ displayName }}</div>
        <div class="profile-sub">{{ userName || '—' }}</div>
      </div>
    </div>
    <div class="profile-header__col">
      <div class="profile-value">{{ emailDisplay }}</div>
      <div class="profile-label">邮箱地址</div>
    </div>
    <div class="profile-header__col">
      <div class="profile-tags">
        <div v-for="name in roleTags" :key="name" class="role-tag">{{ name }}</div>
      </div>
      <div class="profile-label">所属角色</div>
    </div>
    <div class="profile-header__col">
      <div class="profile-value">{{ orgDisplay }}</div>
      <div class="profile-label">所属组织架构</div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  displayName: string;
  userName: string;
  avatarSrc?: string;
  emailDisplay: string;
  roleTags: string[];
  orgDisplay: string;
}>();
</script>

<style scoped lang="scss">
.profile-header {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 1fr 1fr minmax(220px, 1fr);
  align-items: center;
  height: 170px;
  background: linear-gradient(272deg, #ffffff 0%, #eef6ff 100%);
  border-radius: 8px;
  border: 1px solid #e9e9eb;

  padding: 0 0 0 82px;
}

.profile-header__col {
  min-width: 0;
}

.profile-header__user {
  display: flex;
  align-items: center;
  gap: 28px;
}

.profile-avatar {
  flex-shrink: 0;
  background: #0055ff;
  color: #fff;
  font-weight: 600;
}

.profile-header__text {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    right: -61px;
    transform: translateY(-50%);
    width: 2px;
    height: 40px;
    background: #E9E9EB;
  }
}

.profile-name {
  font-family: PingFangSC, PingFang SC;
  font-weight: 600;
  font-size: 22px;
  color: #333333;
  line-height: 30px;
  text-align: left;
  font-style: normal;
}

.profile-sub {
  margin-top: 6px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 16px;
  color: #333333;
  line-height: 22px;
  text-align: left;
  font-style: normal;
}

.profile-value {
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  font-size: 20px;
  color: #303133;
  line-height: 28px;
  text-align: left;
  font-style: normal;
  word-break: break-all;

  &.muted {
    color: #999;
  }
}

.profile-label {
  margin-top: 12px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #333333;
  line-height: 22px;
  text-align: left;
  font-style: normal;
}

.profile-tags {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
  height: 32px;
}

.role-tag {
  width: 105px;
  height: 32px;
  background: #ECF5FF;
  border-radius: 3px;
  border: 1px solid #D9ECFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  font-size: 16px;
  color: #409EFF;
  line-height: 27px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}
</style>
