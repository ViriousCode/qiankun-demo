<template>
  <el-form-item label="分组">
    <el-select
      :model-value="model.groupId || ''"
      placeholder="未分组"
      clearable
      style="width: 100%"
      @update:model-value="(v: unknown) => emit('update-group-id', v)"
    >
      <el-option label="未分组" :value="''" />
      <el-option v-for="g in canvasGroups" :key="g.id" :label="g.title" :value="g.id" />
    </el-select>
  </el-form-item>
  <el-form-item label="标题">
    <el-input v-model="model.label" />
  </el-form-item>
  <el-form-item label="字段名">
    <el-input v-model="model.field" placeholder="例如 customerName" />
  </el-form-item>
  <el-form-item label="占用列">
    <el-slider v-model="model.span" :min="1" :max="24" show-input />
  </el-form-item>
  <el-form-item label="必填">
    <el-switch v-model="model.required" />
  </el-form-item>
  <el-form-item v-if="model.required" label="必填提示">
    <el-input v-model="model.requiredMessage" placeholder="必填为空时提示" />
  </el-form-item>
  <el-form-item label="禁用">
    <el-switch v-model="model.disabled" />
  </el-form-item>
  <el-form-item v-if="supportsPlaceholder(model.type)" label="提示">
    <el-input v-model="model.placeholder" />
  </el-form-item>

  <template v-if="supportsTextLength(model.type)">
    <el-form-item label="最小长度">
      <el-input-number v-model="model.minLength" :min="0" :step="1" style="width: 100%" />
    </el-form-item>
    <el-form-item label="最大长度">
      <el-input-number v-model="model.maxLength" :min="0" :step="1" style="width: 100%" />
    </el-form-item>
  </template>

  <template v-if="supportsNumberRange(model.type)">
    <el-form-item label="最小值">
      <el-input-number v-model="model.min" style="width: 100%" />
    </el-form-item>
    <el-form-item label="最大值">
      <el-input-number v-model="model.max" style="width: 100%" />
    </el-form-item>
  </template>

  <template v-if="model.type === 'number'">
    <el-form-item label="精度">
      <el-input-number v-model="model.precision" :min="0" :max="10" :step="1" style="width: 100%" />
    </el-form-item>
  </template>

  <template v-if="model.type === 'date'">
    <el-form-item label="最小日期">
      <el-input v-model="model.minDate" placeholder="例如 2026-01-01（可解析为 Date）" />
    </el-form-item>
    <el-form-item label="最大日期">
      <el-input v-model="model.maxDate" placeholder="例如 2026-12-31（可解析为 Date）" />
    </el-form-item>
  </template>

  <template v-else-if="model.type === 'datetime'">
    <el-form-item label="最小日期时间">
      <el-input v-model="model.minDateTime" placeholder="例如 2026-01-01 00:00:00" />
    </el-form-item>
    <el-form-item label="最大日期时间">
      <el-input v-model="model.maxDateTime" placeholder="例如 2026-12-31 23:59:59" />
    </el-form-item>
  </template>

  <template v-else-if="model.type === 'time'">
    <el-form-item label="最小时间">
      <el-input v-model="model.minTime" placeholder="例如 09:00:00" />
    </el-form-item>
    <el-form-item label="最大时间">
      <el-input v-model="model.maxTime" placeholder="例如 18:00:00" />
    </el-form-item>
  </template>

  <template v-if="supportsPattern(model.type)">
    <el-form-item label="正则预设">
      <el-select
        v-model="model.patternPreset"
        placeholder="选择预设或自定义"
        clearable
        style="width: 100%"
        @change="(v) => emit('pattern-preset-change', v as string | undefined)"
      >
        <el-option v-for="p in patternPresets" :key="p.key" :label="p.label" :value="p.key" />
      </el-select>
    </el-form-item>
    <el-form-item label="正则">
      <el-input v-model="model.pattern" placeholder="例如 ^\\d{11}$ 或 /^\\d{11}$/i" />
    </el-form-item>
    <el-form-item label="提示文案">
      <el-input v-model="model.patternMessage" placeholder="格式不正确时提示" />
    </el-form-item>
  </template>

  <template v-if="supportsOptions(model.type)">
    <el-form-item label="选项来源">
      <el-select
        v-model="model.dataSourceType"
        style="width: 100%"
        @change="() => emit('data-source-type-change')"
      >
        <el-option value="static" label="静态 options（默认）" />
        <el-option value="remote" label="远程接口" />
      </el-select>
    </el-form-item>

    <template v-if="model.dataSourceType === 'remote'">
      <el-form-item label="远程配置(JSON)">
        <el-input
          :model-value="dataSourceText"
          type="textarea"
          :rows="6"
          placeholder='例如：{ "type":"remote","method":"GET","url":"/api/system/form-builder/options/demo","listPath":"list","labelKey":"label","valueKey":"value","cacheTtlMs":60000 }'
          @update:model-value="(v) => emit('update:data-source-text', String(v ?? ''))"
        />
        <div class="cascader-tools">
          <el-button @click="emit('format-data-source')">格式化</el-button>
          <div class="cascader-hint" :class="{ 'is-error': dataSourceJsonError }">
            {{ dataSourceJsonError || '提示：必须是可 JSON 序列化的对象；解析失败将不会生效。' }}
          </div>
        </div>
      </el-form-item>
    </template>

    <div class="options-head">
      <div class="options-title">选项</div>
      <el-button @click="emit('add-option')">新增</el-button>
    </div>
    <div v-for="(opt, idx) in model.options || []" :key="idx" class="option-row">
      <el-input v-model="opt.label" placeholder="label" />
      <el-input v-model="opt.value" placeholder="value" />
      <el-button link type="danger" @click="emit('remove-option', idx)">删除</el-button>
    </div>
  </template>

  <template v-if="model.type === 'cascader'">
    <el-form-item label="级联选项">
      <el-input
        :model-value="cascaderOptionsText"
        type="textarea"
        :rows="6"
        placeholder='请输入 JSON，例如 [{"label":"浙江","value":"zj","children":[{"label":"杭州","value":"hz"}]}]'
        @update:model-value="(v) => emit('update:cascader-options-text', String(v ?? ''))"
      />
      <div class="cascader-tools">
        <el-button @click="emit('format-cascader-options')">格式化</el-button>
        <div class="cascader-hint" :class="{ 'is-error': cascaderJsonError }">
          {{ cascaderJsonError ? cascaderJsonError : '提示：粘贴 JSON 后会自动解析，格式不对不会打断输入。' }}
        </div>
      </div>
    </el-form-item>
  </template>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FormCanvasGroup, FormFieldSchema, FormFieldType } from '@/types/formBuilder';

type PatternPreset = { key: string; label: string; pattern: string; message: string };

const props = defineProps<{
  field: FormFieldSchema;
  canvasGroups: FormCanvasGroup[];
  supportsPlaceholder: (type: FormFieldType) => boolean;
  supportsTextLength: (type: FormFieldType) => boolean;
  supportsNumberRange: (type: FormFieldType) => boolean;
  supportsPattern: (type: FormFieldType) => boolean;
  supportsOptions: (type: FormFieldType) => boolean;
  patternPresets: PatternPreset[];
  dataSourceText: string;
  dataSourceJsonError: string;
  cascaderOptionsText: string;
  cascaderJsonError: string;
}>();

const emit = defineEmits<{
  (e: 'update-group-id', value: unknown): void;
  (e: 'update-field', value: FormFieldSchema): void;
  (e: 'pattern-preset-change', value: string | undefined): void;
  (e: 'data-source-type-change'): void;
  (e: 'update:data-source-text', value: string): void;
  (e: 'format-data-source'): void;
  (e: 'add-option'): void;
  (e: 'remove-option', idx: number): void;
  (e: 'update:cascader-options-text', value: string): void;
  (e: 'format-cascader-options'): void;
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
</script>

<style scoped lang="scss">
.options-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 6px 0 10px;
}

.options-title {
  font-weight: 600;
}

.option-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
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
