<template>
  <el-collapse class="advanced-collapse">
    <el-collapse-item name="linkage">
      <template #title>
        <div class="adv-title">
          <span>联动</span>
        </div>
      </template>
      <div class="linkage-block">
        <div class="linkage-title-row">
          <div class="linkage-title">显示条件</div>
          <el-tooltip placement="top" content="全部条件(AND)满足时显示；未配置则始终显示。">
            <img class="linkage-title-icon" :src="crossFieldInfoIconUrl" alt="info" />
          </el-tooltip>
        </div>
        <div v-if="(model.visibleWhen || []).length === 0" class="linkage-empty">
          未配置：默认始终显示
        </div>
        <div v-for="(c, idx) in model.visibleWhen || []" :key="`vw_${idx}`" class="linkage-row">
          <el-select v-model="c.field" placeholder="字段" style="width: 120px" popper-class="fb-linkage-popper" :teleported="true">
            <el-option v-for="f in currentLinkageFieldOptions" :key="f.value" :value="f.value" :label="f.label" />
          </el-select>
          <el-select v-model="c.op" placeholder="操作符" style="width: 120px" popper-class="fb-linkage-popper" :teleported="true">
            <el-option v-for="op in conditionOps" :key="op.value" :value="op.value" :label="op.label" />
          </el-select>
          <el-input v-model="c.value" placeholder="值（字符串/数字/true/false）" />
          <el-button link type="danger" @click="removeVisibleWhen(idx)">删除</el-button>
        </div>
        <el-button @click="addVisibleWhen">新增显示条件</el-button>
      </div>

      <div class="linkage-block" style="margin-top: 14px">
        <div class="linkage-title-row">
          <div class="linkage-title">禁用条件</div>
          <el-tooltip placement="top" content="全部条件(AND)满足时禁用；未配置则仅由“禁用”开关控制。">
            <img class="linkage-title-icon" :src="crossFieldInfoIconUrl" alt="info" />
          </el-tooltip>
        </div>

        <div v-for="(c, idx) in model.disabledWhen || []" :key="`dw_${idx}`" class="linkage-row">
          <el-select v-model="c.field" placeholder="字段" style="width: 120px" popper-class="fb-linkage-popper" :teleported="true">
            <el-option v-for="f in currentLinkageFieldOptions" :key="f.value" :value="f.value" :label="f.label" />
          </el-select>
          <el-select v-model="c.op" placeholder="操作符" style="width: 120px" popper-class="fb-linkage-popper" :teleported="true">
            <el-option v-for="op in conditionOps" :key="op.value" :value="op.value" :label="op.label" />
          </el-select>
          <el-input v-model="c.value" placeholder="值（字符串/数字/true/false）" />
          <el-button link type="danger" @click="removeDisabledWhen(idx)">删除</el-button>
        </div>
        <el-button @click="addDisabledWhen">新增禁用条件</el-button>
      </div>
    </el-collapse-item>

    <el-collapse-item name="adv">
      <template #title>
        <div class="adv-title">
          <span>高级配置</span>
          <el-tooltip
            placement="top"
            content="用于透传组件 Props（JSON）。示例：输入框 maxlength、select filterable；JSON 不合法不会生效，并会在质量检查提示。"
          >
            <img class="adv-title-icon" :src="crossFieldInfoIconUrl" alt="info" />
          </el-tooltip>
        </div>
      </template>
      <el-form-item label="透传Props">
        <el-input
          :model-value="componentPropsText"
          type="textarea"
          :rows="6"
          placeholder='JSON，例如 {"maxlength": 20, "showWordLimit": true}'
          @update:model-value="(v) => emit('update:component-props-text', String(v ?? ''))"
        />
        <div class="cascader-tools">
          <el-button @click="emit('format-component-props')">格式化</el-button>
          <div class="cascader-hint" :class="{ 'is-error': componentPropsJsonError }">
            {{ componentPropsJsonError ? componentPropsJsonError : '仅在需要高级配置时使用，JSON 解析失败会忽略。' }}
          </div>
        </div>
      </el-form-item>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FormFieldCondition, FormFieldConditionOp, FormFieldSchema } from '@/types/formBuilder';

type ConditionOpOption = { value: FormFieldConditionOp; label: string };
type LinkageOption = { value: string; label: string };

const props = defineProps<{
  field: FormFieldSchema;
  crossFieldInfoIconUrl: string;
  currentLinkageFieldOptions: LinkageOption[];
  conditionOps: ConditionOpOption[];
  componentPropsText: string;
  componentPropsJsonError: string;
}>();

const emit = defineEmits<{
  (e: 'update-field', value: FormFieldSchema): void;
  (e: 'update:component-props-text', value: string): void;
  (e: 'format-component-props'): void;
}>();

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));
const model = ref<FormFieldSchema>(deepClone(props.field));
const syncingFromParent = ref(false);

watch(
  () => props.field,
  (next) => {
    syncingFromParent.value = true;
    model.value = deepClone(next);
    setTimeout(() => {
      syncingFromParent.value = false;
    }, 0);
  },
  { deep: true }
);

watch(
  model,
  (next) => {
    if (syncingFromParent.value) return;
    emit('update-field', deepClone(next));
  },
  { deep: true }
);

const addVisibleWhen = () => {
  model.value.visibleWhen = model.value.visibleWhen || [];
  const first = props.currentLinkageFieldOptions[0]?.value || '';
  const c: FormFieldCondition = { field: first, op: '==' as FormFieldConditionOp, value: '' };
  model.value.visibleWhen.push(c);
};

const removeVisibleWhen = (idx: number) => {
  if (!model.value.visibleWhen) return;
  model.value.visibleWhen.splice(idx, 1);
};

const addDisabledWhen = () => {
  model.value.disabledWhen = model.value.disabledWhen || [];
  const first = props.currentLinkageFieldOptions[0]?.value || '';
  const c: FormFieldCondition = { field: first, op: '==' as FormFieldConditionOp, value: '' };
  model.value.disabledWhen.push(c);
};

const removeDisabledWhen = (idx: number) => {
  if (!model.value.disabledWhen) return;
  model.value.disabledWhen.splice(idx, 1);
};
</script>

<style scoped lang="scss">
.advanced-collapse {
  margin-top: 12px;
}

.adv-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.adv-title-icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  cursor: help;
  opacity: 0.85;
}

.adv-title-icon:hover {
  opacity: 1;
}

.linkage-block {
  padding: 8px 0;
}

.linkage-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.linkage-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.linkage-title-row .linkage-title {
  margin-bottom: 0;
}

.linkage-title-icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  cursor: help;
  opacity: 0.85;
}

.linkage-title-icon:hover {
  opacity: 1;
}

.linkage-empty {
  color: #888;
  font-size: 12px;
  margin-bottom: 10px;
}

.linkage-row {
  display: grid;
  grid-template-columns: 120px 120px 1fr auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  min-width: 520px;
}

:deep(.fb-linkage-popper) {
  z-index: 4000 !important;
}

.cascader-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.cascader-hint {
  color: #888;
  font-size: 12px;
}

.cascader-hint.is-error {
  color: var(--el-color-danger);
}
</style>
