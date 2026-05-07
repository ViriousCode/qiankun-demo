<template>
  <div class="table-empty">
    <img class="table-empty__img" :src="imgSrc" :alt="text" />
    <div class="table-empty__text">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import picNoDataUrl from '@/assets/image/default/pic_nodata.svg';
import picNoMessageUrl from '@/assets/image/default/pic_nomessage.svg';
import picNoNetworkUrl from '@/assets/image/default/pic_network.svg';
import picNoPageUrl from '@/assets/image/default/pic_nopage.svg';
import picFeatureUrl from '@/assets/image/default/pic_feature.svg';

type EmptyType = 'nodata' | 'nomessage' | 'network' | 'nopage' | 'feature';

const props = withDefaults(
  defineProps<{
    type?: EmptyType;
    text?: string;
  }>(),
  {
    type: 'nodata',
    text: ''
  }
);

const imgSrc = computed(() => {
  switch (props.type) {
    case 'nomessage':
      return picNoMessageUrl;
    case 'network':
      return picNoNetworkUrl;
    case 'nopage':
      return picNoPageUrl;
    case 'feature':
      return picFeatureUrl;
    case 'nodata':
    default:
      return picNoDataUrl;
  }
});

const text = computed(() => {
  if (props.text) return props.text;
  switch (props.type) {
    case 'nomessage':
      return '暂无消息/回复';
    case 'network':
      return '网络异常，请刷新重试';
    case 'nopage':
      return '抱歉，您访问的页面不存在';
    case 'feature':
      return '功能开发中，敬请期待…';
    case 'nodata':
    default:
      return '暂无数据';
  }
});
</script>

<style scoped>
.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.table-empty__img {
  width: 180px;
  height: 180px;
}

.table-empty__text {
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 400;
  font-size: 18px;
  color: #999999;
  line-height: 25px;
  white-space: nowrap;
}
</style>
