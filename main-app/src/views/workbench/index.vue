<template>
  <div class="workbench-page" v-loading="loading">
    <div class="workbench-row-top">
      <div class="workbench-left-col">
        <UserCard
          :avatar-url="userAvatar"
          :user-name="userStore.userInfo?.userName || '---'"
          :dept-name="userStore.userInfo?.deptName || '---'"
          :current-date-time="currentDateTime"
          :week-day="weekDay"
          :weather-text="weatherText"
        />
        <AppsCard
          :apps="flatApps"
          :placeholder-apps="placeholderApps"
          @more-click="router.push('/system/app/platform')"
          @app-click="handleJump"
        />
      </div>
      <NewsCard :news-list="newsList" />
    </div>

    <div class="workbench-row-bottom">
      <TodoCard
        class="todo-card"
        v-model="todoActive"
        :pending-count="todoPendingCount"
        :done-count="todoDoneCount"
        :todo-list="todoList"
      />
      <QuickEntryCard
        :entries="quickEntries"
        @config-click="onQuickEntryConfig"
        @entry-click="onQuickEntryClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/store/user';
  import iconUserMale from '@/assets/image/workbench/icon_user_male.webp';
  import iconUserFemale from '@/assets/image/workbench/icon_user_female.webp';
  import { getSystemInfoList, type SystemInfo } from '@/api/systemInfo';
  import { getLinkList } from '@/api/link';
  import UserCard from './components/UserCard.vue';
  import AppsCard from './components/AppsCard.vue';
  import NewsCard from './components/NewsCard.vue';
  import TodoCard from './components/TodoCard.vue';
  import QuickEntryCard from './components/QuickEntryCard.vue';
  import {
    DEFAULT_NEWS_LIST,
    DEFAULT_QUICK_ENTRIES,
    DEFAULT_TODO_LIST,
    DEFAULT_TODO_PENDING_COUNT,
    DEFAULT_TODO_DONE_COUNT,
    PLACEHOLDER_APP_NAMES
  } from './constants';
  import type { QuickEntry } from './components/QuickEntryCard.vue';
  import { useWorkbenchTime } from './useWorkbenchTime';
  import { useWorkbenchApps } from './useWorkbenchApps';

  const router = useRouter();
  const userStore = useUserStore();

  const { currentDateTime, weekDay, weatherText } = useWorkbenchTime();
  const { loading, flatApps, handleJump } = useWorkbenchApps();

  const userAvatar = computed(() =>
    userStore.userInfo?.gender === 'male' ? iconUserMale : iconUserFemale
  );

  const todoActive = ref<'pending' | 'done'>('pending');
  const todoPendingCount = ref(DEFAULT_TODO_PENDING_COUNT);
  const todoDoneCount = ref(DEFAULT_TODO_DONE_COUNT);
  const newsList = ref([...DEFAULT_NEWS_LIST]);
  const quickEntries = ref<QuickEntry[]>([...DEFAULT_QUICK_ENTRIES]);
  const todoList = ref([...DEFAULT_TODO_LIST]);

  const placeholderApps = computed(() => PLACEHOLDER_APP_NAMES.map((name) => ({ name })));

  const onQuickEntryConfig = () => {
    router.push('/system/settings/links');
  };

  const onQuickEntryClick = (entry: QuickEntry) => {
    if (entry.url) {
      window.open(entry.url, '_blank');
    }
  };

  const fetchQuickEntries = async () => {
    try {
      const data = await getLinkList({ status: 1 });
      const list = data || [];
      if (list.length > 0) {
        quickEntries.value = list.map((item) => ({
          key: item.id,
          name: item.name,
          url: item.url
        }));
      }
    } catch (_) {
      // keep default
    }
  };

  const normalizeNewsDate = (item: SystemInfo) => {
    const source = String(item.publishTime || item.updateTime || '').trim();
    if (!source) return '';
    const date = new Date(source);
    if (!Number.isNaN(date.getTime())) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return source.slice(0, 10);
  };

  const fetchWorkbenchNews = async () => {
    try {
      const res = await getSystemInfoList({
        infoCategory: '环保资讯',
        status: 1,
        pageIndex: 1,
        pageSize: 10
      });
      const list = res?.list ?? [];
      newsList.value = list.map((item) => ({
        title: item.title,
        date: normalizeNewsDate(item)
      }));
      if (newsList.value.length === 0) {
        newsList.value = [...DEFAULT_NEWS_LIST];
      }
    } catch (_) {
      newsList.value = [...DEFAULT_NEWS_LIST];
    }
  };

  onMounted(() => {
    fetchWorkbenchNews();
    fetchQuickEntries();
  });
</script>

<style scoped lang="scss">
  $breakpoint-narrow: 1599px;

  .workbench-page {
    padding: 28px 52px 20px 52px;
    height: calc(100vh - 66px);
    background: transparent;
    display: grid;
    grid-template-rows: 527fr 419fr;
    gap: 20px;
    overflow: hidden;

    .workbench-row-top {
      display: grid;
      grid-template-columns: 1121fr 675fr;
      gap: 20px;
      flex: 1;
      min-height: 0;

      .workbench-left-col {
        display: grid;
        grid-template-rows: 163fr 344fr;
        gap: 19px;
        min-height: 0;
      }
    }

    .workbench-row-bottom {
      flex: 1;
      display: grid;
      grid-template-columns: 1121fr 675fr;
      gap: 20px;
      min-height: 280px;
    }

    /* 宽度小于 1920px 时改为单列 */
    @media (max-width: $breakpoint-narrow) {
      height: auto;
      min-height: calc(100vh - 66px);
      grid-template-rows: auto auto;
      overflow: visible;

      .workbench-row-top {
        grid-template-columns: 1fr;
      }

      .workbench-row-bottom {
        grid-template-columns: 1fr;
        min-height: 0;
      }
    }
  }
</style>
