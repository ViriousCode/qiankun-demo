<template>
  <div class="page-container">
    <h2 class="page-title">预览填报</h2>
    <div class="page-card">
      <div class="toolbar-row">
        <div />
        <div class="page-actions">
          <el-button @click="goBack">返回</el-button>
          <el-button type="primary" :loading="submitting" @click="submit">提交</el-button>
        </div>
      </div>

      <div class="form-scroll-y">
        <FormRenderer
          ref="rendererRef"
          :schema="form?.schema || []"
          v-model="model"
          :cross-field-rules="form?.crossFieldRules || []"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { ElMessage } from 'element-plus';
  import { useRoute, useRouter } from 'vue-router';
  import { addFormSubmission, getFormDefinitionDetail } from '@/api/formDefinition';
  import type { FormDefinition } from '@/types/formBuilder';
  import FormRenderer from './components/FormRenderer.vue';

  const route = useRoute();
  const router = useRouter();

  const formId = computed(() => {
    const raw = route.query.id;
    const n = parseInt(Array.isArray(raw) ? raw[0] : (raw as any), 10);
    return Number.isFinite(n) ? n : null;
  });

  const form = ref<FormDefinition | null>(null);
  const model = ref<Record<string, any>>({});
  const submitting = ref(false);
  const rendererRef = ref<any>();

  const load = async () => {
    if (formId.value == null) {
      ElMessage.error('缺少表单 id');
      return;
    }
    form.value = await getFormDefinitionDetail(formId.value);
  };

  const submit = async () => {
    if (formId.value == null) return;
    const formInst = rendererRef.value?.formRef;
    if (formInst) {
      try {
        const runValidate = () =>
          new Promise<{ valid: boolean; fields?: Record<string, any> }>((resolve) => {
            formInst.validate((valid: boolean, fields: any) => resolve({ valid, fields }));
          });

        const extractFromFields = (fields: any) => {
          if (!fields || typeof fields !== 'object') return '';
          const preferKey = '__fb_crossfield__';
          const keys = Object.keys(fields);
          const ordered = keys.includes(preferKey) ? [preferKey, ...keys.filter((k) => k !== preferKey)] : keys;
          for (const k of ordered) {
            const arr = fields[k];
            const msg = Array.isArray(arr) ? arr[0]?.message : '';
            if (msg) return String(msg);
          }
          return '';
        };

        const { valid, fields } = await runValidate();
        if (!valid) {
          const msg = extractFromFields(fields) || '校验未通过：请检查字段校验或跨字段规则';
          ElMessage.error(msg);
          return;
        }
      } catch {
        ElMessage.error('校验未通过：请检查字段校验或跨字段规则');
        return;
      }
    }

    submitting.value = true;
    try {
      await addFormSubmission(formId.value, model.value || {});
      ElMessage.success('提交成功');
      model.value = {};
    } finally {
      submitting.value = false;
    }
  };

  const goBack = () => {
    router.push('/system/settings/formBuilder');
  };

  onMounted(() => {
    load();
  });
</script>

<style scoped lang="scss">
  .toolbar-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .page-actions {
    display: flex;
    gap: 10px;
  }

  .form-scroll-y {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
