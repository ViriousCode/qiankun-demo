<template>
  <el-container class="layout-wrapper">
    <el-aside width="240px" class="sidebar">
      <div class="logo">管理系统基座</div>
      <el-menu :default-active="activeMenu" class="el-menu-vertical" router background-color="#001529"
        text-color="#a6adb4">
        <el-menu-item index="/dashboard">
          <el-icon>
            <DataBoard />
          </el-icon>
          <span>控制台</span>
        </el-menu-item>

        <el-sub-menu v-for="sub in globalData.subAppMenus" :key="sub.path" :index="sub.path">
          <template #title>
            <el-icon>
              <component :is="sub.meta?.icon || 'Menu'" />
            </el-icon>
            <span>{{ sub.meta?.title }}</span>
          </template>
          <el-menu-item v-for="child in sub.children" :key="child.path" :index="child.path">
            {{ child.meta?.title }}
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container class="main-content">
      <el-header height="64px" class="header">
        <div class="header-right">
          <span>欢迎, {{ userStore.userInfo?.name }}</span>
          <el-button link @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>

      <el-main class="view-port">
        <router-view v-if="isMainRoute"></router-view>

        <div v-else-if="!isSwitching && currentAppName" class="micro-wrapper">
          <MicroContainer :key="currentAppName" :name="currentAppName" />
        </div>

        <div v-else class="loading-placeholder">
          <el-empty description="正在同步系统环境，请稍候..." />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loadMicroApp, type MicroApp } from 'qiankun';
import { useUserStore } from '@/store/user';
import { useMicroConfig } from '@/core/micro-frontend/config';
import MicroContainer from '@/components/MicroContainer.vue';
import { DataBoard } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { globalData, subApps } = useMicroConfig();

// 状态管理
const silentAppInstances = new Map<string, { app: MicroApp, node: HTMLElement }>();
const loadedApps = new Set();

const activeMenu = computed(() => route.path);

// 判断是否为主应用路由
const isMainRoute = computed(() => {
  const mainAppPaths = ['/dashboard', '/login', '/403', '/404'];
  return mainAppPaths.some(path => route.path === path || route.path.startsWith(path + '/'));
});

// 计算当前匹配到的子应用名称
const currentAppName = computed(() => {
  const app = subApps.find(a => route.path.startsWith(a.activeRule as string));
  return app ? app.name : null;
});

// index.vue 中的 clearSilentApp
const isSwitching = ref(false); // 关键锁

// index.vue

const clearSilentApp = async (appName: string) => {
  const item = silentAppInstances.get(appName);

  // 即使 Map 里没有，也要尝试清理 loadedApps 防止状态不同步
  if (!item && !loadedApps.has(appName)) return;

  console.log(`[主应用] 开始彻底清理静默实例: ${appName}`);
  isSwitching.value = true; // 锁住容器

  try {
    // 1. 如果实例存在，执行卸载
    if (item && item.app) {
      // 这里的 unmount 必须 await，等待子应用执行完自己的 unmount 钩子
      await item.app.unmount();
    }

    // 2. 物理移除 Ghost DOM 节点 (防止 qiankun 复用脏节点)
    // 优先使用 Map 里的引用，如果没有则尝试按 ID 查找
    const node = item?.node || document.getElementById(`ghost-${appName}`);
    if (node && document.body.contains(node)) {
      node.innerHTML = ''; // 清空内容
      document.body.removeChild(node); // 移除节点
    }

    // 3. 【关键】清理主应用的状态记录
    silentAppInstances.delete(appName);
    loadedApps.delete(appName); // 必须删掉！否则 qiankun 认为它还在

    // 4. 【关键】强制延迟。Vite 也就是在此处需要一点时间释放沙箱
    // 建议设置为 300ms - 500ms
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`[主应用] 实例 ${appName} 清理完毕，准备挂载新实例`);
  } catch (e) {
    console.warn(`[主应用] 清理 ${appName} 遇到非致命错误:`, e);
  } finally {
    isSwitching.value = false; // 解锁，允许 MicroContainer 挂载
  }
};

/**
 * 权限触发的静默预加载
 */
const silentLoad = () => {
  const perms = userStore.permissions || [];
  if (perms.length === 0) return;

  subApps.forEach(app => {
    const isTargetApp = route.path.startsWith(app.activeRule as string);
    // 只有非当前页面且未加载过的应用才预加载，防止抢占容器
    if (perms.includes(`app:${app.name}`) && !loadedApps.has(app.name) && !isTargetApp) {
      console.log(`[主应用] 启动静默预加载: ${app.name}`);

      const ghost = document.createElement('div');
      ghost.id = `ghost-${app.name}`;
      ghost.style.display = 'none';
      document.body.appendChild(ghost);

      const appInstance = loadMicroApp({
        ...app,
        container: ghost,
        props: {
          ...app.props,
          isSilent: true,
          globalData,
          setMenus: (menus: any[]) => {
            console.log(`[主应用] 静默实例上报菜单:`, menus);
            globalData.subAppMenus = menus;
          }
        },
      });
      console.log('appInstance data', {
        ...app,
        container: ghost,
        props: { ...app.props, isSilent: true, globalData }
      })

      silentAppInstances.set(app.name, { app: appInstance, node: ghost });
      loadedApps.add(app.name);
    }
  });
};

// 监听权限获取
watch(() => userStore.permissions, (val) => {
  if (val?.length > 0) silentLoad();
}, { immediate: true });

watch(() => route.path, async (newPath, oldPath) => {
  const targetApp = subApps.find(app => newPath.startsWith(app.activeRule as string));
  const oldApp = subApps.find(app => oldPath?.startsWith(app.activeRule as string));

  // 只有从【非子应用】进入【子应用】，且有静默实例时才清理
  if (targetApp && !oldApp && silentAppInstances.has(targetApp.name)) {
    await clearSilentApp(targetApp.name);
  }
}, { immediate: true });

const handleLogout = () => {
  silentAppInstances.forEach((_, name) => clearSilentApp(name));
  userStore.reset();
  router.push('/login');
};

onUnmounted(() => {
  silentAppInstances.forEach((_, name) => clearSilentApp(name));
});
</script>

<style scoped>
.layout-wrapper {
  height: 100vh;
}

.view-port {
  padding: 20px;
  background-color: #f0f2f5;
}

.micro-wrapper {
  width: 100%;
  height: 100%;
}
</style>