<template>
  <el-form ref="formRef" :model="localModel" :rules="rules" label-width="110px" class="fb-form">
    <el-row :gutter="20">
      <el-col v-for="item in renderedSchema" :key="item.uid" :span="normalizeSpan(item.span)">
        <el-form-item :prop="item.field" :label="item.label">
          <template v-if="item.type === 'autocomplete'">
            <el-autocomplete
              v-model="localModel[item.field]"
              v-bind="getComponentProps(item)"
              :fetch-suggestions="getAutocompleteFetcher(item)"
            />
          </template>

          <template v-else-if="item.type === 'cascader'">
            <el-cascader
              v-model="localModel[item.field]"
              v-bind="getComponentProps(item)"
              :options="item.treeOptions || []"
            />
          </template>

          <template v-else-if="item.type === 'icon'">
            <IconSelect v-model="localModel[item.field]" />
          </template>

          <template v-else-if="item.type === 'richtext'">
            <RichTextEditor
              v-model="localModel[item.field]"
              :placeholder="item.placeholder"
              :disabled="Boolean(disabled || item.disabled)"
              :min-height="320"
            />
          </template>

          <template v-else-if="item.type === 'select'">
            <div class="fb-field-wrap">
              <el-select v-model="localModel[item.field]" v-bind="getComponentProps(item)">
                <el-option
                  v-for="opt in resolvedOptions(item)"
                  :key="String(opt.value)"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
              <div v-if="remoteMeta(item.field)?.error" class="fb-remote-row">
                <el-text type="danger" size="small">{{ remoteMeta(item.field)?.error }}</el-text>
                <el-button size="small" link type="primary" @click="retryRemote(item)">重试</el-button>
              </div>
            </div>
          </template>

          <template v-else-if="item.type === 'radio'">
            <div class="fb-field-wrap">
              <el-radio-group v-model="localModel[item.field]" v-bind="getComponentProps(item)">
                <el-radio
                  v-for="opt in resolvedOptions(item)"
                  :key="String(opt.value)"
                  :label="opt.value"
                >
                  {{ opt.label }}
                </el-radio>
              </el-radio-group>
              <div v-if="remoteMeta(item.field)?.error" class="fb-remote-row">
                <el-text type="danger" size="small">{{ remoteMeta(item.field)?.error }}</el-text>
                <el-button size="small" link type="primary" @click="retryRemote(item)">重试</el-button>
              </div>
            </div>
          </template>

          <template v-else-if="item.type === 'checkbox'">
            <div class="fb-field-wrap">
              <el-checkbox-group v-model="localModel[item.field]" v-bind="getComponentProps(item)">
                <el-checkbox
                  v-for="opt in resolvedOptions(item)"
                  :key="String(opt.value)"
                  :label="opt.value"
                >
                  {{ opt.label }}
                </el-checkbox>
              </el-checkbox-group>
              <div v-if="remoteMeta(item.field)?.error" class="fb-remote-row">
                <el-text type="danger" size="small">{{ remoteMeta(item.field)?.error }}</el-text>
                <el-button size="small" link type="primary" @click="retryRemote(item)">重试</el-button>
              </div>
            </div>
          </template>

          <template v-else>
            <component
              :is="resolveComponent(item)"
              v-model="localModel[item.field]"
              v-bind="getComponentProps(item)"
            />
          </template>
        </el-form-item>
      </el-col>
    </el-row>

    <!-- Hidden anchor for cross-field validation (must exist as a form prop) -->
    <el-form-item v-show="false" :prop="CROSS_FIELD_HIDDEN_PROP" label-width="0">
      <el-input v-model="localModel[CROSS_FIELD_HIDDEN_PROP]" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
  import type { FormCrossFieldRule, FormFieldCondition, FormFieldSchema } from '@/types/formBuilder';
  import IconSelect from '@/components/IconSelect.vue';
  import RichTextEditor from './RichTextEditor.vue';
  import request from '@/utils/request';
  import { mapRemoteOptions } from '../utils';

  const props = defineProps<{
    schema: FormFieldSchema[];
    modelValue: Record<string, any>;
    disabled?: boolean;
    crossFieldRules?: FormCrossFieldRule[];
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', v: Record<string, any>): void;
  }>();

  const formRef = ref<any>();
  defineExpose({ formRef });

  const localModel = reactive<Record<string, any>>({});
  const syncing = ref(false);

  const CROSS_FIELD_HIDDEN_PROP = '__fb_crossfield__';

  const schemaSig = computed(() => {
    const list = (props.schema || []).map((f) => ({
      uid: f.uid,
      type: f.type,
      field: f.field,
      label: f.label,
      required: !!f.required,
      requiredMessage: f.requiredMessage || '',
      pattern: f.pattern || '',
      patternMessage: f.patternMessage || '',
      minLength: f.minLength ?? null,
      maxLength: f.maxLength ?? null,
      min: f.min ?? null,
      max: f.max ?? null,
      precision: f.precision ?? null,
      minDate: f.minDate ?? null,
      maxDate: f.maxDate ?? null,
      minDateTime: f.minDateTime ?? null,
      maxDateTime: f.maxDateTime ?? null,
      minTime: f.minTime ?? null,
      maxTime: f.maxTime ?? null,
      dataSource: f.dataSource || null,
      visibleWhen: f.visibleWhen || [],
      disabledWhen: f.disabledWhen || []
    }));
    return JSON.stringify(list);
  });

  const syncFromProps = () => {
    syncing.value = true;
    const next = props.modelValue || {};
    // 尽量做“差量同步”，避免每次都全量重建导致级联更新
    Object.keys(localModel).forEach((k) => {
      if (!(k in next)) delete localModel[k];
    });
    Object.keys(next).forEach((k) => {
      localModel[k] = next[k];
    });
    (props.schema || []).forEach((f) => {
      if (localModel[f.field] === undefined && f.defaultValue !== undefined) {
        localModel[f.field] = f.defaultValue;
      }
    });
    // internal validation anchor (must not be emitted to parent v-model)
    if (localModel[CROSS_FIELD_HIDDEN_PROP] === undefined) {
      localModel[CROSS_FIELD_HIDDEN_PROP] = true;
    }
    nextTick(() => {
      syncing.value = false;
    });
  };

  watch(
    () => props.modelValue,
    () => syncFromProps(),
    { immediate: true, deep: true }
  );
  watch(schemaSig, () => syncFromProps(), { immediate: true });

  watch(
    () => localModel,
    () => {
      if (syncing.value) return;
      const payload: Record<string, any> = { ...localModel };
      delete payload[CROSS_FIELD_HIDDEN_PROP];
      emit('update:modelValue', payload);
    },
    { deep: true }
  );

  type RemoteFieldState = {
    options?: Array<{ label: string; value: string | number }>;
    loading?: boolean;
    error?: string;
    fetchedSig?: string;
  };
  const remoteState = reactive<Record<string, RemoteFieldState>>({});
  const remoteAbort = new Map<string, AbortController>();

  const remoteMeta = (field: string) => remoteState[field];

  const normalizeConditionValue = (v: any) => {
    if (typeof v !== 'string') return v;
    const s = v.trim();
    if (s === '') return '';
    if (s === 'true') return true;
    if (s === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    return s;
  };

  const evalCondition = (cond: FormFieldCondition, model: Record<string, any>) => {
    const left = model ? model[cond.field] : undefined;
    const right = normalizeConditionValue((cond as any).value);
    switch (cond.op) {
      case '==':
        return left == right;
      case '!=':
        return left != right;
      case '>':
        return Number(left) > Number(right);
      case '>=':
        return Number(left) >= Number(right);
      case '<':
        return Number(left) < Number(right);
      case '<=':
        return Number(left) <= Number(right);
      case 'includes': {
        if (Array.isArray(left)) return left.includes(right);
        if (typeof left === 'string') return left.includes(String(right));
        return false;
      }
      case 'not_includes': {
        if (Array.isArray(left)) return !left.includes(right);
        if (typeof left === 'string') return !left.includes(String(right));
        return true;
      }
      case 'in': {
        const arr = Array.isArray(right) ? right : [right];
        return arr.includes(left);
      }
      case 'not_in': {
        const arr = Array.isArray(right) ? right : [right];
        return !arr.includes(left);
      }
      default:
        return true;
    }
  };

  const matchAll = (conds: FormFieldCondition[] | undefined, model: Record<string, any>) => {
    const list = Array.isArray(conds) ? conds : [];
    if (list.length === 0) return true;
    return list.every((c) => (c && c.field && c.op ? evalCondition(c, model) : true));
  };

  const stableStringify = (v: any) => {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  };

  const buildRemoteUrl = (f: FormFieldSchema) => {
    const ds = f.dataSource as any;
    if (!ds || ds.type !== 'remote') return '';
    const base = String(ds.url || '').trim();
    if (!base) return '';
    const deps: string[] = Array.isArray(ds.dependsOn) ? ds.dependsOn : [];
    if (deps.length === 0) return base;
    const u = new URL(base, window.location.origin);
    deps.forEach((k) => {
      const kk = String(k || '').trim();
      if (!kk) return;
      u.searchParams.set(kk, stableStringify(localModel[kk]));
    });
    return u.toString();
  };

  const CACHE = new Map<string, { expires: number; value: any }>();
  const cacheKeyFor = (url: string) => url;

  const fetchRemoteOptions = async (f: FormFieldSchema) => {
    const ds = f.dataSource as any;
    if (!ds || ds.type !== 'remote') return;
    const field = f.field;
    const url = buildRemoteUrl(f);
    if (!url) return;

    const prev = remoteAbort.get(field);
    if (prev) prev.abort();
    const ac = new AbortController();
    remoteAbort.set(field, ac);

    const ttl = Number(ds.cacheTtlMs || 0);
    const ck = cacheKeyFor(url);
    if (ttl > 0) {
      const hit = CACHE.get(ck);
      if (hit && hit.expires > Date.now()) {
        remoteState[field] = remoteState[field] || {};
        remoteState[field].options = mapRemoteOptions(hit.value, f);
        remoteState[field].error = '';
        remoteState[field].loading = false;
        return;
      }
    }

    remoteState[field] = remoteState[field] || {};
    remoteState[field].loading = true;
    remoteState[field].error = '';

    const method = String(ds.method || 'GET').toUpperCase() === 'POST' ? 'POST' : 'GET';
    try {
      const data =
        method === 'POST'
          ? await request.post(url, {}, { signal: ac.signal as any })
          : await request.get(url, { signal: ac.signal as any });
      if (ttl > 0) {
        CACHE.set(ck, { expires: Date.now() + ttl, value: data });
      }
      remoteState[field].options = mapRemoteOptions(data, f);
      remoteState[field].error = '';
    } catch (e: any) {
      if (String(e?.name || '') === 'CanceledError' || String(e?.code || '') === 'ERR_CANCELED') return;
      remoteState[field].error = '选项加载失败';
    } finally {
      remoteState[field].loading = false;
    }
  };

  const ensureRemoteOptions = (f: FormFieldSchema) => {
    const ds = f.dataSource as any;
    if (!ds || ds.type !== 'remote') return;
    const sig = buildRemoteUrl(f);
    const st = (remoteState[f.field] = remoteState[f.field] || {});
    if (!sig) return;
    if (st.fetchedSig === sig && !st.error) return;
    st.fetchedSig = sig;
    fetchRemoteOptions(f);
  };

  const resolvedOptions = (f: FormFieldSchema) => {
    const ds = f.dataSource as any;
    if (ds && ds.type === 'remote') {
      return remoteState[f.field]?.options || f.options || [];
    }
    return f.options || [];
  };

  const retryRemote = (f: FormFieldSchema) => {
    const st = (remoteState[f.field] = remoteState[f.field] || {});
    st.fetchedSig = '';
    st.error = '';
    fetchRemoteOptions(f);
  };

  let crossTimer: any = null;
  const scheduleCrossValidate = () => {
    if (!props.crossFieldRules || props.crossFieldRules.length === 0) return;
    if (crossTimer) clearTimeout(crossTimer);
    crossTimer = setTimeout(() => {
      crossTimer = null;
      nextTick(() => {
        try {
          formRef.value?.validateField?.(CROSS_FIELD_HIDDEN_PROP);
        } catch {
          // ignore
        }
      });
    }, 0);
  };

  watch(
    () => schemaSig.value,
    async () => {
      // reset remote state when schema changes materially
      Object.keys(remoteState).forEach((k) => delete remoteState[k]);
      await nextTick();
      (props.schema || []).forEach((f) => ensureRemoteOptions(f));
      scheduleCrossValidate();
    },
    { immediate: true }
  );

  watch(
    () => localModel,
    () => {
      scheduleCrossValidate();
      // dependency-based refetch
      (props.schema || []).forEach((f) => {
        const ds = f.dataSource as any;
        if (!ds || ds.type !== 'remote') return;
        const deps: string[] = Array.isArray(ds.dependsOn) ? ds.dependsOn : [];
        if (deps.length === 0) return;
        ensureRemoteOptions(f);
      });
    },
    { deep: true }
  );

  onMounted(() => {
    (props.schema || []).forEach((f) => ensureRemoteOptions(f));
  });

  onBeforeUnmount(() => {
    remoteAbort.forEach((c) => c.abort());
    remoteAbort.clear();
    if (crossTimer) clearTimeout(crossTimer);
  });

  const rules = computed(() => {
    const map: Record<string, any[]> = {};
    (renderedSchema.value || []).forEach((f) => {
      const effectiveDisabled = Boolean(props.disabled || f.disabled || isDisabledByLinkage(f));
      const fieldRules: any[] = [];

      // Disabled fields should not block form validation.
      if (effectiveDisabled) return;

      if (f.required) {
        fieldRules.push({
          required: true,
          message: f.requiredMessage || `请填写${f.label}`,
          trigger:
            f.type === 'select' ||
            f.type === 'autocomplete' ||
            f.type === 'cascader' ||
            f.type === 'icon' ||
            f.type === 'richtext' ||
            f.type === 'date' ||
            f.type === 'datetime' ||
            f.type === 'time' ||
            f.type === 'slider' ||
            f.type === 'rate' ||
            f.type === 'color'
              ? 'change'
              : 'blur'
        });
      }

      const lengthRule = buildLengthRule(f);
      if (lengthRule) fieldRules.push(lengthRule);

      const rangeRule = buildRangeRule(f);
      if (rangeRule) fieldRules.push(rangeRule);

      const patternRule = buildPatternRule(f);
      if (patternRule) fieldRules.push(patternRule);

      const dateRule = buildDateTimeRangeRule(f);
      if (dateRule) fieldRules.push(dateRule);

      if (fieldRules.length > 0) {
        map[f.field] = fieldRules;
      }
    });

    const crossRules = props.crossFieldRules || [];
    if (crossRules.length > 0) {
      const visibleFields = new Set((renderedSchema.value || []).map((x) => String(x.field || '').trim()));
      map[CROSS_FIELD_HIDDEN_PROP] = [
        {
          validator: (_: any, __: any, callback: (err?: Error) => void) => {
            for (let i = 0; i < crossRules.length; i += 1) {
              const rule = crossRules[i];
              if (!rule) continue;
              const logic = rule.logic === 'OR' ? 'OR' : 'AND';
              const conds = Array.isArray(rule.when) ? rule.when : [];
              if (conds.length === 0) continue;
              // Hidden fields should not block cross-field validation.
              // If a condition targets a currently hidden field, we treat it as satisfied.
              const visibleConds = conds.filter((c: any) => {
                if (!c || !c.field || !c.op) return false;
                const f = String(c.field || '').trim();
                if (f && !visibleFields.has(f)) return false;
                return true;
              });
              if (visibleConds.length === 0) continue;

              const failed = visibleConds.filter((c: any) => !evalCondition(c, localModel));
              const isOk = logic === 'AND' ? failed.length === 0 : failed.length < visibleConds.length;
              if (isOk) continue;

              const idxLabel = `规则 ${i + 1}`;
              const idLabel = rule.id ? `（${String(rule.id)}）` : '';
              const fields = Array.from(
                new Set(
                  (logic === 'AND' ? failed : visibleConds)
                    .map((c: any) => String(c?.field || '').trim())
                    .filter(Boolean)
                )
              );
              const fieldsLabel = fields.length > 0 ? `字段：${fields.join(', ')}` : '';
              const msg = String(rule.message || '跨字段规则未满足').trim();
              return callback(new Error([`${idxLabel}${idLabel}：${msg}`, fieldsLabel].filter(Boolean).join('；')));
            }
            return callback();
          },
          trigger: 'change'
        }
      ];
    }
    return map;
  });

  const renderedSchema = computed(() => {
    const list = props.schema || [];
    // 仅做“过滤”，不在这里改 model，避免触发额外 watch
    return list.filter((f) => matchAll(f.visibleWhen as any, localModel));
  });

  watch(
    () => renderedSchema.value.map((x) => x.field).join('|'),
    async () => {
      // schema 或联动变化后，清理已隐藏字段的校验状态，避免“看不见但报错”
      await nextTick();
      try {
        formRef.value?.clearValidate?.();
      } catch {
        // ignore
      }
    }
  );

  const isDisabledByLinkage = (f: FormFieldSchema) => {
    const conds = f.disabledWhen as any as FormFieldCondition[] | undefined;
    if (!Array.isArray(conds) || conds.length === 0) return false;
    return matchAll(conds, localModel);
  };

  const parseRegex = (raw: string): RegExp | null => {
    const s = String(raw || '').trim();
    if (!s) return null;
    // 支持 /source/flags
    if (s.startsWith('/') && s.lastIndexOf('/') > 0) {
      const lastSlash = s.lastIndexOf('/');
      const source = s.slice(1, lastSlash);
      const flags = s.slice(lastSlash + 1);
      try {
        return new RegExp(source, flags);
      } catch {
        return null;
      }
    }
    try {
      return new RegExp(s);
    } catch {
      return null;
    }
  };

  const buildPatternRule = (f: FormFieldSchema): any | null => {
    const type = f.type;
    const raw = String(f.pattern || '').trim();
    if (!raw) return null;
    // 仅对文本/输入类字段启用（避免对 select/switch 等产生误判）
    const supported = type === 'input' || type === 'textarea' || type === 'number';
    if (!supported) return null;
    const re = parseRegex(raw);
    if (!re) return null;
    return {
      validator: (_: any, value: any, callback: (err?: Error) => void) => {
        const v = value === undefined || value === null ? '' : String(value);
        if (v === '') return callback(); // 空值交给 required 规则处理
        if (re.test(v)) return callback();
        callback(new Error(f.patternMessage || '格式不正确'));
      },
      trigger: 'blur'
    };
  };

  const buildLengthRule = (f: FormFieldSchema): any | null => {
    const type = f.type;
    const minL = f.minLength;
    const maxL = f.maxLength;
    const supported = type === 'input' || type === 'textarea';
    if (!supported) return null;
    if (minL == null && maxL == null) return null;
    return {
      validator: (_: any, value: any, callback: (err?: Error) => void) => {
        const v = value === undefined || value === null ? '' : String(value);
        if (v === '') return callback(); // required 处理空值
        const len = v.length;
        if (minL != null && Number.isFinite(Number(minL)) && len < Number(minL)) {
          return callback(new Error(`长度不能小于 ${minL}`));
        }
        if (maxL != null && Number.isFinite(Number(maxL)) && len > Number(maxL)) {
          return callback(new Error(`长度不能大于 ${maxL}`));
        }
        callback();
      },
      trigger: 'blur'
    };
  };

  const buildRangeRule = (f: FormFieldSchema): any | null => {
    const min = f.min;
    const max = f.max;
    const supported = f.type === 'number' || f.type === 'slider' || f.type === 'rate';
    if (!supported) return null;
    if (min == null && max == null) return null;
    return {
      validator: (_: any, value: any, callback: (err?: Error) => void) => {
        if (value === undefined || value === null || value === '') return callback();
        const n = Number(value);
        if (!Number.isFinite(n)) return callback();
        if (min != null && Number.isFinite(Number(min)) && n < Number(min)) {
          return callback(new Error(`不能小于 ${min}`));
        }
        if (max != null && Number.isFinite(Number(max)) && n > Number(max)) {
          return callback(new Error(`不能大于 ${max}`));
        }
        callback();
      },
      trigger: 'change'
    };
  };

  const toTimeNumber = (v: any): number | null => {
    if (v == null || v === '') return null;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    const d = v instanceof Date ? v : new Date(v);
    const t = d.getTime();
    return Number.isFinite(t) ? t : null;
  };

  const buildDateTimeRangeRule = (f: FormFieldSchema): any | null => {
    if (f.type === 'date') {
      const min = f.minDate ? toTimeNumber(f.minDate) : null;
      const max = f.maxDate ? toTimeNumber(f.maxDate) : null;
      if (min == null && max == null) return null;
      return {
        validator: (_: any, value: any, callback: (err?: Error) => void) => {
          if (value === undefined || value === null || value === '') return callback();
          const t = toTimeNumber(value);
          if (t == null) return callback();
          if (min != null && t < min) return callback(new Error('日期超出允许范围'));
          if (max != null && t > max) return callback(new Error('日期超出允许范围'));
          callback();
        },
        trigger: 'change'
      };
    }
    if (f.type === 'datetime') {
      const min = f.minDateTime ? toTimeNumber(f.minDateTime) : null;
      const max = f.maxDateTime ? toTimeNumber(f.maxDateTime) : null;
      if (min == null && max == null) return null;
      return {
        validator: (_: any, value: any, callback: (err?: Error) => void) => {
          if (value === undefined || value === null || value === '') return callback();
          const t = toTimeNumber(value);
          if (t == null) return callback();
          if (min != null && t < min) return callback(new Error('日期时间超出允许范围'));
          if (max != null && t > max) return callback(new Error('日期时间超出允许范围'));
          callback();
        },
        trigger: 'change'
      };
    }
    if (f.type === 'time') {
      const min = f.minTime ? String(f.minTime) : '';
      const max = f.maxTime ? String(f.maxTime) : '';
      if (!min && !max) return null;
      return {
        validator: (_: any, value: any, callback: (err?: Error) => void) => {
          if (value === undefined || value === null || value === '') return callback();
          const cur = String(value);
          if (min && cur < min) return callback(new Error('时间超出允许范围'));
          if (max && cur > max) return callback(new Error('时间超出允许范围'));
          callback();
        },
        trigger: 'change'
      };
    }
    return null;
  };

  const normalizeSpan = (span?: number) => {
    const n = Number(span);
    if (!Number.isFinite(n)) return 24;
    if (n < 1) return 1;
    if (n > 24) return 24;
    return Math.round(n);
  };

  const resolveComponent = (f: FormFieldSchema) => {
    switch (f.type) {
      case 'textarea':
        return 'el-input';
      case 'number':
        return 'el-input-number';
      case 'slider':
        return 'el-slider';
      case 'rate':
        return 'el-rate';
      case 'color':
        return 'el-color-picker';
      case 'select':
        return 'el-select';
      case 'date':
        return 'el-date-picker';
      case 'datetime':
        return 'el-date-picker';
      case 'time':
        return 'el-time-picker';
      case 'switch':
        return 'el-switch';
      case 'radio':
        return 'el-radio-group';
      case 'checkbox':
        return 'el-checkbox-group';
      case 'input':
      default:
        return 'el-input';
    }
  };

  const getAutocompleteFetcher = (f: FormFieldSchema) => {
    return (queryString: string, cb: (results: any[]) => void) => {
      const q = String(queryString || '')
        .trim()
        .toLowerCase();
      const list = (resolvedOptions(f) || []).map((o) => ({ value: String(o.value), label: o.label }));
      if (!q) return cb(list);
      const filtered = list.filter((x) =>
        String(x.label || '')
          .toLowerCase()
          .includes(q)
      );
      cb(filtered);
    };
  };

  const getComponentProps = (f: FormFieldSchema): Record<string, any> => {
    const disabled = !!props.disabled || !!f.disabled || isDisabledByLinkage(f);
    const extra = f.componentProps && typeof f.componentProps === 'object' ? f.componentProps : {};
    if (f.type === 'textarea') {
      return {
        type: 'textarea',
        rows: 3,
        placeholder: f.placeholder || '',
        disabled,
        clearable: true,
        minlength: f.minLength,
        maxlength: f.maxLength,
        showWordLimit: f.maxLength != null,
        ...extra
      };
    }
    if (f.type === 'input') {
      return {
        placeholder: f.placeholder || '',
        disabled,
        clearable: true,
        minlength: f.minLength,
        maxlength: f.maxLength,
        showWordLimit: f.maxLength != null,
        ...extra
      };
    }
    if (f.type === 'number') {
      return {
        disabled,
        style: { width: '100%' },
        min: f.min,
        max: f.max,
        precision: f.precision,
        ...extra
      };
    }
    if (f.type === 'autocomplete') {
      return {
        placeholder: f.placeholder || '',
        disabled,
        clearable: true,
        ...extra
      };
    }
    if (f.type === 'select') {
      return {
        placeholder: f.placeholder || '',
        disabled,
        clearable: true,
        style: { width: '100%' },
        ...extra
      };
    }
    if (f.type === 'cascader') {
      return {
        placeholder: f.placeholder || '',
        disabled,
        clearable: true,
        style: { width: '100%' },
        ...extra
      };
    }
    if (f.type === 'date') {
      const min = f.minDate ? toTimeNumber(f.minDate) : null;
      const max = f.maxDate ? toTimeNumber(f.maxDate) : null;
      return {
        type: 'date',
        placeholder: f.placeholder || '请选择日期',
        disabled,
        style: { width: '100%' },
        disabledDate: (d: Date) => {
          const t = d.getTime();
          if (min != null && t < min) return true;
          if (max != null && t > max) return true;
          return false;
        },
        ...extra
      };
    }
    if (f.type === 'datetime') {
      const min = f.minDateTime ? toTimeNumber(f.minDateTime) : null;
      const max = f.maxDateTime ? toTimeNumber(f.maxDateTime) : null;
      return {
        type: 'datetime',
        placeholder: f.placeholder || '请选择日期时间',
        disabled,
        style: { width: '100%' },
        disabledDate: (d: Date) => {
          const t = d.getTime();
          if (min != null && t < min) return true;
          if (max != null && t > max) return true;
          return false;
        },
        ...extra
      };
    }
    if (f.type === 'time') {
      return {
        placeholder: f.placeholder || '请选择时间',
        disabled,
        style: { width: '100%' },
        ...extra
      };
    }
    if (f.type === 'slider') {
      return { disabled, min: f.min, max: f.max, ...extra };
    }
    if (f.type === 'rate') {
      return { disabled, max: f.max, ...extra };
    }
    if (f.type === 'color') {
      return { disabled, ...extra };
    }
    if (f.type === 'switch') {
      return { disabled, ...extra };
    }
    if (f.type === 'radio') {
      return { disabled, ...extra };
    }
    if (f.type === 'checkbox') {
      return { disabled, ...extra };
    }
    return { disabled, ...extra };
  };
</script>

<style scoped>
  .fb-form :deep(.el-form-item) {
    margin-bottom: 14px;
  }

  .fb-field-wrap {
    width: 100%;
  }

  .fb-remote-row {
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
