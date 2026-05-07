<template>
  <div class="page-container" v-loading="loading">
    <h2 class="page-title">我的待办</h2>

    <div class="stat-cards">
      <div v-for="card in statCards" :key="card.key" class="stat-card" :class="`stat-card--${card.theme}`">
        <div class="stat-card-body">
          <div class="stat-card-content">
            <div class="stat-card-header">
              <span class="stat-card-title">{{ card.title }}</span>
            </div>
            <div class="stat-card-main">
              <span class="stat-card-number">{{ card.value }}</span>
              <span class="stat-card-unit">{{ card.unit }}</span>
            </div>
          </div>

          <div class="stat-card-icon-wrap" aria-hidden="true">
            <div class="stat-card-icon-circle">
              <img class="stat-card-icon-image" :src="card.icon" :alt="card.title" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-card">
      <el-tabs v-model="activeTab" class="todo-tabs" @tab-change="handleTabChange">
        <el-tab-pane name="pending">
          <template #label>
            <span>待办事项 ({{ pendingCount }})</span>
          </template>
          <el-form :model="{}" class="todo-tab-filters" @submit.prevent="handleSearch">
            <el-row :gutter="20">
              <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <el-form-item label="来源应用">
                  <el-select v-model="pendingFilterAppKey" placeholder="全部应用" clearable style="width: 100%">
                    <el-option v-for="opt in appOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <el-form-item label="待办内容">
                  <el-input v-model="pendingFilterKeyword" placeholder="请输入待办内容" clearable
                    @keyup.enter="handleSearch" />
                </el-form-item>
              </el-col>
              <el-col :span="12" :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="query-btns">
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
              </el-col>
            </el-row>
          </el-form>
          <div class="todo-list-title" role="heading" aria-level="3">
            <img class="todo-list-title__icon" :src="iconTitle" alt="" aria-hidden="true" />
            <span class="todo-list-title__text">待办事项列表</span>
            <StatusTag
              v-if="overdueCount > 0"
              class="todo-list-title__overdue"
              status-key="OVERDUE"
              source="workflow"
              variant="outline"
              tag-size="small"
              bordered
              hide-icon
              :label-override="`${overdueCount} 条已逾期`"
            />
          </div>
          <el-table class="page-table page-table--respect-column-align" :data="list" border style="width: 100%">
            <template #empty>
              <TableEmpty />
            </template>
            <el-table-column type="index" label="序号" width="80" align="center" header-align="center" />
            <el-table-column label="来源应用" width="180" align="left" header-align="left">
              <template #default="{ row }">
                <div class="app-tag">
                  <MenuIcon v-if="resolveAppDisplay(row.appKey || 'main').icon" class="app-tag-icon"
                    :icon="resolveAppDisplay(row.appKey || 'main').icon" :width="12" :height="12" />
                  <span v-else class="app-tag-dot" />
                  <span class="app-tag-text">{{ resolveAppDisplay(row.appKey || 'main').title }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="待办内容" min-width="240" align="left" header-align="left" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="todo-desc-text">{{ row.desc }}</span>
                <StatusTag v-if="isRowOverdue(row)" class="todo-overdue-tag" status-key="OVERDUE" source="workflow"
                  variant="solid" tag-size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="产生时间" width="180" align="left" header-align="left"
              show-overflow-tooltip />
            <el-table-column prop="deadline" label="截止时间" width="180" align="left" header-align="left"
              show-overflow-tooltip />
            <el-table-column label="操作" width="100" fixed="right" align="left" header-align="left">
              <template #default="{ row }">
                <el-button type="primary" link @click.stop="goDetail(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane name="done">
          <template #label>
            <span>已办事项 ({{ doneCount }})</span>
          </template>
          <el-form :model="{}" class="todo-tab-filters" @submit.prevent="handleSearch">
            <el-row :gutter="20">
              <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <el-form-item label="来源应用">
                  <el-select v-model="doneFilterAppKey" placeholder="全部应用" clearable style="width: 100%">
                    <el-option v-for="opt in appOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <el-form-item label="已办内容">
                  <el-input v-model="doneFilterKeyword" placeholder="请输入已办内容" clearable @keyup.enter="handleSearch" />
                </el-form-item>
              </el-col>
              <el-col :span="12" :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="query-btns">
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
              </el-col>
            </el-row>
          </el-form>
          <div class="todo-list-title" role="heading" aria-level="3">
            <img class="todo-list-title__icon" :src="iconTitle" alt="" aria-hidden="true" />
            <span class="todo-list-title__text">已办事项列表</span>
            <StatusTag
              v-if="overdueCount > 0"
              class="todo-list-title__overdue"
              status-key="OVERDUE"
              source="workflow"
              variant="outline"
              tag-size="small"
              bordered
              hide-icon
              :label-override="`${overdueCount} 条已逾期`"
            />
          </div>
          <el-table class="page-table page-table--respect-column-align" :data="list" border style="width: 100%">
            <template #empty>
              <TableEmpty />
            </template>
            <el-table-column type="index" label="序号" width="80" align="center" header-align="center" />
            <el-table-column label="来源应用" width="180" align="left" header-align="left">
              <template #default="{ row }">
                <div class="app-tag">
                  <MenuIcon v-if="resolveAppDisplay(row.appKey || 'main').icon" class="app-tag-icon"
                    :icon="resolveAppDisplay(row.appKey || 'main').icon" :width="12" :height="12" />
                  <span v-else class="app-tag-dot" />
                  <span class="app-tag-text">{{ resolveAppDisplay(row.appKey || 'main').title }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="desc" label="已办内容" min-width="240" align="left" header-align="left"
              show-overflow-tooltip />
            <el-table-column prop="createTime" label="产生时间" width="180" align="center" header-align="center"
              show-overflow-tooltip />
            <el-table-column label="完成时间" width="180" align="center" header-align="center" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.completeTime || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right" align="center" header-align="center">
              <template #default="{ row }">
                <el-button type="primary" link @click.stop="goDetail(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <div class="pagination-container">
        <el-pagination v-model:current-page="pageIndex" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]"
          :layout="PAGINATION_LAYOUT" :total="total" @current-change="handlePageChange"
          @size-change="handleSizeChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { PAGINATION_LAYOUT } from '@/config';
import MenuIcon from '@/components/MenuIcon.vue';
import TableEmpty from '@/components/TableEmpty.vue';
import StatusTag from '@/components/StatusTag.vue';
import { usePermissionStore } from '@/store/permission';
import { useTodoList } from './useTodoList';
import type { ProfileTodoItem } from './constants';
import iconCardPending from '@/assets/image/selfcenter/ic_db.svg';
import iconCardOverdue from '@/assets/image/selfcenter/ic_yyq.svg';
import iconCardDone from '@/assets/image/selfcenter/ic_yb.svg';
import iconTitle from '@/assets/image/common/icon_title.svg';

const router = useRouter();
const permissionStore = usePermissionStore();
const {
  loading,
  activeTab,
  pendingCount,
  doneCount,
  overdueCount,
  pendingFilterAppKey,
  pendingFilterKeyword,
  doneFilterAppKey,
  doneFilterKeyword,
  list,
  total,
  pageIndex,
  pageSize,
  fetchData,
  handleTabChange,
  handlePageChange,
  handleSizeChange
} = useTodoList();

function handleSearch() {
  pageIndex.value = 1;
  fetchData();
}

function resetQuery() {
  if (activeTab.value === 'done') {
    doneFilterAppKey.value = '';
    doneFilterKeyword.value = '';
  } else {
    pendingFilterAppKey.value = '';
    pendingFilterKeyword.value = '';
  }
  pageIndex.value = 1;
  fetchData();
}

const appOptions = computed(() => {
  const options = [
    { value: '', label: '全部应用' },
    { value: 'main', label: '环保管理平台' }
  ];
  const apps = (permissionStore.microApps || []) as any[];
  apps.forEach((a) => {
    if (!a?.name) return;
    options.push({ value: a.name, label: a.shortName || a.name });
  });
  const uniq = new Map<string, string>();
  options.forEach((o) => {
    if (!uniq.has(o.value)) uniq.set(o.value, o.label);
  });
  return Array.from(uniq.entries()).map(([value, label]) => ({ value, label }));
});

function resolveAppDisplay(key: string) {
  if (String(key || '').trim() === 'main') {
    return { title: '环保管理平台', icon: '' as string | undefined };
  }
  const resolved = permissionStore.getSubAppDisplayByKey(key);
  return resolved ? { ...resolved } : { title: key, icon: '' as string | undefined };
}

function isRowOverdue(row: ProfileTodoItem) {
  if (row.status !== 'pending') return false;
  const deadline = String(row.deadline || '').trim();
  if (!deadline) return false;
  const t = new Date(deadline.replace(/-/g, '/')).getTime();
  return !Number.isNaN(t) && Date.now() > t;
}

const statCards = computed(() => [
  {
    key: 'pendingCount',
    title: '待办事项总数',
    value: pendingCount.value,
    unit: '条',
    theme: 'yellow',
    icon: iconCardPending
  },
  {
    key: 'overdueCount',
    title: '已逾期',
    value: overdueCount.value,
    unit: '条',
    theme: 'red',
    icon: iconCardOverdue
  },
  {
    key: 'doneCount',
    title: '已办事项总数',
    value: doneCount.value,
    unit: '条',
    theme: 'green',
    icon: iconCardDone
  }
]);

function goDetail(item: ProfileTodoItem) {
  router.push({
    path: '/profile/todo/detail',
    query: {
      id: item.id
    }
  });
}
</script>

<style scoped lang="scss">
.page-card {
  margin-top: 0;
}

.todo-tab-filters {
  margin-top: 5px;
  margin-bottom: 8px;
}

.todo-list-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 2px 0 10px 0;
  color: #303133;
}

.todo-list-title__icon {
  width: 14px;
  height: 13px;
  display: block;
  flex: 0 0 auto;
}

.todo-list-title__text {
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  font-size: 15px;
  color: #303133;
  line-height: 22px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin: 28px 0 28px 0;
}

.stat-card {
  border-radius: 8px;
  padding: 20px 22px 20px 28px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  background: #fff;
  overflow: hidden;
  position: relative;

  &.stat-card--yellow {
    background: linear-gradient(270deg, #FFFAF4 0%, #FFFFFF 100%);
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
  }

  &.stat-card--red {
    background: linear-gradient(270deg, #FFF4F4 0%, #FFFFFF 100%);
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
  }

  &.stat-card--green {
    background: linear-gradient(270deg, #D1F8EF 0%, #FFFFFF 100%);
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
  }
}

.stat-card-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.stat-card-content {
  min-width: 0;
}

.stat-card-title {
  font-size: 16px;
  line-height: 22px;
  font-weight: 500;
  color: #303133;
}

.stat-card-main {
  margin-top: 8px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.stat-card-number {
  font-size: 32px;
  line-height: 40px;
  font-weight: 700;
  color: #2e2e37;
}

.stat-card-unit {
  font-size: 14px;
  line-height: 22px;
  color: #98a0ad;
}

.stat-card-icon-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  flex: 0 0 80px;
}

.stat-card-icon-circle {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #ffffff;
}

.stat-card-icon-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
  display: block;
}

.stat-card--yellow {
  .stat-card-icon-circle {
    background: #FFF9EF;
    box-shadow: 0px 0px 11px 6px rgba(255, 231, 205, 0.5);
  }

}

.stat-card--red {
  .stat-card-icon-circle {
    background: #FFEFEF;
    box-shadow: 0px 0px 11px 6px rgba(255, 205, 205, 0.5);
  }

}

.stat-card--green {
  .stat-card-icon-circle {
    background: #effff9;
    box-shadow: 0px 0px 11px 6px rgba(205, 255, 216, 0.5);
  }

}

@media (max-width: 1440px) {
  .stat-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.app-tag {
  height: 20px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  background: #f5f9ff;
  border-radius: 4px;
  gap: 6px;
}

.app-tag-icon {
  flex-shrink: 0;
}

.app-tag-dot {
  width: 10px;
  height: 10px;
  background: #009dff;
  flex-shrink: 0;
  border-radius: 2px;
}

.app-tag-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  font-size: 12px;
  color: #666666;
  line-height: 17px;
}

.todo-desc-text {
  vertical-align: middle;
}

.todo-overdue-tag {
  margin-left: 8px;
  vertical-align: middle;
}

.empty-tip {
  padding: 40px;
  text-align: center;
  font-family:
    PingFangSC,
    PingFang SC;
  color: #666666;
  font-size: 14px;
}
</style>
