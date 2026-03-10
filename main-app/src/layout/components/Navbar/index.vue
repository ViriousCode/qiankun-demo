<template>
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
      <el-tooltip
        v-if="hasPermission('workbench:view')"
        content="我的工作台"
        effect="dark"
        placement="bottom"
      >
        <div class="action-icon" @click="goToWorkbench">
          <el-icon :size="20">
            <Monitor />
          </el-icon>
        </div>
      </el-tooltip>

      <div class="theme-switch">
        <el-switch
          v-model="isDark"
          inline-prompt
          :active-icon="Moon"
          :inactive-icon="Sunny"
          @change="toggleTheme"
        />
      </div>

      <el-dropdown trigger="click" @command="handleCommand">
        <div class="avatar-wrapper">
          <el-avatar :size="30" class="user-avatar" icon="UserFilled" />
          <span class="username">{{ userStore.userInfo?.userName || 'Admin' }}</span>
          <el-icon class="el-icon--right">
            <CaretBottom />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item divided command="modifyPwd">修改密码</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
  <ModifyPassword ref="pwdRef" />
</template>

<script setup lang="ts">
  // 🚨 新增引入 nextTick
  import { ref, onMounted, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/store/user';
  import { usePermissionStore } from '@/store/permission';
  import { useThemeStore } from '@/store/theme';
  import { ElMessageBox, ElMessage } from 'element-plus';
  import { Moon, Sunny, CaretBottom, Monitor } from '@element-plus/icons-vue';
  import ModifyPassword from '@/components/ModifyPassword.vue';

  const themeStore = useThemeStore();

  // 接收父组件传入的折叠状态
  defineProps<{ isCollapse: boolean }>();
  // 定义触发父组件事件的方法
  const emit = defineEmits(['toggle-click']);

  const userStore = useUserStore();
  const permissionStore = usePermissionStore();
  const router = useRouter();

  const hasPermission = (permission: string) => {
    // 1. 如果是超级管理员，直接拥有所有权限 (根据你的数据结构判断 roleKey)
    if (userStore.userInfo?.roleKey === 'admin') {
      return true;
    }
    // 2. 判断用户的权限数组中是否包含该标识
    return userStore.permissions.includes(permission);
  };

  const goToWorkbench = () => {
    router.push('/workbench');
  };

  const toggleCollapse = () => {
    emit('toggle-click');
  };

  // --- 暗黑模式逻辑 ---
  const isDark = ref(false);

  // 🚨 核心修改：改为 async 异步函数，并在切换 DOM 状态后重新计算主题色
  const toggleTheme = async (val: boolean | string | number) => {
    const html = document.documentElement;
    if (val) {
      html.classList.add('dark');
      // 🌟 修复：统一使用 sys-dark-mode
      localStorage.setItem('sys-dark-mode', 'true');
    } else {
      html.classList.remove('dark');
      // 🌟 修复：统一使用 sys-dark-mode
      localStorage.setItem('sys-dark-mode', 'false');
    }

    await nextTick();
    const currentColor = themeStore.themeColor;
    themeStore.updateThemeColor(currentColor);
  };

  const syncThemeState = () => {
    const storedDark = localStorage.getItem('sys-dark-mode');
    if (storedDark !== null) {
      isDark.value = storedDark === 'true';
    } else {
      // 兼容系统默认状态
      isDark.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  };

  const pwdRef = ref();
  // --- 用户操作逻辑 ---
  const handleCommand = (command: string) => {
    if (command === 'logout') {
      handleLogout();
    } else if (command === 'modifyPwd') {
      // 🌟 调用子组件暴露出的 open 方法
      pwdRef.value?.open();
    } else if (command === 'profile') {
      ElMessage.info('开发中...');
    }
  };

  const handleLogout = () => {
    ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
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
    syncThemeState();
  });
</script>

<style scoped lang="scss">
  /* 样式保持原样，未做修改 */
  $headerHeight: 50px;

  .navbar {
    height: $headerHeight;
    overflow: hidden;
    position: relative;
    background: var(--el-bg-color);
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
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

      .action-icon {
        display: flex;
        align-items: center;
        cursor: pointer;
        color: var(--el-text-color-regular);
        transition: color 0.3s;

        &:hover {
          color: var(--el-color-primary);
        }
      }

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
</style>
