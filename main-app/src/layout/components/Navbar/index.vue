<template>
  <div class="navbar">
    <div class="left-panel">
      <Logo class="navbar-logo" :logo-text="navbarLogoText" :icon-name="navbarLogoIcon" />
    </div>
    <div class="right-panel">
      <div class="action-icon" v-if="!isWorkbench" @click="goToWorkbench">
        <div class="icon-workbench"></div>
        <span>工作台</span>
      </div>
      <el-badge class="notification-badge" :value="notificationCount" :hidden="notificationCount === 0" :max="99">
        <div class="action-icon" @click="onNotification">
          <div class="icon-bell"></div>
        </div>
      </el-badge>

      <el-dropdown trigger="click" @command="handleCommand" popper-class="user-dropdown-popper"
        :popper-options="userDropdownPopperOptions">
        <div class="avatar-wrapper">
          <img class="user-avatar" :src="avatarUrl" />
          <div class="username">{{ userStore.userInfo?.userName || 'Admin' }}</div>
          <span class="caret-icon" aria-hidden="true"></span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="modifyPwd">修改密码</el-dropdown-item>
            <el-dropdown-item command="center">管理中心</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
  <MessageDrawer
    v-model="messagePanelVisible"
    :list="messageList"
    @item-action="onMessageAction"
    @item-read="onMessageRead"
    @mark-all-read="onMarkAllRead"
    @goto-list="onGotoMessageList"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/store/user';
import { usePermissionStore } from '@/store/permission';
import { ElMessage } from 'element-plus';
import Logo from '@/components/Logo.vue';
import MessageDrawer from '@/components/MessageDrawer/index.vue';
import iconUserMale from '@/assets/image/workbench/icon_user_male.webp';
import iconUserFemale from '@/assets/image/workbench/icon_user_female.webp';
import { getMessageList, markMessageRead, type MessageItem } from '@/api/message';
import { useMessageUnreadCount } from '@/views/profile/message/useMessageUnreadCount';
import { confirmInAppMain } from '@/utils/messageBox';

const userStore = useUserStore();
const permissionStore = usePermissionStore();
const router = useRouter();
const route = useRoute();

const isWorkbench = computed(() => route.path === '/workbench');
const avatarUrl = computed(() =>
  userStore.userInfo?.gender === 'male' ? iconUserMale : iconUserFemale
);

/** 顶栏蓝色框：在子应用内显示子应用名称与图标，否则显示主应用 */
const subAppDisplay = computed(() => permissionStore.getCurrentSubAppDisplay(route.path));
const navbarLogoText = computed(() => subAppDisplay.value?.title ?? '环保管理平台');
const navbarLogoIcon = computed(() => subAppDisplay.value?.icon ?? undefined);

const goToWorkbench = () => {
  router.push('/workbench');
};

const messagePanelVisible = ref(false);
const { unreadCount: unreadMessageCount, refreshUnreadCount } = useMessageUnreadCount();
const notificationCount = computed(() => unreadMessageCount.value);
const messageList = ref<MessageItem[]>([]);

const userDropdownPopperOptions = {
  modifiers: [
    {
      name: 'offset',
      options: { offset: [0, 4] }
    }
  ]
};

async function loadMessages() {
  try {
    const res = await getMessageList({
      status: 'unread',
      pageIndex: 1,
      pageSize: 99
    });
    const unreadMessages = res?.list ?? [];
    unreadMessageCount.value = res?.unreadCount ?? unreadMessages.length;
    messageList.value = unreadMessages.map((item) => ({
      ...item,
      type: (item as any).type ?? item.level
    }));
  } catch {
    unreadMessageCount.value = 0;
    messageList.value = [];
  }
}

const onNotification = async () => {
  await loadMessages();
  messagePanelVisible.value = true;
};

const onMessageAction = async (item: MessageItem) => {
  messagePanelVisible.value = false;
  await permissionStore.generateMenus();
  router.push({
    path: '/profile/message/detail',
    query: {
      id: item.id
    }
  });

  // 先跳转，再异步标记已读并刷新角标/列表
  markMessageRead(item.id)
    .catch(() => undefined)
    .finally(() => {
      loadMessages();
      refreshUnreadCount();
    });
};

const onMessageRead = async (item: MessageItem) => {
  try {
    await markMessageRead(item.id);
  } finally {
    await loadMessages();
    await refreshUnreadCount();
  }
};

const onMarkAllRead = async () => {
  if (!messageList.value.length) return;
  try {
    await Promise.allSettled(messageList.value.map((m) => markMessageRead(m.id)));
  } finally {
    await loadMessages();
    await refreshUnreadCount();
  }
};

const onGotoMessageList = async () => {
  messagePanelVisible.value = false;
  await permissionStore.generateMenus();
  router.push('/profile/message');
};

/** 是否当前在「个人中心」模块下（路径以 /profile 开头） */
const isInProfileModule = () => route.path.startsWith('/profile');

/** 是否当前在「管理中心」模块下（路径以 /system 开头） */
const isInCenterModule = () => route.path.startsWith('/system');

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    handleLogout();
  } else if (command === 'modifyPwd') {
    // 由 AppMain 统一挂载并打开弹窗，遮罩不覆盖顶栏/菜单
    window.dispatchEvent(new CustomEvent('open-modify-password'));
  } else if (command === 'profile') {
    if (!isInProfileModule()) {
      await permissionStore.generateMenus();
      const firstPath = permissionStore.getFirstMenuPathByTitle('个人中心');
      if (firstPath) router.push(firstPath);
      else router.push('/profile/info');
    }
  } else if (command === 'center') {
    if (!isInCenterModule()) {
      await permissionStore.generateMenus();
      const firstPath = permissionStore.getFirstMenuPathByTitle('管理中心');
      if (firstPath) router.push(firstPath);
      else router.push('/system/user');
    }
  }
};

const handleLogout = () => {
  confirmInAppMain('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.reset();
    permissionStore.reset();
    window.location.href = '/login';
    ElMessage.success('退出成功');
  });
};

onMounted(() => {
  loadMessages();
  refreshUnreadCount();
});
</script>

<style scoped lang="scss">
.navbar {
  width: 100%;
  height: 66px;
  background: linear-gradient(180deg, #d4e2fd 0%, #dae7fd 100%);
  box-shadow: 0px 2px 4px 0px rgba(0, 48, 118, 0.1);
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 52px 0 44px;
  z-index: 1002;

  .left-panel {
    display: flex;
    align-items: center;
    gap: 12px;

    .navbar-logo {
      flex-shrink: 0;
    }
  }

  .right-panel {
    display: flex;
    align-items: center;
    gap: 15px;

    .notification-badge {
      display: flex;
      align-items: center;
    }

    :deep(.el-badge__content) {
      width: 21px;
      height: 16px;
      background: #f93260;
      border-radius: 8px;
      border: 1px solid #ffffff;
    }

    .action-icon {
      height: 36px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      gap: 6px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: color 0.3s;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 500;
      font-size: 12px;
      color: #2e2f3d;
      line-height: 17px;
      text-align: left;
      font-style: normal;

      &:hover {
        background: rgba(165, 201, 255, 0.6);
        color: rgba(51, 118, 255, 1);

        .icon-workbench {
          background: url('@/assets/image/navbar/icon_workbench_hover.svg');
          background-size: 100% 100%;
        }

        .icon-bell {
          background: url('@/assets/image/navbar/icon_bell_hover.svg');
          background-size: 100% 100%;
        }
      }

      .icon-workbench {
        width: 20px;
        height: 20px;
        background: url('@/assets/image/navbar/icon_workbench.svg');
        background-size: 100% 100%;
      }

      .icon-bell {
        width: 20px;
        height: 20px;
        background: url('@/assets/image/navbar/icon_bell.svg');
        background-size: 100% 100%;
      }
    }

    .avatar-wrapper {
      height: 36px;
      padding: 0 16px 0 12px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 8px;
      display: flex;
      align-items: center;
      cursor: pointer;
      color: var(--el-text-color-regular);
      width: 116px;

      .user-avatar {
        width: 24px;
        height: 24px;
      }

      .username {
        flex-shrink: 0;
        margin: 0 8px;
        width: 40px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        font-weight: 500;
      }

      .caret-icon {
        display: inline-block;
        width: 8.49px;
        height: 8.49px;
        flex: 0 0 auto;
        background-color: rgba(102, 102, 102, 1);
        -webkit-mask: url('@/assets/image/navbar/ic_zhankai.svg') no-repeat center / contain;
        mask: url('@/assets/image/navbar/ic_zhankai.svg') no-repeat center / contain;
      }

      &:hover {
        background: rgba(165, 201, 255, 1);
        color: rgba(51, 118, 255, 1);
      }
    }
  }
}
</style>

<style lang="scss">
/* 消息抽屉：仅占 navbar 下方高度，不遮挡 navbar（overlay 使用 modal-class，teleport 到 body 故不加 scoped） */
.message-drawer-wrapper {
  top: 66px !important;
  left: 0 !important;
  right: 0 !important;
  bottom: auto !important;
  height: calc(100vh - 66px) !important;

  /* 抽屉顶部外阴影改为内阴影 */
  .el-drawer {
    box-shadow: -2px 0px 8px 0px rgba(0, 0, 0, 0.1);
  }
}

/* 顶栏头像下拉：宽度跟触发区一致，且隐藏顶部箭头 */
.user-dropdown-popper {
  min-width: var(--el-popper-reference-width);
  box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.1);

  .el-popper__arrow {
    display: none;
  }

  .el-dropdown-menu {
    width: 100%;
    box-sizing: border-box;
  }

  .el-dropdown-menu__item {
    padding: 8px 40px 8px 20px;
  }

  .el-dropdown-menu__item+.el-dropdown-menu__item {
    margin-top: 2px;
  }
}
</style>
