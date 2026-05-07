<template>
  <section class="security-section">
    <div class="security-title">账号安全</div>
    <ul class="security-list">
      <li class="security-item">
        <div class="security-item__icon">
          <el-icon>
            <Lock />
          </el-icon>
        </div>
        <div class="security-item__body">
          <div class="security-item__title">登录密码</div>
          <div class="security-item__desc">定期更新密码有助于保护账号安全</div>
        </div>
        <div class="security-item__action">
          <StatusTag status-key="SET" source="security" />
          <el-button type="primary" link @click="$emit('modify-password')">修改</el-button>
        </div>
      </li>

      <!-- <li class="security-item">
        <div class="security-item__icon">
          <el-icon>
            <Message />
          </el-icon>
        </div>
        <div class="security-item__body">
          <div class="security-item__title">绑定邮箱</div>
          <div class="security-item__desc">
            <template v-if="hasEmail">
              {{ email }}，用于接收系统通知及找回密码
            </template>
<template v-else>绑定邮箱后可接收系统通知及找回密码</template>
</div>
</div>
<div class="security-item__action">
  <StatusTag :status-key="hasEmail ? 'BOUND' : 'UNBOUND'" source="security" />
  <el-button type="primary" link @click="$emit('email-action')">
    {{ hasEmail ? '修改' : '立即绑定' }}
  </el-button>
</div>
</li> -->

      <li class="security-item">
        <div class="security-item__icon">
          <el-icon>
            <Iphone />
          </el-icon>
        </div>
        <div class="security-item__body">
          <div class="security-item__title">绑定手机</div>
          <div class="security-item__desc">
            <template v-if="hasPhone">
              {{ maskedPhone }}，可用于登录验证与密码找回
            </template>
            <template v-else>绑定手机号可用于登录验证与密码找回</template>
          </div>
        </div>
        <div class="security-item__action">
          <StatusTag :status-key="hasPhone ? 'BOUND' : 'UNBOUND'" source="security" />
          <el-button type="primary" link @click="$emit('phone-action')">
            {{ hasPhone ? '修改' : '立即绑定' }}
          </el-button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { Lock, Message, Iphone } from '@element-plus/icons-vue';
import StatusTag from '@/components/StatusTag.vue';

defineProps<{
  hasEmail: boolean;
  hasPhone: boolean;
  email: string;
  maskedPhone: string;
}>();

defineEmits<{
  (e: 'modify-password'): void;
  (e: 'email-action'): void;
  (e: 'phone-action'): void;
}>();
</script>

<style scoped lang="scss">
.security-section {
  margin-top: 19px;
  width: 100%;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e9e9eb;
  flex: 1;
}

.security-title {
  padding: 24px 0 22px 25px;
  margin: 0;
  border-bottom: 1px solid #e9e9e9;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  font-size: 18px;
  color: #333333;
  line-height: 25px;
  text-align: left;
  font-style: normal;
}

.security-list {
  list-style: none;
  margin: 0;
  padding: 0 32px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 0 16px 0;
  border-bottom: 1px solid #e9e9e9;
}

.security-item__icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #e8f1ff;
  color: #0055ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.security-item__body {
  flex: 1;
  min-width: 0;
}

.security-item__title {
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  font-size: 16px;
  color: #333333;
  line-height: 22px;
  text-align: left;
  font-style: normal;
}

.security-item__desc {
  margin-top: 4px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #666666;
  line-height: 17px;
  text-align: left;
  font-style: normal;
}

.security-item__action {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}
</style>
