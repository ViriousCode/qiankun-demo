<template>
  <div class="card-news">
    <div class="card-title">环保资讯</div>
    <div class="news-list">
      <div v-for="(item, i) in newsList" :key="i" class="news-item">
        <span :title="item.title" class="news-title">{{ item.title }}</span>
        <span class="news-date">{{ item.date }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    newsList: Array<{ title: string; date: string }>;
  }>();
</script>

<style scoped lang="scss">
  .card-news {
    background: linear-gradient(180deg, #ecf3ff 0%, #f5f9ff 100%);
    box-shadow: 0px 0px 4px 0px rgba(166, 205, 255, 0.25);
    border-radius: 16px;
    border: 2px solid #ffffff;
    min-height: 0;
    max-height: 50vh;
    display: flex;
    flex-direction: column;
    padding: 26px 24px 31px 24px;

    .card-title {
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 500;
      font-size: 20px;
      color: #333333;
      line-height: 22px;
      text-align: left;
      font-style: normal;
    }

    .news-list {
      flex: 1;
      overflow: auto;
      min-height: 0;
      margin-top: 24px;
      padding-right: 6px;
      scrollbar-gutter: stable;
      width: 100%;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        display: none;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(152, 180, 230, 0.85);
        border-radius: 999px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: rgba(120, 155, 220, 0.95);
      }

      .news-item {
        &:first-child {
          margin-top: 0;
        }

        &:hover {
          background: rgba(226, 236, 255, 0.9);
          box-shadow: 0px 2px 4px 0px rgba(157, 183, 255, 0.5);
          border: 1px solid #5f94ff;
          transition: all 0.3s;
        }

        margin-top: 10px;
        width: calc(100% - 4px);
        height: 52px;
        background: #ffffff;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 16px;
        font-size: 14px;
        transition: all 0.3s;

        .news-title {
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          font-size: 16px;
          color: #333333;
          line-height: 22px;
          text-align: left;
          font-style: normal;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .news-date {
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: #666666;
          line-height: 20px;
          text-align: center;
          font-style: normal;
          flex-shrink: 0;
        }
      }
    }
  }
</style>
