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
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router'; // 🚨 新增：引入路由
  import { useUserStore } from '@/store/user';
  import { usePermissionStore } from '@/store/permission';
  import { ElMessageBox, ElMessage } from 'element-plus';
  // 🚨 新增：引入 Monitor 图标
  import { Moon, Sunny, CaretBottom, Monitor } from '@element-plus/icons-vue';

  // 接收父组件传入的折叠状态
  defineProps<{ isCollapse: boolean }>();
  // 定义触发父组件事件的方法
  const emit = defineEmits(['toggle-click']);

  const userStore = useUserStore();
  const permissionStore = usePermissionStore();
  const router = useRouter(); // 🚨 初始化 router

  const hasPermission = (permission: string) => {
    // 1. 如果是超级管理员，直接拥有所有权限 (根据你的数据结构判断 roleKey)
    if (userStore.userInfo?.roleKey === 'admin') {
      return true;
    }
    // 2. 判断用户的权限数组中是否包含该标识
    return userStore.permissions.includes(permission);
  };

  // --- 新增：跳转工作台逻辑 ---
  const goToWorkbench = () => {
    // 注意：如果你的工作台页面路由不是 '/workbench'，请在这里修改
    router.push('/workbench');
  };

  const toggleCollapse = () => {
    emit('toggle-click');
  };

  // --- 暗黑模式逻辑 ---
  const isDark = ref(false);

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

  const initTheme = () => {
    const storedTheme = localStorage.getItem('useDark');
    isDark.value = storedTheme === 'true';
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
      /* 这里控制右侧各元素的间距 */

      /* 🚨 新增：操作图标的样式，和头像、汉堡包保持统一个风格 */
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
