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

      <div class="theme-picker">
        <span style="font-size: 14px; margin-right: 8px; color: var(--el-text-color-regular)">
          主题色
        </span>
        <el-color-picker
          v-model="themeColor"
          :predefine="predefineColors"
          @change="handleThemeChange"
          size="small"
        />
      </div>

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
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 🚨 新增引入 nextTick
  import { ref, onMounted, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/store/user';
  import { usePermissionStore } from '@/store/permission';
  import { ElMessageBox, ElMessage } from 'element-plus';
  import { Moon, Sunny, CaretBottom, Monitor } from '@element-plus/icons-vue';
  import { setGlobalTheme } from '@/utils/theme';

  const themeColor = ref(localStorage.getItem('sys-theme-color') || '#409eff');

  const predefineColors = ref([
    '#409eff', // 默认蓝
    '#07c160', // 微信绿
    '#f5222d', // 玫瑰红
    '#fa541c', // 火山橘
    '#13c2c2', // 极客蓝
    '#722ed1', // 酱紫
    '#eb2f96' // 猛男粉
  ]);

  // 监听拾色器变化，触发换肤
  const handleThemeChange = (color: string | null) => {
    if (color) {
      setGlobalTheme(color);
    } else {
      // 如果用户清空了颜色，恢复默认蓝色
      themeColor.value = '#409eff';
      setGlobalTheme('#409eff');
    }
  };

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
      localStorage.setItem('useDark', 'true');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('useDark', 'false');
    }

    // 等待 DOM 上的 class 更新完成
    await nextTick();

    // 重新执行一遍颜色计算，确保暗色模式下不会太亮刺眼
    const currentColor = localStorage.getItem('sys-theme-color') || '#409eff';
    setGlobalTheme(currentColor);
  };

  const initTheme = () => {
    const storedTheme = localStorage.getItem('useDark');
    isDark.value = storedTheme === 'true';
    // 初始化时也调用一次完整流程，保证初次加载颜色正确
    toggleTheme(isDark.value);
  };

  // --- 用户操作逻辑 ---
  const handleCommand = (command: string) => {
    if (command === 'logout') {
      handleLogout();
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
    initTheme();
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
