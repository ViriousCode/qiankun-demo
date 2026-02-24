<template>
  <div class="workbench-container" v-loading="loading">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">我的工作台</span>
          <el-button link type="primary" @click="router.push('/system/workbench')">
            工作台管理
          </el-button>
        </div>
      </template>

      <div v-if="Object.keys(groupedApps).length > 0">
        <div v-for="(items, category) in groupedApps" :key="category" class="category-section">
          <div class="category-title">
            <span class="marker"></span>
            {{ category }}
          </div>

          <div class="app-grid">
            <div v-for="item in items" :key="item.id" class="app-item" @click="handleJump(item)">
              <div class="icon-box" :class="item.targetType">
                <el-icon><component :is="item.icon" v-if="item.icon" /></el-icon>
              </div>
              <div class="info">
                <h3 class="app-title">{{ item.title }}</h3>
                <p class="app-desc" :title="item.description">
                  {{ item.description || '暂无描述' }}
                </p>
              </div>
              <div class="tag-corner">
                <el-tag size="small" :type="item.targetType === 'external' ? 'warning' : 'success'">
                  {{ item.targetType === 'external' ? '外链' : '内部' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-else description="暂无工作台应用，请联系管理员添加" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { getWorkbenchList } from '@/api/workbench';
  import type { WorkbenchItem } from '@/api/workbench';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const loading = ref(false);
  const rawList = ref<WorkbenchItem[]>([]);

  // 获取工作台数据
  const fetchData = async () => {
    loading.value = true;
    try {
      const res = await getWorkbenchList();
      rawList.value = res || [];
    } catch (error) {
      ElMessage.error('加载工作台数据失败');
    } finally {
      loading.value = false;
    }
  };

  // 🚨 核心逻辑：将一维数组按 category 转换为分组对象
  // 结果格式: { '常用应用': [...], '业务系统': [...] }
  const groupedApps = computed(() => {
    const groups: Record<string, WorkbenchItem[]> = {};
    rawList.value.forEach((item) => {
      const cat = item.category || '未分类';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    });
    return groups;
  });

  // 跳转逻辑保持不变
  const handleJump = (item: WorkbenchItem) => {
    if (!item.path) return ElMessage.warning('该应用未配置跳转路径');
    if (item.targetType === 'external') {
      const url = item.path.startsWith('http') ? item.path : `http://${item.path}`;
      window.open(url, '_blank');
    } else {
      router.push(item.path);
    }
  };

  onMounted(() => fetchData());
</script>

<style scoped>
  .workbench-container {
    padding: 20px;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .card-header .title {
    font-size: 18px;
    font-weight: bold;
  }

  /* 🚨 新增分类样式 */
  .category-section {
    margin-bottom: 30px;
  }
  .category-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
  }
  .category-title .marker {
    display: inline-block;
    width: 4px;
    height: 16px;
    background-color: #409eff;
    border-radius: 2px;
    margin-right: 8px;
  }

  /* 保持原有的网格和卡片样式 */
  .app-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
  }
  .app-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #fff;
  }
  .app-item:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-3px);
    border-color: #c6e2ff;
  }
  .icon-box {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    font-size: 24px;
    margin-right: 16px;
    flex-shrink: 0;
  }
  .icon-box.internal {
    background-color: #ecf5ff;
    color: #409eff;
  }
  .icon-box.external {
    background-color: #fdf6ec;
    color: #e6a23c;
  }
  .info {
    flex: 1;
    min-width: 0;
  }
  .app-title {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .app-desc {
    margin: 0;
    font-size: 13px;
    color: #909399;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tag-corner {
    position: absolute;
    top: 10px;
    right: 10px;
  }
</style>
