<template>
  <div class="logo">
    <MenuIcon :width="40" :height="40" v-if="iconName" :icon="iconName" class="logo-icon" />
    <img v-else :src="logoSrc" alt="logo" />
    <div class="logo-text" :style="{ marginLeft: textMarginLeft }">{{ logoText }}</div>
  </div>
</template>

<script setup lang="ts">
  import defaultLogo from '@/assets/image/login/icon_logo.webp';
  import MenuIcon from '@/components/MenuIcon.vue';

  withDefaults(
    defineProps<{
      logoSrc?: string;
      logoText?: string;
      textMarginLeft?: string;
      /** 子应用时传图标名（如 List），与 MenuIcon 一致；不传则用 logoSrc 图片 */
      iconName?: string;
    }>(),
    {
      logoSrc: () => defaultLogo,
      logoText: '环保管理平台',
      textMarginLeft: '8px',
      iconName: undefined
    }
  );
</script>

<style scoped lang="scss">
  .logo {
    display: flex;
    align-items: center;

    .logo-icon {
      width: 40px;
      height: 40px;
      min-width: 40px;
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #223e87;
      flex-shrink: 0;

      :deep(.menu-icon-wrapper) {
        width: 40px !important;
        height: 40px !important;
        min-width: 40px !important;
        min-height: 40px !important;
        font-size: 40px !important;
        margin-right: 8px;
      }

      :deep(svg) {
        width: 40px;
        height: 40px;
      }

      :deep(.custom-svg-icon) {
        width: 1em;
        height: 1em;
      }
    }

    img {
      width: 40px;
      height: 40px;
    }

    .logo-text {
      font-family: DOUYINSANSBOLD, DOUYINSANSBOLD;
      font-weight: normal;
      font-size: 24px;
      color: #223e87;
      line-height: 29px;
      text-align: left;
      font-style: normal;
      margin-top: 5px;
    }
  }
</style>
