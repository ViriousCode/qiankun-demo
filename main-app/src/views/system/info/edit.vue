<template>
  <div class="page-container" v-loading="detailLoading">
    <h2 class="page-title">{{ pageTitle }}</h2>
    <div class="page-card">
      <el-form ref="formRef" class="info-form" :model="formData" :rules="rules" label-width="90px">
        <el-form-item label="资讯标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入资讯标题"
            maxlength="120"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="资讯分类" prop="infoCategory">
          <el-select
            v-model="formData.infoCategory"
            placeholder="请选择资讯分类"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="item in INFO_CLASSIFY_OPTIONS"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="资讯类型" prop="infoType">
          <el-radio-group v-model="formData.infoType">
            <el-radio v-for="item in INFO_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="外部链接" prop="externalLink" v-if="isExternal">
          <el-input v-model="formData.externalLink" placeholder="请输入外部链接（https://...）" />
        </el-form-item>

        <el-form-item label="发布人" prop="publisher">
          <el-input v-model="formData.publisher" placeholder="请输入发布人" maxlength="30" />
        </el-form-item>

        <el-form-item label="资讯内容" prop="content" class="content-item" v-if="!isExternal">
          <InfoEditor v-model="formData.content" placeholder="请输入资讯内容（富文本）" />
        </el-form-item>

        <el-form-item class="action-row">
          <el-button @click="handleBack">取消</el-button>
          <el-button type="primary" plain :loading="submitLoading" @click="handleSaveDraft">
            保存草稿
          </el-button>
          <el-button type="primary" :loading="submitLoading" @click="handlePublish">发布</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type { FormInstance } from 'element-plus';
  import { useInfoForm } from './useInfoForm';
  import { INFO_CLASSIFY_OPTIONS, INFO_TYPE_OPTIONS } from './constants';
  import InfoEditor from './components/InfoEditor.vue';

  const route = useRoute();
  const router = useRouter();
  const formRef = ref<FormInstance>();

  const {
    formData,
    detailLoading,
    submitLoading,
    rules,
    isExternal,
    pageTitle,
    loadDetail,
    submitForm
  } = useInfoForm();

  const parseId = () => {
    const rawId = route.query.id;
    const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!Number.isFinite(id) || id <= 0) return undefined;
    return id;
  };

  const submitByStatus = async (targetStatus: 0 | 1) => {
    if (!formRef.value) return;
    try {
      if (targetStatus === 1) {
        await formRef.value.validate();
      }
      await submitForm(targetStatus);
      router.push('/system/info');
    } catch (_) {}
  };

  const handleSaveDraft = async () => {
    await submitByStatus(0);
  };

  const handlePublish = async () => {
    await submitByStatus(1);
  };

  const handleBack = () => {
    router.push('/system/info');
  };

  onMounted(async () => {
    const id = parseId();
    if (id != null) {
      await loadDetail(id);
    }
  });
</script>

<style scoped>
  .page-container {
    display: flex;
    flex-direction: column;
  }

  .info-form {
    margin-top: 16px;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .action-row :deep(.el-form-item__content) {
    justify-content: flex-end;
  }

  .action-row {
    margin-top: auto;
  }

  .content-item {
    margin-bottom: 16px;
    flex: 1;
    min-height: 0;
  }

  .content-item :deep(.el-form-item__content) {
    width: 100%;
  }

  .content-item :deep(.editor-wrapper) {
    width: 100%;
    height: 100%;
  }
</style>
