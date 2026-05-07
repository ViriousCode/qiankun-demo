<template>
  <div class="card-user-weather">
    <div class="user-block">
      <img class="user-avatar" :src="avatarUrl" />
      <div class="user-info">
        <div class="greeting">下午好， {{ userName || '---' }}</div>
        <div class="dept">{{ deptName || '---' }}</div>
      </div>
    </div>
    <div class="weather-block">
      <div class="date-time">{{ currentDateTime }}</div>
      <div class="weather-text">{{ weekDay }}{{ weatherText ? ` ${weatherText}` : '' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    avatarUrl: string;
    userName: string;
    deptName: string;
    currentDateTime: string;
    weekDay: string;
    weatherText?: string;
  }>();
</script>

<style scoped lang="scss">
  .card-user-weather {
    background: url('@/assets/image/workbench/bg_card_user.webp');
    background-size: 100% 100%;
    padding: 0 78px 0 53px;
    min-height: 163px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .user-block {
      display: flex;
      align-items: center;
      gap: 31px;

      .user-avatar {
        width: 72px;
        height: 72px;
      }

      .user-info {
        .greeting {
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 600;
          font-size: 22px;
          color: #333333;
          line-height: 30px;
          text-align: left;
          font-style: normal;
        }

        .dept {
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          font-size: 16px;
          color: #333333;
          line-height: 22px;
          text-align: left;
          font-style: normal;
          margin-top: 6px;
        }
      }
    }

    .weather-block {
      text-align: right;

      .date-time {
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        font-size: 16px;
        color: #505050;
        line-height: 22px;
        text-align: left;
        font-style: normal;
      }

      .weather-text {
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        font-size: 16px;
        color: #505050;
        line-height: 22px;
        text-align: left;
        font-style: normal;
        margin-top: 7px;
      }
    }
  }
</style>
