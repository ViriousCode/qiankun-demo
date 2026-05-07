<template>
  <el-collapse-item name="cross">
    <template #title>
      <div class="adv-title">
        <span>跨字段规则</span>
        <el-tooltip
          placement="top"
          content="跨字段规则用于表达跨字段约束：每条规则的所有条件(AND)都必须满足，否则校验失败。提示信息会定位到未满足条件的字段。"
        >
          <img class="adv-title-icon" :src="crossFieldInfoIconUrl" alt="info" />
        </el-tooltip>
      </div>
    </template>

    <div class="cf-toolbar">
      <el-button type="primary" plain @click="addCrossRule">新增规则</el-button>
      <div class="cf-toolbar-spacer" />
      <el-switch :model-value="advanced" @update:model-value="(v) => emit('update:advanced', Boolean(v))" />
      <span class="cf-adv-label">JSON</span>
    </div>

    <div v-if="localRules.length === 0" class="cf-empty">
      未配置：默认不启用跨字段规则。
    </div>

    <el-card v-for="(rule, rIdx) in localRules" :key="rule.id || rIdx" shadow="never" class="cf-rule-card">
      <div class="cf-rule-head">
        <div class="cf-rule-title">规则 {{ rIdx + 1 }}</div>
        <div class="cf-rule-actions">
          <el-button size="small" @click="addCrossRuleCond(rIdx)">新增条件</el-button>
          <el-button size="small" type="danger" plain @click="removeCrossRule(rIdx)">删除规则</el-button>
        </div>
      </div>

      <el-form label-width="90px" class="cf-rule-form">
        <el-form-item label="提示文案">
          <el-input v-model="rule.message" placeholder="不满足条件时提示的错误信息" />
        </el-form-item>

        <el-form-item label="条件逻辑">
          <el-radio-group v-model="(rule as any).logic">
            <el-radio-button label="AND">AND（全部满足）</el-radio-button>
            <el-radio-button label="OR">OR（满足任一）</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="`条件(${(rule as any).logic || 'AND'})`">
          <div class="cf-cond-list">
            <div v-for="(c, cIdx) in rule.when" :key="`${rIdx}_${cIdx}`" class="cf-cond-row">
              <el-select v-model="c.field" placeholder="字段" class="cf-cond-field">
                <el-option v-for="f in crossFieldFieldOptions" :key="f.value" :value="f.value" :label="f.label" />
              </el-select>
              <el-select v-model="c.op" placeholder="操作符" class="cf-cond-op">
                <el-option v-for="op in conditionOps" :key="op.value" :value="op.value" :label="op.label" />
              </el-select>
              <el-input v-model="c.value" placeholder="值（字符串/数字/true/false）" />
              <el-button link type="danger" @click="removeCrossRuleCond(rIdx, cIdx)">删除</el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <div v-if="rulesJsonError" class="rules-hint is-error">
      {{ rulesJsonError }}
    </div>

    <el-collapse :model-value="advancedCollapse" class="cf-adv-collapse" @update:model-value="onAdvancedCollapseChange">
      <el-collapse-item v-if="advanced" name="json" title="高级：JSON 编辑">
        <el-input
          :model-value="rulesText"
          type="textarea"
          :rows="6"
          placeholder='JSON 数组，例如：[{ "message": "...", "when": [{ "field": "phone", "op": "==", "value": "138" }] }]'
          @update:model-value="(v) => emit('update:rules-text', String(v ?? ''))"
        />
        <div class="rules-hint">
          提示：这里用于复制/粘贴；如果 JSON 不合法，会阻止保存。
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-collapse-item>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FormCrossFieldRule, FormFieldConditionOp } from '@/types/formBuilder';

type FieldOption = { value: string; label: string };
type ConditionOp = { value: FormFieldConditionOp; label: string };

const props = defineProps<{
  rules: FormCrossFieldRule[];
  advanced: boolean;
  advancedCollapse: string[];
  rulesText: string;
  rulesJsonError: string;
  crossFieldInfoIconUrl: string;
  crossFieldFieldOptions: FieldOption[];
  conditionOps: ConditionOp[];
}>();

const emit = defineEmits<{
  (e: 'update:rules', value: FormCrossFieldRule[]): void;
  (e: 'update:advanced', value: boolean): void;
  (e: 'update:advanced-collapse', value: string[]): void;
  (e: 'update:rules-text', value: string): void;
}>();

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));
const localRules = ref<FormCrossFieldRule[]>(deepClone(props.rules || []));
const syncingFromParent = ref(false);

watch(
  () => props.rules,
  (next) => {
    syncingFromParent.value = true;
    localRules.value = deepClone(next || []);
    setTimeout(() => {
      syncingFromParent.value = false;
    }, 0);
  },
  { deep: true }
);

watch(
  localRules,
  (next) => {
    if (syncingFromParent.value) return;
    emit('update:rules', deepClone(next || []));
  },
  { deep: true }
);

const addCrossRule = () => {
  localRules.value = localRules.value || [];
  localRules.value.push({
    id: `r_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    message: '跨字段规则未通过',
    logic: 'AND',
    when: [{ field: props.crossFieldFieldOptions[0]?.value || '', op: '==' as FormFieldConditionOp, value: '' }]
  } as any);
};

const removeCrossRule = (idx: number) => {
  localRules.value.splice(idx, 1);
};

const addCrossRuleCond = (rIdx: number) => {
  const r = localRules.value[rIdx];
  if (!r) return;
  r.when = Array.isArray(r.when) ? r.when : [];
  r.when.push({
    field: props.crossFieldFieldOptions[0]?.value || '',
    op: '==' as FormFieldConditionOp,
    value: ''
  });
};

const removeCrossRuleCond = (rIdx: number, cIdx: number) => {
  const r = localRules.value[rIdx];
  if (!r?.when) return;
  r.when.splice(cIdx, 1);
};

const onAdvancedCollapseChange = (value: unknown) => {
  emit('update:advanced-collapse', Array.isArray(value) ? value.map((x) => String(x)) : []);
};
</script>

<style scoped lang="scss">
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

.rules-hint {
  margin-top: 8px;
  color: #888;
  font-size: 12px;
}

.rules-hint.is-error {
  color: var(--el-color-danger);
}

.cf-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.cf-toolbar-spacer {
  flex: 1;
}

.cf-adv-label {
  font-size: 12px;
  color: #666;
}

.cf-empty {
  color: #888;
  font-size: 12px;
  padding: 8px 0 2px;
}

.cf-rule-card {
  margin-bottom: 10px;
  border-radius: 10px;
}

.cf-rule-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.cf-rule-title {
  font-weight: 600;
}

.cf-rule-actions {
  display: flex;
  gap: 8px;
}

.cf-cond-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cf-cond-row {
  width: 100%;
  display: grid;
  grid-template-columns: 160px 140px 1fr auto;
  gap: 8px;
  align-items: center;
}

.cf-cond-row > * {
  min-width: 0;
}

.cf-cond-field,
.cf-cond-op {
  width: 100%;
}

.cf-cond-row :deep(.el-input__wrapper) {
  width: 100%;
}

.cf-adv-collapse {
  margin-top: 10px;
}
</style>
