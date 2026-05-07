<template>
  <AzuraIconSelect
    v-model="currentIcon"
    :iconfont-config-url="MENU_ICONFONT_CONFIG_URL"
    :url-icon-list-url="MENU_URL_ICON_LIST_URL"
    :url-icon-base-url="MENU_URL_ICON_BASE_URL"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { AzuraIconSelect } from '@npm/azura-icon';
  import {
    MENU_ICONFONT_CONFIG_URL,
    MENU_URL_ICON_LIST_URL,
    MENU_URL_ICON_BASE_URL
  } from '@/config';

  const props = defineProps({
    modelValue: {
      type: String,
      default: ''
    }
  });

  const emit = defineEmits(['update:modelValue']);

  const currentIcon = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  });
</script>

<style scoped></style>
