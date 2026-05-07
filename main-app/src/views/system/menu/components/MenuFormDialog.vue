<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="600px"
    @update:model-value="$emit('update:visible', $event)"
    @closed="$emit('close')"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
      <el-form-item label="菜单名称" prop="title" required>
        <el-input v-model="form.title" placeholder="请输入菜单名称" />
      </el-form-item>

      <el-form-item label="路由路径" prop="path" required>
        <el-input v-if="isEdit" :model-value="fullRoutePath" disabled />
        <el-input v-else v-model="form.path" placeholder="请输入路由路径" class="route-path-input">
          <template v-if="currentAppPrefix" #prepend>
            <span class="input-prepend">{{ currentAppPrefix }}</span>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="权限标识" prop="permission" required>
        <el-input
          v-if="permissionInputMode === 'legacy'"
          v-model="permissionSuffixModel"
          placeholder="请输入权限标识"
          :disabled="isEdit"
        />
        <el-input
          v-else
          v-model="permissionSuffixModel"
          placeholder="请输入菜单代码，例如 user"
          :disabled="isEdit"
        >
          <template v-if="currentPermissionPrefix" #prepend>
            <span class="input-prepend">{{ currentPermissionPrefix }}</span>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item v-if="showTypeField" label="类型" prop="type" required>
        <el-radio-group v-model="form.type" :disabled="isEdit">
          <el-radio-button value="menu">菜单</el-radio-button>
          <el-radio-button value="button">按钮</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="菜单形式" prop="menuForm" required>
        <el-radio-group v-model="form.menuForm">
          <el-radio-button value="route">路由</el-radio-button>
          <el-radio-button value="link">链接</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="打开方式" prop="openMode" required>
        <el-radio-group v-model="form.openMode">
          <el-radio-button value="current">本页面</el-radio-button>
          <el-radio-button value="other">新页面</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否展示" prop="hidden">
        <div class="show-switch">
          <el-switch
            :model-value="!form.hidden"
            @update:model-value="(v) => (form.hidden = !Boolean(v))"
          />
        </div>
      </el-form-item>

      <el-form-item label="所属应用" prop="app" required>
        <el-select v-model="form.app" placeholder="请选择所属应用" style="width: 100%" disabled>
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
          <el-option
            v-for="item in appOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <span class="app-option-cell">
              <MenuIcon v-if="item.iconName" :icon="item.iconName" class="app-option-icon" />
              <span>{{ item.label }}</span>
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="菜单图标" prop="icon">
        <div style="width: 100%">
          <IconSelect v-model="form.icon" />
        </div>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" :max="999" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import type { FormInstance, FormRules } from 'element-plus';
  import type { Menu } from '@/api/menu';
  import MenuIcon from '@/components/MenuIcon.vue';
  import type { AppOption } from '../useMenuList';

  const props = defineProps<{
    visible: boolean;
    title: string;
    isEdit: boolean;
    showTypeField: boolean;
    form: Menu;
    permissionSuffix: string;
    permissionInputMode: 'platform' | 'legacy';
    appOptions: AppOption[];
    rules: FormRules;
    loading?: boolean;
    currentAppPrefix: string;
    currentPermissionPrefix: string;
  }>();

  const emit = defineEmits<{
    'update:visible': [value: boolean];
    'update:permissionSuffix': [value: string];
    close: [];
    submit: [];
  }>();

  const formRef = ref<FormInstance>();

  const permissionSuffixModel = computed({
    get: () => props.permissionSuffix,
    set: (v) => {
      emit('update:permissionSuffix', v);
      props.form.permission = v;
    }
  });

  const fullRoutePath = computed(() => {
    const suffix = (props.form.path || '').trim();
    if (!props.currentAppPrefix) return suffix;
    if (!suffix) return props.currentAppPrefix;
    if (suffix === props.currentAppPrefix || suffix.startsWith(`${props.currentAppPrefix}/`))
      return suffix;
    return `${props.currentAppPrefix}${suffix.startsWith('/') ? '' : '/'}${suffix}`;
  });

  watch(
    () => props.visible,
    (open) => {
      if (open) {
        formRef.value?.clearValidate?.();
      }
    }
  );

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate();
      emit('submit');
    } catch {
      // validation failed
    }
  };

  const getAppIconByValue = (value: string) =>
    props.appOptions.find((item) => item.value === value)?.iconName || '';
</script>

<style scoped>
  .input-prepend {
    color: #909399;
    font-family: monospace;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .show-switch {
    display: inline-flex;
    align-items: center;
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
