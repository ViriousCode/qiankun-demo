<template>
  <div class="app-wrapper">
    <div class="sidebar-container">
      <div class="logo-wrapper">
        <el-icon :size="24" color="#fff" style="margin-right: 10px">
          <Platform />
        </el-icon>
        <h1 class="logo-title" v-show="!isCollapse">微前端基座</h1>
      </div>

      <el-scrollbar>
        <el-menu router :default-active="$route.path" :collapse="isCollapse" background-color="#304156"
          text-color="#bfcbd9" active-text-color="#409EFF" :unique-opened="true" class="el-menu-vertical">
          <template v-for="menu in userStore.menus" :key="menu.path">
            <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
              <template #title>
                <el-icon v-if="menu.icon">
                  <component :is="menu.icon" />
                </el-icon>
                <span>{{ menu.title }}</span>
              </template>
              <el-menu-item v-for="child in menu.children" :key="child.path" :index="child.path">
                <template #title><span>{{ child.title }}</span></template>
              </el-menu-item>
            </el-sub-menu>

            <el-menu-item v-else :index="menu.path">
              <el-icon v-if="menu.icon">
                <component :is="menu.icon" />
              </el-icon>
              <template #title><span>{{ menu.title }}</span></template>
            </el-menu-item>
          </template>
        </el-menu>
      </el-scrollbar>
    </div>

    <div class="main-container">
      <div class="navbar">
        <div class="left-panel">
          <div class="hamburger" @click="toggleCollapse">
            <el-icon :size="20">
              <component :is="isCollapse ? 'Expand' : 'Fold'" />
            </el-icon>
          </div>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta.title || '当前页面' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="right-panel">
          <div class="theme-switch">
            <el-switch v-model="isDark" inline-prompt :active-icon="Moon" :inactive-icon="Sunny"
              @change="toggleTheme" />
          </div>

          <el-dropdown trigger="click" @command="handleCommand">
            <div class="avatar-wrapper">
              <el-avatar :size="30" class="user-avatar" icon="UserFilled" />
              <span class="username">{{ userStore.userName || 'Admin' }}</span>
              <el-icon class="el-icon--right">
                <CaretBottom />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
        <div id="sub-app-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { initQiankun } from '@/micro';
import { ElMessageBox, ElMessage } from 'element-plus';
// 引入图标
import {
  Platform, Expand, Fold, Moon, Sunny, CaretBottom, UserFilled
} from '@element-plus/icons-vue';

const userStore = useUserStore();
const router = useRouter();
const isCollapse = ref(false);

// --- 侧边栏折叠 ---
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// --- 暗黑模式逻辑 ---
const isDark = ref(false);

// 1. 定义广播函数：把最新的权限发给子应用
const broadcastPermissions = (permissions: string[]) => {
  const event = new CustomEvent('global-sync-permissions', {
    detail: { permissions },
  });
  window.dispatchEvent(event);
};

// 2. 场景A：当子应用修改了角色，通知主应用刷新
const handlePermissionRefresh = async () => {
  await userStore.getUserInfo(); // 重新调接口
  broadcastPermissions(userStore.permissions || []);
};

// 3. 场景B：【新增】当子应用刚挂载，请求最新数据
const handleSubAppAsk = () => {
  broadcastPermissions(userStore.permissions || []);
};

const toggleTheme = (val: boolean | string | number) => {
  const html = document.documentElement;
  if (val) {
    html.classList.add('dark');
    localStorage.setItem('useDark', 'true');
  } else {
    html.classList.remove('dark');
    localStorage.setItem('useDark', 'false');
  }
};

// 初始化主题
const initTheme = () => {
  const storedTheme = localStorage.getItem('useDark');
  isDark.value = storedTheme === 'true';
  toggleTheme(isDark.value);
};

// --- 用户下拉菜单逻辑 ---
const handleCommand = (command: string) => {
  if (command === 'logout') {
    handleLogout();
  } else if (command === 'profile') {
    ElMessage.info('开发中...');
  }
};

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 1. 清理 Store 和 LocalStorage
    userStore.reset();
    // 2. 跳转登录页
    window.location.href = '/login'
    ElMessage.success('退出成功');
    // 3. (可选) 刷新页面以彻底重置 Qiankun 状态
    // window.location.reload(); 
  });
};

onMounted(() => {
  initTheme();
  initQiankun();
  // 注册监听器
  window.addEventListener('global-refresh-permission', handlePermissionRefresh); // 场景A
  window.addEventListener('sub-app-ask-for-refresh', handleSubAppAsk);         // 场景B
});
onUnmounted(() => {
  // 销毁监听器 (防止内存泄漏)
  window.removeEventListener('global-refresh-permission', handlePermissionRefresh);
  window.removeEventListener('sub-app-ask-for-refresh', handleSubAppAsk);
});
</script>

<style scoped lang="scss">
// 变量定义
$sideBarWidth: 210px;
$headerHeight: 50px;
$menuBg: #304156;
$menuHover: #263445;
$subMenuBg: #1f2d3d;

.app-wrapper {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* --- 侧边栏样式 (保持不变) --- */
.sidebar-container {
  height: 100%;
  background-color: $menuBg;
  transition: width 0.28s;
  width: v-bind('isCollapse ? "64px" : "210px"');
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  z-index: 1001;
}

.logo-wrapper {
  height: $headerHeight;
  line-height: $headerHeight;
  background: #2b2f3a;
  text-align: center;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .logo-title {
    color: #fff;
    font-weight: 600;
    font-size: 14px;
    font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
    white-space: nowrap;
    margin: 0;
  }
}

.el-menu-vertical {
  border-right: none;
}

:deep(.el-menu) {
  background-color: $menuBg;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: $menuHover !important;
}

:deep(.el-sub-menu .el-menu-item) {
  background-color: $subMenuBg !important;

  &:hover {
    background-color: #001528 !important;
  }
}

/* --- 右侧内容区样式 --- */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color-page); // 使用 Element 变量以支持暗黑模式
  overflow: hidden;
  transition: background-color 0.3s;
}

.navbar {
  height: $headerHeight;
  overflow: hidden;
  position: relative;
  background: var(--el-bg-color); // 适配暗黑模式
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between; // 左右分布
  padding: 0 15px;
  z-index: 10;
  border-bottom: 1px solid var(--el-border-color-light);

  .left-panel {
    display: flex;
    align-items: center;

    .hamburger {
      cursor: pointer;
      margin-right: 15px;
      display: flex;
      align-items: center;
      color: var(--el-text-color-regular);

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .right-panel {
    display: flex;
    align-items: center;
    gap: 15px;

    .theme-switch {
      display: flex;
      align-items: center;
    }

    .avatar-wrapper {
      display: flex;
      align-items: center;
      cursor: pointer;
      color: var(--el-text-color-regular);

      .username {
        margin: 0 8px;
        font-size: 14px;
        font-weight: 500;
      }

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}

.app-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  position: relative;
  background-color: var(--el-bg-color-page); // 适配暗黑模式
}

// 简单的路由过渡动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>