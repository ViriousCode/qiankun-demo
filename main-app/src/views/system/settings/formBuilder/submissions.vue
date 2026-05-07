<template>
  <div class="page-container">
    <div class="page-head">
      <div>
        <h2 class="page-title">提交记录</h2>
      </div>
      <div class="page-actions">
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <div class="page-card">
      <el-table
        class="page-table page-table--respect-column-align"
        :data="tableData"
        v-loading="loading"
        border
      >
        <template #empty>
          <TableEmpty />
        </template>
        <el-table-column type="index" label="序号" width="60" align="left" header-align="left" />
        <el-table-column prop="id" label="ID" width="100" align="left" header-align="left" />
        <el-table-column
          prop="createTime"
          label="提交时间"
          width="180"
          align="left"
          header-align="left"
        />
        <el-table-column
          label="内容"
          min-width="220"
          align="left"
          header-align="left"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="payload-preview">{{ previewPayload(row.payload) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="left" header-align="left">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="query.pageIndex"
          v-model:page-size="query.pageSize"
          :page-sizes="PAGE_SIZES"
          :layout="PAGINATION_LAYOUT"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <el-dialog v-model="detailVisible" title="提交内容" width="720px">
      <pre class="payload-pre">{{ detailText }}</pre>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue';
  import { ElMessage } from 'element-plus';
  import { useRoute, useRouter } from 'vue-router';
  import { getFormDefinitionDetail, getFormSubmissionList } from '@/api/formDefinition';
  import type { FormDefinition, FormSubmission } from '@/types/formBuilder';
  import { PAGINATION_LAYOUT } from '@/config';

  const route = useRoute();
  const router = useRouter();

  const formId = computed(() => {
    const raw = route.query.id;
    const n = parseInt(Array.isArray(raw) ? raw[0] : (raw as any), 10);
    return Number.isFinite(n) ? n : null;
  });

  const form = ref<FormDefinition | null>(null);

  const PAGE_SIZES = [10, 20, 50, 100];
  const query = reactive({ pageIndex: 1, pageSize: 10 });
  const tableData = ref<FormSubmission[]>([]);
  const total = ref(0);
  const loading = ref(false);

  const detailVisible = ref(false);
  const detailText = ref('');

  const loadForm = async () => {
    if (formId.value == null) {
      ElMessage.error('缺少表单 id');
      return;
    }
    form.value = await getFormDefinitionDetail(formId.value);
  };

  const fetchList = async () => {
    if (formId.value == null) return;
    loading.value = true;
    try {
      const payload = await getFormSubmissionList(formId.value, { ...query });
      tableData.value = payload?.list || [];
      total.value = payload?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const handleSizeChange = (size: number) => {
    query.pageSize = size;
    query.pageIndex = 1;
    fetchList();
  };

  const handlePageChange = (page: number) => {
    query.pageIndex = page;
    fetchList();
  };

  const previewPayload = (payload: any) => {
    try {
      const text = JSON.stringify(payload || {});
      return text.length > 120 ? `${text.slice(0, 120)}...` : text;
    } catch {
      return String(payload || '');
    }
  };

  const openDetail = (row: FormSubmission) => {
    try {
      detailText.value = JSON.stringify(row.payload || {}, null, 2);
    } catch {
      detailText.value = String(row.payload || '');
    }
    detailVisible.value = true;
  };

  const goBack = () => {
    router.push('/system/settings/formBuilder');
  };

  onMounted(async () => {
    await loadForm();
    await fetchList();
  });
</script>

<style scoped lang="scss">
  .page-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .page-subtitle {
    color: #666;
    font-size: 12px;
    margin-top: 4px;
  }

  .page-actions {
    display: flex;
    gap: 10px;
  }

  .payload-pre {
    white-space: pre-wrap;
    word-break: break-word;
    background: #0b1020;
    color: #e6e6e6;
    padding: 12px;
    border-radius: 8px;
    max-height: 60vh;
    overflow: auto;
  }

  .payload-preview {
    color: #444;
  }
</style>
