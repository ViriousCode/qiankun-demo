<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="所属应用" prop="appName">
        <el-select v-model="form.appName" disabled style="width: 100%">
          <template #label="{ label, value }">
            <span class="app-option-cell">
              <MenuIcon
                v-if="getAppIconByValue(String(value || ''))"
                :icon="getAppIconByValue(String(value || ''))"
                class="app-option-icon"
              />
              <span>{{ label }}</span>
            </span>
          </template>
          <el-option v-for="item in appOptions" :key="item.value" :label="item.label" :value="item.value">
            <span class="app-option-cell">
              <MenuIcon v-if="item.iconName" :icon="item.iconName" class="app-option-icon" />
              <span>{{ item.label }}</span>
            </span>
          </el-option>
          <el-option
            v-if="!appOptions.some((item) => item.value === form.appName)"
            :label="form.appName"
            :value="form.appName"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="API名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入 API 名称" />
      </el-form-item>
      <el-form-item label="接口路径" prop="path">
        <el-input
          v-model="pathSuffixModel"
          placeholder="/auth/login"
          class="route-path-input"
          :disabled="isEditMode"
        >
          <template v-if="pathPrefix && !isEditMode" #prepend>
            <span class="input-prepend">{{ pathPrefix }}</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="请求方式" prop="method">
        <el-radio-group v-model="form.method">
          <el-radio-button v-for="item in methodOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="权限标识" prop="permissionCode">
        <el-input :model-value="permissionCode" disabled />
      </el-form-item>
      <el-form-item label="是否鉴权" prop="needAuth">
        <el-switch v-model="form.needAuth" />
      </el-form-item>
      <el-form-item prop="isCommon">
        <template #label>
          <span class="label-with-tip">
            <span>是否通用</span>
            <el-tooltip placement="top" trigger="hover">
              <template #content>
                <span class="hint-content">通用API指的是所有用户都有权限访问的接口</span>
              </template>
              <el-icon class="hint-icon">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </span>
        </template>
        <el-switch v-model="form.isCommon" />
      </el-form-item>
      <el-form-item v-if="!isEditMode" label="是否启用" prop="enabled">
        <el-switch v-model="form.enabled" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, ref, toRefs } from 'vue';
  import type { FormInstance, FormRules } from 'element-plus';
  import { QuestionFilled } from '@element-plus/icons-vue';
  import MenuIcon from '@/components/MenuIcon.vue';
  import type { ApiMethod } from '@/api/systemApi';
  import type { ApiFormModel } from '../useApiForm';
  import type { ApiAppOption } from '../useApiList';

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    submit: [];
  }>();

  const formRef = ref<FormInstance>();
  const props = defineProps<{
    modelValue: boolean;
    title: string;
    form: ApiFormModel;
    appOptions: ApiAppOption[];
    pathPrefix: string;
    permissionCode: string;
    methodOptions: Array<{ label: ApiMethod; value: ApiMethod }>;
    rules: FormRules;
    loading?: boolean;
  }>();
  const {
    modelValue,
    title,
    form,
    appOptions,
    pathPrefix,
    permissionCode,
    methodOptions,
    rules,
    loading
  } = toRefs(props);
  const isEditMode = computed(() => form.value.id != null);

  const pathSuffixModel = computed({
    get: () => {
      if (isEditMode.value) return String(form.value.path || '').trim();

      const prefix = String(pathPrefix.value || '').trim();
      const fullPath = String(form.value.path || '').trim();
      if (!prefix) return fullPath;
      if (!fullPath) return '';
      if (fullPath === prefix) return '';
      if (fullPath.startsWith(`${prefix}/`)) return fullPath.slice(prefix.length);
      return fullPath;
    },
    set: (value: string) => {
      const prefix = String(pathPrefix.value || '').trim();
      const suffix = String(value || '')
        .trim()
        .replace(/\/{2,}/g, '/');
      if (!prefix) {
        form.value.path = suffix;
        return;
      }
      form.value.path = suffix ? `${prefix}${suffix.startsWith('/') ? '' : '/'}${suffix}` : prefix;
    }
  });

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate();
      emit('submit');
    } catch {
      // 校验未通过
    }
  };

  const getAppIconByValue = (value: string) =>
    appOptions.value.find((item) => item.value === value)?.iconName || '';
</script>

<style scoped>
  .input-prepend {
    color: #909399;
    font-family: monospace;
  }

  .label-with-tip {
    display: inline-flex;
    align-items: center;
    height: 32px;
    line-height: 32px;
  }

  .hint-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 6px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
  }

  .hint-content {
    white-space: pre-line;
  }

  .app-option-cell {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 100%;
    line-height: 1;
  }

  .app-option-icon {
    display: inline-flex;
    align-items: center;
  }

  .app-option-icon :deep(.menu-icon-wrapper) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px !important;
    height: 14px !important;
    font-size: 14px !important;
    margin-right: 0 !important;
  }

  :deep(.el-select__selected-item) {
    display: flex;
    align-items: center;
    min-height: 100%;
  }

  :deep(.el-select__selected-item .app-option-cell) {
    display: inline-flex;
    align-items: center;
  }
</style>
