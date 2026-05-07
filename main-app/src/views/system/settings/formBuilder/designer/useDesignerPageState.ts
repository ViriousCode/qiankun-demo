import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import type {
  FormCanvasGroup,
  FormCrossFieldRule,
  FormFieldConditionOp,
  FormFieldDataSource,
  FormFieldSchema,
  FormFieldType
} from '@/types/formBuilder';
import { buildDependencyEdges, findCycles } from '../utils';
import { useDesignerPersistence } from './useDesignerPersistence';
import { useDesignerSnapshots } from './useDesignerSnapshots';
import { confirmInAppMain, promptInAppMain } from '@/utils/messageBox';

type QualityIssue = {
  level: 'error' | 'warn';
  message: string;
  uid?: string;
};

type DiffItem = { kind: 'added' | 'removed'; key: string; label: string };
type DiffGroup = { id: string; title: string };
type DiffFieldMoved = {
  field: string;
  label: string;
  fromId: string;
  toId: string;
  fromTitle: string;
  toTitle: string;
};

export const useDesignerPageState = () => {
  const route = useRoute();
  const router = useRouter();

  const idParam = computed(() => {
    const raw = route.query.id;
    const n = parseInt(Array.isArray(raw) ? raw[0] : (raw as any), 10);
    return Number.isFinite(n) ? n : null;
  });
  const isEdit = computed(() => idParam.value != null);

  const base = ref<{ name: string; code: string; status: number }>({
    name: '',
    code: '',
    status: 1
  });
  const baseFormRef = ref<FormInstance>();
  const baseRules: FormRules = {
    name: [{ required: true, message: '请填写表单名称', trigger: 'blur' }],
    code: [
      { required: true, message: '请填写表单编码', trigger: 'blur' },
      {
        validator: (_rule: any, value: any, callback: (err?: Error) => void) => {
          const v = String(value ?? '').trim();
          if (!v) return callback();
          if (!/^[a-z][a-z0-9_]*$/.test(v)) {
            callback(new Error('编码格式：小写字母开头，仅包含小写字母/数字/下划线'));
            return;
          }
          callback();
        },
        trigger: 'blur'
      }
    ]
  };
  const schema = ref<FormFieldSchema[]>([]);
  const selectedUid = ref<string>('');
  const selectedUids = ref<Set<string>>(new Set());
  const saving = ref(false);
  const centerTab = ref<'fields' | 'preview'>('fields');

  const previewModel = ref<Record<string, any>>({});
  const previewRendererRef = ref<any>();

  const paletteKeyword = ref('');
  const canvasKeyword = ref('');
  const importInputRef = ref<HTMLInputElement | null>(null);

  const crossFieldRules = ref<FormCrossFieldRule[]>([]);
  const canvasGroups = ref<FormCanvasGroup[]>([]);
  const publishedSchema = ref<FormFieldSchema[] | null>(null);
  const publishedAt = ref<string>('');
  const crossFieldJsonError = ref('');
  const crossFieldAdvanced = ref(false);
  const crossFieldAdvancedCollapse = ref<string[]>([]);
  const crossFieldInfoIconUrl = new URL('@/assets/image/common/icon_info.svg', import.meta.url)
    .href;

  const UNGROUPED_ID = '__ungrouped__';
  const canvasBuckets = ref<Record<string, FormFieldSchema[]>>({ [UNGROUPED_ID]: [] });
  const syncingFromBuckets = ref(false);

  const normalizeCanvasGroups = () => {
    const list = Array.isArray(canvasGroups.value) ? canvasGroups.value : [];
    const seen = new Set<string>();
    canvasGroups.value = list
      .filter((g) => g && typeof g === 'object')
      .map((g) => ({
        id: String((g as any).id || '').trim(),
        title: String((g as any).title || '').trim(),
        collapsed: Boolean((g as any).collapsed)
      }))
      .filter((g) => {
        if (!g.id || seen.has(g.id)) return false;
        seen.add(g.id);
        return true;
      })
      .map((g) => ({ ...g, title: g.title || g.id }));
  };

  const ensureGroup = (id: string, title?: string) => {
    const gid = String(id || '').trim();
    if (!gid || gid === UNGROUPED_ID) return;
    if ((canvasGroups.value || []).some((g) => g.id === gid)) return;
    canvasGroups.value = [
      ...(canvasGroups.value || []),
      { id: gid, title: String(title || gid).trim() || gid, collapsed: false }
    ];
  };

  const rebuildBucketsFromSchema = () => {
    if (syncingFromBuckets.value) return;
    normalizeCanvasGroups();
    const buckets: Record<string, FormFieldSchema[]> = { [UNGROUPED_ID]: [] };
    (canvasGroups.value || []).forEach((g) => (buckets[g.id] = []));
    for (const f of schema.value || []) {
      const gid = String((f as any).groupId || '').trim();
      if (gid) ensureGroup(gid);
    }
    (canvasGroups.value || []).forEach((g) => (buckets[g.id] = buckets[g.id] || []));

    for (const f of schema.value || []) {
      const gid = String((f as any).groupId || '').trim();
      const target = gid && buckets[gid] ? gid : UNGROUPED_ID;
      if (!buckets[target]) buckets[target] = [];
      buckets[target]!.push(f);
    }
    canvasBuckets.value = buckets;
  };

  const rebuildSchemaFromBuckets = () => {
    if (syncingFromBuckets.value) return;
    syncingFromBuckets.value = true;
    const next: FormFieldSchema[] = [];
    const buckets = canvasBuckets.value || {};
    const pushList = (gid: string) => {
      const list = Array.isArray(buckets[gid]) ? buckets[gid] : [];
      list.forEach((f) => {
        if (gid === UNGROUPED_ID) delete (f as any).groupId;
        else (f as any).groupId = gid;
        next.push(f);
      });
    };
    pushList(UNGROUPED_ID);
    (canvasGroups.value || []).forEach((g) => pushList(g.id));
    schema.value = next;
    setTimeout(() => {
      syncingFromBuckets.value = false;
    }, 0);
  };

  const canvasKeywordNormalized = computed(() =>
    String(canvasKeyword.value || '')
      .trim()
      .toLowerCase()
  );
  const visibleUidSet = computed<Set<string> | null>(() => {
    const q = canvasKeywordNormalized.value;
    if (!q) return null;
    const set = new Set<string>();
    (schema.value || []).forEach((f) => {
      const hay = `${f.label || ''} ${f.field || ''} ${f.type || ''}`.toLowerCase();
      if (hay.includes(q)) set.add(String(f.uid || ''));
    });
    return set;
  });

  const groupVisibleCountMap = computed<Record<string, number>>(() => {
    const buckets = canvasBuckets.value || { [UNGROUPED_ID]: [] };
    const visibleSet = visibleUidSet.value;
    const result: Record<string, number> = {};
    Object.keys(buckets).forEach((gid) => {
      const list = Array.isArray(buckets[gid]) ? buckets[gid] : [];
      if (!visibleSet) {
        result[gid] = list.length;
        return;
      }
      result[gid] = list.reduce((acc, item) => (visibleSet.has(item.uid) ? acc + 1 : acc), 0);
    });
    return result;
  });

  const groupedCanvas = computed(() => {
    const groups = (canvasGroups.value || []).map((g) => ({
      id: g.id,
      title: g.title,
      collapsed: Boolean(g.collapsed)
    }));
    const buckets = canvasBuckets.value || { [UNGROUPED_ID]: [] };
    const all = [{ id: UNGROUPED_ID, title: '未分组', collapsed: false }, ...groups].map((g) => {
      const list: FormFieldSchema[] = Array.isArray(buckets[g.id])
        ? (buckets[g.id] as FormFieldSchema[])
        : [];
      const visibleCount = groupVisibleCountMap.value[g.id] || 0;
      const hasSearch = Boolean(canvasKeywordNormalized.value);
      const effectiveCollapsed =
        g.id !== UNGROUPED_ID && g.collapsed && !(hasSearch && visibleCount > 0);
      return {
        ...g,
        totalCount: list.length,
        visibleCount,
        effectiveCollapsed
      };
    });
    return all;
  });

  const parsedCrossFieldRules = computed(() => crossFieldRules.value || []);
  const qualityIssues = computed<QualityIssue[]>(() => {
    const issues: QualityIssue[] = [];
    if (crossFieldJsonError.value) {
      issues.push({ level: 'error', message: `跨字段规则：${crossFieldJsonError.value}` });
    }
    if (dataSourceJsonError.value) {
      issues.push({ level: 'error', message: `远程选项配置：${dataSourceJsonError.value}` });
    }
    const fieldMap = new Map<string, FormFieldSchema[]>();
    for (const f of schema.value || []) {
      const uid = String(f?.uid || '').trim();
      const field = String(f?.field || '').trim();
      const label = String(f?.label || '').trim();
      if (!uid) continue;
      if (!field) issues.push({ level: 'error', uid, message: '字段名为空' });
      if (!label)
        issues.push({ level: 'error', uid, message: `标题为空（field: ${field || '(empty)'}）` });
      if (field) {
        const arr = fieldMap.get(field) || [];
        arr.push(f);
        fieldMap.set(field, arr);
      }
    }
    for (const [field, list] of fieldMap.entries()) {
      if (list.length <= 1) continue;
      list.forEach((f) =>
        issues.push({
          level: 'error',
          uid: f.uid,
          message: `字段名重复：${field}`
        })
      );
    }
    const uidByField = new Map<string, string>();
    (schema.value || []).forEach((f) => {
      const field = String(f?.field || '').trim();
      const uid = String(f?.uid || '').trim();
      if (field && uid) uidByField.set(field, uid);
    });
    const depsEdges = buildDependencyEdges(schema.value || []);
    const cycles = findCycles(depsEdges);
    cycles.forEach((c) => {
      const nodes = c.slice(0, -1);
      const uid = uidByField.get(nodes[0] || '');
      issues.push({
        level: 'error',
        uid,
        message: `存在循环依赖：${nodes.join(' -> ')} -> ${nodes[0]}`
      });
    });
    (crossFieldRules.value || []).forEach((r, idx) => {
      const msg = String(r?.message || '').trim();
      if (!msg) issues.push({ level: 'error', message: `跨字段规则 ${idx + 1}：提示文案为空` });
      const when = (r as any)?.when;
      if (!Array.isArray(when) || when.length === 0) {
        issues.push({ level: 'error', message: `跨字段规则 ${idx + 1}：条件为空` });
      } else {
        when.forEach((c: any, j: number) => {
          if (!String(c?.field || '').trim()) {
            issues.push({
              level: 'error',
              message: `跨字段规则 ${idx + 1}：条件 ${j + 1} 未选择字段`
            });
          }
          if (!String(c?.op || '').trim()) {
            issues.push({
              level: 'error',
              message: `跨字段规则 ${idx + 1}：条件 ${j + 1} 未选择操作符`
            });
          }
        });
      }
    });
    return issues;
  });
  const qualityHasError = computed(() => qualityIssues.value.some((x) => x.level === 'error'));
  const canvasVisibleCount = computed(() => visibleUidSet.value?.size ?? schema.value.length);
  const selectedCount = computed(() => selectedUids.value.size);
  const uidToIndexMap = computed(() => {
    const map = new Map<string, number>();
    (schema.value || []).forEach((item, index) => map.set(item.uid, index));
    return map;
  });
  const currentField = computed<FormFieldSchema | null>(() => {
    const uid = selectedUid.value;
    if (!uid) return null;
    return schema.value.find((x) => x.uid === uid) || null;
  });

  const palette = [
    { type: 'input', title: '输入框', desc: '单行文本' },
    { type: 'textarea', title: '多行文本', desc: 'textarea' },
    { type: 'number', title: '数字', desc: 'input number' },
    { type: 'autocomplete', title: '自动补全', desc: 'options' },
    { type: 'select', title: '下拉选择', desc: 'options' },
    { type: 'cascader', title: '级联选择', desc: 'tree options' },
    { type: 'radio', title: '单选', desc: 'options' },
    { type: 'checkbox', title: '多选', desc: 'options' },
    { type: 'date', title: '日期', desc: 'date picker' },
    { type: 'datetime', title: '日期时间', desc: 'datetime picker' },
    { type: 'time', title: '时间', desc: 'time picker' },
    { type: 'slider', title: '滑块', desc: 'number range' },
    { type: 'rate', title: '评分', desc: 'rate' },
    { type: 'color', title: '颜色选择', desc: 'color picker' },
    { type: 'icon', title: '图标选择', desc: 'azura-icon' },
    { type: 'richtext', title: '富文本', desc: 'wangeditor' },
    { type: 'switch', title: '开关', desc: 'boolean' }
  ] as Array<{ type: FormFieldType; title: string; desc: string }>;

  const elementPaletteTypes: FormFieldType[] = [
    'input',
    'textarea',
    'number',
    'autocomplete',
    'select',
    'cascader',
    'radio',
    'checkbox',
    'date',
    'datetime',
    'time',
    'slider',
    'rate',
    'color',
    'switch'
  ];

  const filteredPalette = computed(() => {
    const q = String(paletteKeyword.value || '')
      .trim()
      .toLowerCase();
    if (!q) return palette;
    return palette.filter((x) => {
      const hay = `${x.title} ${x.desc} ${x.type}`.toLowerCase();
      return hay.includes(q);
    });
  });

  const elementPalette = computed(() =>
    filteredPalette.value.filter((x) => elementPaletteTypes.includes(x.type))
  );
  const otherPalette = computed(() =>
    filteredPalette.value.filter((x) => !elementPaletteTypes.includes(x.type))
  );

  const dataSourceJsonError = ref('');
  const cascaderJsonError = ref('');
  const componentPropsJsonError = ref('');
  const componentPropsDraftText = ref('');

  const supportsOptions = (type: FormFieldType) =>
    type === 'select' || type === 'radio' || type === 'checkbox' || type === 'autocomplete';
  const supportsPlaceholder = (type: FormFieldType) =>
    type === 'input' ||
    type === 'textarea' ||
    type === 'autocomplete' ||
    type === 'select' ||
    type === 'cascader' ||
    type === 'date' ||
    type === 'datetime' ||
    type === 'time';
  const supportsPattern = (type: FormFieldType) =>
    type === 'input' || type === 'textarea' || type === 'number';
  const supportsTextLength = (type: FormFieldType) => type === 'input' || type === 'textarea';
  const supportsNumberRange = (type: FormFieldType) =>
    type === 'number' || type === 'slider' || type === 'rate';

  const normalizeDesignerSchema = (list: FormFieldSchema[]) => {
    for (const f of list || []) {
      if (!supportsOptions(f.type)) continue;
      const ds = f.dataSource as any;
      if (ds && ds.type === 'remote') {
        f.dataSourceType = 'remote';
      } else if (!f.dataSourceType) {
        f.dataSourceType = 'static';
      }
    }
  };

  const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));
  const {
    restoring,
    canUndo,
    canRedo,
    initSnapshots,
    pushSnapshot,
    pushSnapshotDebounced,
    undo,
    redo,
    disposeSnapshots
  } = useDesignerSnapshots({
    base,
    schema,
    crossFieldRules,
    canvasGroups,
    selectedUid,
    selectedUids,
    rebuildBucketsFromSchema
  });

  const { load, save, goBack, exportSchemaJson, triggerImportSchemaJson, onImportSchemaJson } =
    useDesignerPersistence({
      router,
      isEdit,
      idParam,
      base,
      baseFormRef,
      schema,
      crossFieldRules,
      canvasGroups,
      selectedUid,
      selectedUids,
      publishedSchema,
      publishedAt,
      crossFieldJsonError,
      crossFieldAdvanced,
      dataSourceJsonError,
      saving,
      importInputRef,
      normalizeDesignerSchema,
      rebuildBucketsFromSchema,
      initSnapshots,
      supportsOptions,
      qualityHasError
    });

  const crossFieldFieldOptions = computed(() =>
    schema.value
      .filter((x) => x.field)
      .map((x) => ({
        value: String(x.field),
        label: `${x.label || x.field}（${x.field}）`
      }))
  );

  const conditionOps = [
    { value: '==' as FormFieldConditionOp, label: '=' },
    { value: '!=' as FormFieldConditionOp, label: '!=' },
    { value: '>' as FormFieldConditionOp, label: '>' },
    { value: '>=' as FormFieldConditionOp, label: '>=' },
    { value: '<' as FormFieldConditionOp, label: '<' },
    { value: '<=' as FormFieldConditionOp, label: '<=' },
    { value: 'includes' as FormFieldConditionOp, label: '包含(includes)' },
    { value: 'not_includes' as FormFieldConditionOp, label: '不包含' }
  ];

  const linkageFieldOptions = (self: FormFieldSchema) => {
    return schema.value
      .filter((x) => x.field && x.uid !== self.uid)
      .map((x) => ({
        value: x.field,
        label: `${x.label || x.field}（${x.field}）`
      }));
  };
  const currentLinkageFieldOptions = computed(() => {
    if (!currentField.value) return [];
    return linkageFieldOptions(currentField.value);
  });

  const patternPresets = [
    { key: 'digits', label: '纯数字', pattern: '^\\d+$', message: '请输入数字' },
    { key: 'phone_cn', label: '手机号(中国)', pattern: '^1\\d{10}$', message: '请输入11位手机号' },
    {
      key: 'email',
      label: '邮箱',
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      message: '请输入正确的邮箱'
    },
    {
      key: 'idcard_cn',
      label: '身份证(中国)',
      pattern: '^(\\d{15}|\\d{17}[0-9Xx])$',
      message: '请输入正确的身份证号'
    },
    { key: 'url', label: 'URL', pattern: '^(https?:\\/\\/).+', message: '请输入正确的URL' }
  ] as Array<{ key: string; label: string; pattern: string; message: string }>;

  const normalizeConditionValue = (v: any) => {
    if (typeof v !== 'string') return v;
    const s = v.trim();
    if (s === '') return '';
    if (s === 'true') return true;
    if (s === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    return s;
  };

  const createUid = () => `fb_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  const buildFieldSet = () =>
    new Set(schema.value.map((x) => String(x.field || '').trim()).filter(Boolean));
  const createUniqueField = (prefix: string, fieldSet: Set<string>) => {
    const safePrefix = String(prefix || 'field').replace(/[^\w]/g, '_');
    let i = 1;
    while (fieldSet.has(`${safePrefix}_${i}`)) i += 1;
    const next = `${safePrefix}_${i}`;
    fieldSet.add(next);
    return next;
  };

  const clonePalette = (item: { type: FormFieldType }) => {
    const uid = createUid();
    const type = item.type;
    const field = createUniqueField(type, buildFieldSet());
    const label = '字段';
    const baseField: FormFieldSchema = {
      uid,
      type,
      field,
      label,
      required: false,
      disabled: false,
      span: 24,
      placeholder: ''
    };
    if (type === 'select' || type === 'radio' || type === 'checkbox' || type === 'autocomplete') {
      baseField.dataSourceType = 'static';
      baseField.options = [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' }
      ];
      if (type === 'checkbox') baseField.defaultValue = [];
    }
    if (type === 'cascader') {
      baseField.treeOptions = [
        {
          label: '浙江',
          value: 'zj',
          children: [
            { label: '杭州', value: 'hz' },
            { label: '宁波', value: 'nb' }
          ]
        }
      ];
    }
    if (type === 'switch') baseField.defaultValue = false;
    if (type === 'slider') baseField.defaultValue = 0;
    if (type === 'rate') baseField.defaultValue = 0;
    if (type === 'color') baseField.defaultValue = '#409eff';
    if (type === 'icon') baseField.defaultValue = '';
    if (type === 'richtext') baseField.defaultValue = '';
    return baseField;
  };

  const updateCrossFieldRules = (next: FormCrossFieldRule[]) => {
    crossFieldRules.value = Array.isArray(next) ? next : [];
  };
  const updateCrossFieldAdvanced = (next: boolean) => {
    crossFieldAdvanced.value = Boolean(next);
  };
  const updateCrossFieldAdvancedCollapse = (next: string[]) => {
    crossFieldAdvancedCollapse.value = Array.isArray(next) ? next : [];
  };

  const crossFieldRulesText = computed({
    get: () => {
      try {
        return JSON.stringify(crossFieldRules.value || [], null, 2);
      } catch {
        return '';
      }
    },
    set: (text: string) => {
      const raw = String(text || '').trim();
      if (!raw) {
        crossFieldRules.value = [];
        crossFieldJsonError.value = '';
        pushSnapshotDebounced();
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          crossFieldJsonError.value = 'crossFieldRules 必须是 JSON 数组';
          return;
        }
        for (let i = 0; i < parsed.length; i += 1) {
          const r = parsed[i];
          if (!r || typeof r !== 'object') {
            crossFieldJsonError.value = `crossFieldRules[${i}] 必须为对象`;
            return;
          }
          const msg = String((r as any).message || '').trim();
          if (!msg) {
            crossFieldJsonError.value = `crossFieldRules[${i}].message 不能为空`;
            return;
          }
          const logic = (r as any).logic;
          if (logic != null && logic !== 'AND' && logic !== 'OR') {
            crossFieldJsonError.value = `crossFieldRules[${i}].logic 仅支持 AND/OR`;
            return;
          }
          const when = (r as any).when;
          if (!Array.isArray(when) || when.length === 0) {
            crossFieldJsonError.value = `crossFieldRules[${i}].when 必须为非空数组（注意用 []）`;
            return;
          }
          for (let j = 0; j < when.length; j += 1) {
            const c = when[j];
            const f = String(c?.field || '').trim();
            const op = String(c?.op || '').trim();
            if (!f) {
              crossFieldJsonError.value = `crossFieldRules[${i}].when[${j}].field 不能为空`;
              return;
            }
            if (!op) {
              crossFieldJsonError.value = `crossFieldRules[${i}].when[${j}].op 不能为空`;
              return;
            }
          }
        }
        crossFieldRules.value = (parsed as FormCrossFieldRule[]).map((r: any) => ({
          ...r,
          logic: r?.logic === 'OR' ? 'OR' : 'AND'
        }));
        crossFieldJsonError.value = '';
        pushSnapshotDebounced();
      } catch {
        crossFieldJsonError.value = 'JSON 格式不正确（暂未写入）';
      }
    }
  });
  const updateCrossFieldRulesText = (text: string) => {
    crossFieldRulesText.value = text;
  };

  const dataSourceText = computed({
    get: () => {
      if (!currentField.value) return '';
      if (!supportsOptions(currentField.value.type)) return '';
      if (currentField.value.dataSourceType !== 'remote') return '';
      try {
        return JSON.stringify(currentField.value.dataSource || {}, null, 2);
      } catch {
        return '';
      }
    },
    set: (text: string) => {
      if (!currentField.value) return;
      if (!supportsOptions(currentField.value.type)) return;
      if (currentField.value.dataSourceType !== 'remote') return;
      const raw = String(text || '').trim();
      if (!raw) {
        currentField.value.dataSource = undefined;
        dataSourceJsonError.value = '';
        pushSnapshotDebounced();
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || (parsed as any).type !== 'remote') {
          dataSourceJsonError.value = 'dataSource 必须是对象且 type 为 remote';
          return;
        }
        currentField.value.dataSource = parsed as FormFieldDataSource;
        dataSourceJsonError.value = '';
        pushSnapshotDebounced();
      } catch {
        dataSourceJsonError.value = 'JSON 格式不正确（暂未生效）';
      }
    }
  });
  const updateDataSourceText = (text: string) => {
    dataSourceText.value = text;
  };
  const formatDataSource = () => {
    if (!currentField.value) return;
    if (currentField.value.dataSourceType !== 'remote') return;
    try {
      const next = JSON.stringify(currentField.value.dataSource || {}, null, 2);
      dataSourceText.value = next;
      dataSourceJsonError.value = '';
    } catch {
      dataSourceJsonError.value = '无法格式化：当前 dataSource 不是可序列化的 JSON';
    }
  };

  const cascaderOptionsText = computed({
    get: () => {
      if (currentField.value?.type !== 'cascader') return '';
      try {
        return JSON.stringify(currentField.value.treeOptions || [], null, 2);
      } catch {
        return '';
      }
    },
    set: (text: string) => {
      if (currentField.value?.type !== 'cascader') return;
      const raw = String(text || '').trim();
      if (!raw) {
        currentField.value.treeOptions = [];
        cascaderJsonError.value = '';
        pushSnapshotDebounced();
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        currentField.value.treeOptions = Array.isArray(parsed) ? parsed : [];
        cascaderJsonError.value = '';
        pushSnapshotDebounced();
      } catch {
        cascaderJsonError.value = 'JSON 格式不正确（暂未生效）';
      }
    }
  });
  const updateCascaderOptionsText = (text: string) => {
    cascaderOptionsText.value = text;
  };
  const formatCascaderOptions = () => {
    if (currentField.value?.type !== 'cascader') return;
    try {
      const next = JSON.stringify(currentField.value.treeOptions || [], null, 2);
      cascaderOptionsText.value = next;
      cascaderJsonError.value = '';
    } catch {
      cascaderJsonError.value = '无法格式化：当前选项不是可序列化的 JSON';
    }
  };

  const componentPropsText = computed({
    get: () => componentPropsDraftText.value,
    set: (text: string) => {
      if (!currentField.value) return;
      componentPropsDraftText.value = String(text ?? '');
      const raw = String(text ?? '').trim();
      if (!raw) {
        currentField.value.componentProps = undefined;
        componentPropsJsonError.value = '';
        pushSnapshotDebounced();
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        currentField.value.componentProps = parsed && typeof parsed === 'object' ? parsed : {};
        componentPropsJsonError.value = '';
        pushSnapshotDebounced();
      } catch {
        componentPropsJsonError.value = 'JSON 格式不正确（暂未生效）';
      }
    }
  });
  const updateComponentPropsText = (text: string) => {
    componentPropsText.value = text;
  };
  const formatComponentProps = () => {
    if (!currentField.value) return;
    try {
      const next = JSON.stringify(currentField.value.componentProps || {}, null, 2);
      componentPropsText.value = next;
      componentPropsJsonError.value = '';
    } catch {
      componentPropsJsonError.value = '无法格式化：当前 Props 不是可序列化的 JSON';
    }
  };

  const handleDataSourceTypeChange = () => {
    if (!currentField.value) return;
    const f = currentField.value;
    if (!supportsOptions(f.type)) return;
    if (f.dataSourceType === 'remote') {
      f.dataSource = {
        type: 'remote',
        method: 'GET',
        url: '/api/system/form-builder/options/demo',
        listPath: 'list',
        labelKey: 'label',
        valueKey: 'value',
        cacheTtlMs: 60000
      } as any;
    } else {
      delete (f as any).dataSource;
      f.dataSourceType = 'static';
    }
    dataSourceJsonError.value = '';
    pushSnapshot();
  };

  const handlePatternPresetChange = (key: string | undefined) => {
    if (!currentField.value) return;
    if (!key) return;
    const preset = patternPresets.find((p) => p.key === key);
    if (!preset) return;
    currentField.value.pattern = preset.pattern;
    if (!currentField.value.patternMessage) {
      currentField.value.patternMessage = preset.message;
    }
    pushSnapshot();
  };

  const addOption = () => {
    if (!currentField.value) return;
    currentField.value.options = currentField.value.options || [];
    currentField.value.options.push({
      label: '新选项',
      value: `v${currentField.value.options.length + 1}`
    });
    pushSnapshot();
  };
  const removeOption = (idx: number) => {
    if (!currentField.value?.options) return;
    currentField.value.options.splice(idx, 1);
    pushSnapshot();
  };

  const selectOnly = (uid: string) => {
    selectedUids.value = new Set(uid ? [uid] : []);
    selectedUid.value = uid || '';
  };
  const toggleSelect = (uid: string) => {
    const next = new Set(selectedUids.value);
    if (next.has(uid)) next.delete(uid);
    else next.add(uid);
    selectedUids.value = next;
    if (!next.has(selectedUid.value)) {
      selectedUid.value = next.values().next().value || '';
    }
  };
  const rangeSelect = (uid: string) => {
    const list = schema.value || [];
    const from = selectedUid.value || uid;
    const a = list.findIndex((x) => x.uid === from);
    const b = list.findIndex((x) => x.uid === uid);
    if (a < 0 || b < 0) return selectOnly(uid);
    const [start, end] = a < b ? [a, b] : [b, a];
    selectedUids.value = new Set(list.slice(start, end + 1).map((x) => x.uid));
    selectedUid.value = uid;
  };

  const onCanvasItemClick = (e: MouseEvent, uid: string) => {
    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
    const multi = isMac ? e.metaKey : e.ctrlKey;
    if (e.shiftKey) return rangeSelect(uid);
    if (multi) return toggleSelect(uid);
    return selectOnly(uid);
  };

  const removeField = (index: number) => {
    const removed = schema.value.splice(index, 1)[0];
    if (removed) {
      const next = new Set(selectedUids.value);
      next.delete(removed.uid);
      selectedUids.value = next;
      if (removed.uid === selectedUid.value) {
        selectedUid.value = next.values().next().value || '';
      }
    }
    pushSnapshot();
  };
  const removeFieldByUid = (uid: string) => {
    const index = uidToIndexMap.value.get(uid);
    if (index == null) return;
    removeField(index);
  };

  const indexOfSelected = () => schema.value.findIndex((x) => x.uid === selectedUid.value);
  const removeSelected = () => {
    if (selectedUids.value.size > 1) {
      void batchRemoveSelected();
      return;
    }
    const idx = indexOfSelected();
    if (idx < 0) return;
    removeField(idx);
  };
  const moveSelected = (delta: number) => {
    const idx = indexOfSelected();
    if (idx < 0) return;
    const to = idx + delta;
    if (to < 0 || to >= schema.value.length) return;
    const [it] = schema.value.splice(idx, 1);
    if (!it) return;
    schema.value.splice(to, 0, it);
    pushSnapshot();
  };
  const moveSelectedTo = (pos: 'top' | 'bottom') => {
    const idx = indexOfSelected();
    if (idx < 0) return;
    const [it] = schema.value.splice(idx, 1);
    if (!it) return;
    if (pos === 'top') schema.value.unshift(it);
    else schema.value.push(it);
    pushSnapshot();
  };
  const duplicateSelected = () => {
    const idx = indexOfSelected();
    if (idx < 0) return;
    const src = schema.value[idx];
    if (!src) return;
    const fieldSet = buildFieldSet();
    const copy: FormFieldSchema = deepClone(src);
    copy.uid = createUid();
    copy.field = createUniqueField(src.type, fieldSet);
    schema.value.splice(idx + 1, 0, copy);
    selectedUid.value = copy.uid;
    pushSnapshot();
  };

  const isSelected = (uid: string) => selectedUids.value.has(uid);
  const canvasItemVisible = (f: FormFieldSchema) => {
    const visibleSet = visibleUidSet.value;
    if (!visibleSet) return true;
    return visibleSet.has(String(f.uid || ''));
  };
  const focusIssue = (it: QualityIssue) => {
    if (!it.uid) return;
    selectedUid.value = it.uid;
    setTimeout(() => {
      const el = document.querySelector(`.canvas-item[data-uid="${it.uid}"]`) as HTMLElement | null;
      el?.scrollIntoView?.({ block: 'center' });
    }, 0);
  };

  const toggleGroupCollapsed = (gid: string) => {
    if (gid === UNGROUPED_ID) return;
    const g = (canvasGroups.value || []).find((x) => x.id === gid);
    if (!g) return;
    g.collapsed = !g.collapsed;
    pushSnapshot();
  };
  const createGroupByTitle = (rawTitle: string) => {
    const title = String(rawTitle || '').trim();
    if (!title) return false;
    const id = `g_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
    ensureGroup(id, title);
    canvasBuckets.value = { ...(canvasBuckets.value || { [UNGROUPED_ID]: [] }), [id]: [] };
    pushSnapshot();
    return true;
  };
  const renameGroupByIdTitle = (gid: string, rawTitle: string) => {
    if (gid === UNGROUPED_ID) return false;
    const g = (canvasGroups.value || []).find((x) => x.id === gid);
    if (!g) return false;
    const title = String(rawTitle || '').trim();
    if (!title) return false;
    g.title = title;
    pushSnapshot();
    return true;
  };
  const removeGroup = async (gid: string) => {
    if (gid === UNGROUPED_ID) return;
    const g = (canvasGroups.value || []).find((x) => x.id === gid);
    if (!g) return;
    const count = (canvasBuckets.value?.[gid] || []).length;
    try {
      await confirmInAppMain(
        `确认删除分组「${g.title}」？该分组下的 ${count} 个字段会移动到「未分组」。`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
    } catch {
      return;
    }
    const moved = canvasBuckets.value?.[gid] || [];
    canvasBuckets.value[UNGROUPED_ID] = [
      ...(canvasBuckets.value[UNGROUPED_ID] || []),
      ...(moved || [])
    ];
    delete canvasBuckets.value[gid];
    canvasGroups.value = (canvasGroups.value || []).filter((x) => x.id !== gid);
    rebuildSchemaFromBuckets();
    pushSnapshot();
  };

  const updateCurrentFieldGroupId = (value: unknown) => {
    if (!currentField.value) return;
    (currentField.value as any).groupId = String(value || '').trim() || undefined;
    rebuildBucketsFromSchema();
    pushSnapshot();
  };
  const applyCurrentFieldPatch = (next: FormFieldSchema) => {
    if (!currentField.value) return;
    Object.assign(currentField.value, next || {});
  };

  const onDragEnd = () => {
    rebuildSchemaFromBuckets();
    if (!selectedUid.value && schema.value.length > 0) {
      selectedUid.value = schema.value[schema.value.length - 1]?.uid || '';
    }
    if (selectedUid.value) {
      selectedUids.value = new Set([selectedUid.value]);
    }
    pushSnapshot();
  };
  const onGroupDragEnd = () => {
    rebuildSchemaFromBuckets();
    pushSnapshot();
  };

  const batchRemoveSelected = async () => {
    if (selectedUids.value.size === 0) return;
    try {
      await confirmInAppMain(`确认移除选中的 ${selectedUids.value.size} 个字段？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
    } catch {
      return;
    }
    const set = new Set(selectedUids.value);
    schema.value = (schema.value || []).filter((x) => !set.has(x.uid));
    selectedUids.value = new Set();
    selectedUid.value = schema.value[0]?.uid || '';
    pushSnapshot();
  };
  const batchSetDisabled = (disabled: boolean) => {
    const set = new Set(selectedUids.value);
    if (set.size === 0) return;
    (schema.value || []).forEach((x) => {
      if (set.has(x.uid)) x.disabled = disabled;
    });
    pushSnapshot();
  };
  const batchSetSpan = async () => {
    const set = new Set(selectedUids.value);
    if (set.size === 0) return;
    try {
      const res: any = await promptInAppMain('请输入占用列（1-24）', '批量设置占用列', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^(?:[1-9]|1\d|2[0-4])$/,
        inputErrorMessage: '请输入 1-24 的整数'
      });
      const span = Number(res?.value);
      (schema.value || []).forEach((x) => {
        if (set.has(x.uid)) x.span = span;
      });
      pushSnapshot();
    } catch {
      // cancelled
    }
  };

  const diffOpen = ref(false);
  const diffItems = computed<DiffItem[]>(() => {
    const pub = Array.isArray(publishedSchema.value) ? publishedSchema.value : [];
    const draft = Array.isArray(schema.value) ? schema.value : [];
    const pubMap = new Map<string, any>();
    pub.forEach((f: any) => {
      const k = String(f?.field || '').trim();
      if (k) pubMap.set(k, f);
    });
    const draftMap = new Map<string, any>();
    draft.forEach((f: any) => {
      const k = String(f?.field || '').trim();
      if (k) draftMap.set(k, f);
    });
    const allKeys = Array.from(new Set([...pubMap.keys(), ...draftMap.keys()])).sort();
    const out: DiffItem[] = [];
    allKeys.forEach((k) => {
      const p = pubMap.get(k);
      const d = draftMap.get(k);
      if (!p && d) {
        out.push({ kind: 'added', key: k, label: String(d?.label || '') });
        return;
      }
      if (p && !d) {
        out.push({ kind: 'removed', key: k, label: String(p?.label || '') });
      }
    });
    return out;
  });
  const diffAdded = computed(() => diffItems.value.filter((x) => x.kind === 'added'));
  const diffRemoved = computed(() => diffItems.value.filter((x) => x.kind === 'removed'));
  const groupTitleMapDraft = computed(() => {
    const map = new Map<string, string>();
    (canvasGroups.value || []).forEach((g) => {
      const id = String((g as any)?.id || '').trim();
      const title = String((g as any)?.title || '').trim();
      if (id) map.set(id, title || id);
    });
    return map;
  });
  const getGroupId = (f: any) => String(f?.groupId || '').trim();
  const groupTitle = (id: string) => {
    if (!id) return '未分组';
    return groupTitleMapDraft.value.get(id) || id;
  };
  const diffGroups = computed(() => {
    const pub = Array.isArray(publishedSchema.value) ? publishedSchema.value : [];
    const draft = Array.isArray(schema.value) ? schema.value : [];
    const pubGroups = new Set(pub.map((f: any) => getGroupId(f)).filter(Boolean));
    const draftGroups = new Set<string>();
    (canvasGroups.value || []).forEach((g) => {
      const id = String((g as any)?.id || '').trim();
      if (id) draftGroups.add(id);
    });
    draft.forEach((f: any) => {
      const id = getGroupId(f);
      if (id) draftGroups.add(id);
    });
    const added: DiffGroup[] = Array.from(draftGroups)
      .filter((id) => !pubGroups.has(id))
      .sort()
      .map((id) => ({ id, title: groupTitle(id) }));
    const removed: DiffGroup[] = Array.from(pubGroups)
      .filter((id) => !draftGroups.has(id))
      .sort()
      .map((id) => ({ id, title: id }));
    const pubMap = new Map<string, any>();
    pub.forEach((f: any) => {
      const k = String(f?.field || '').trim();
      if (k) pubMap.set(k, f);
    });
    const moved: DiffFieldMoved[] = [];
    draft.forEach((f: any) => {
      const k = String(f?.field || '').trim();
      if (!k) return;
      const pf = pubMap.get(k);
      if (!pf) return;
      const fromId = getGroupId(pf);
      const toId = getGroupId(f);
      if (fromId === toId) return;
      moved.push({
        field: k,
        label: String(f?.label || pf?.label || ''),
        fromId,
        toId,
        fromTitle: fromId ? fromId : '未分组',
        toTitle: toId ? groupTitle(toId) : '未分组'
      });
    });
    moved.sort((a, b) => a.field.localeCompare(b.field));
    return { added, removed, moved };
  });
  const diffGroupAdded = computed(() => diffGroups.value.added);
  const diffGroupRemoved = computed(() => diffGroups.value.removed);
  const diffFieldMoved = computed(() => diffGroups.value.moved);
  const diffHasAny = computed(() => {
    return (
      diffAdded.value.length > 0 ||
      diffRemoved.value.length > 0 ||
      diffGroupAdded.value.length > 0 ||
      diffGroupRemoved.value.length > 0 ||
      diffFieldMoved.value.length > 0
    );
  });
  const openDiff = () => {
    diffOpen.value = true;
  };

  const validatePreview = async () => {
    const formInst = previewRendererRef.value?.formRef;
    if (!formInst) return;
    try {
      const runValidate = () =>
        new Promise<{ valid: boolean; fields?: Record<string, any> }>((resolve) => {
          formInst.validate((valid: boolean, fields: any) => resolve({ valid, fields }));
        });
      const extractFromFields = (fields: any) => {
        if (!fields || typeof fields !== 'object') return '';
        const preferKey = '__fb_crossfield__';
        const keys = Object.keys(fields);
        const ordered = keys.includes(preferKey)
          ? [preferKey, ...keys.filter((k) => k !== preferKey)]
          : keys;
        for (const k of ordered) {
          const arr = fields[k];
          const msg = Array.isArray(arr) ? arr[0]?.message : '';
          if (msg) return String(msg);
        }
        return '';
      };
      const { valid, fields } = await runValidate();
      if (valid) {
        ElMessage.success('校验通过');
        return;
      }
      const msg = extractFromFields(fields) || '校验未通过：请检查字段校验或跨字段规则';
      ElMessage.error(msg);
    } catch {
      ElMessage.error('校验未通过：请检查字段校验或跨字段规则');
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (!mod) return;
    const key = e.key.toLowerCase();
    if (key === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    } else if (key === 'y') {
      e.preventDefault();
      redo();
    }
  };

  watch(
    () => currentField.value?.visibleWhen,
    (arr) => {
      if (!arr) return;
      arr.forEach((c) => (c.value = normalizeConditionValue(c.value)));
    },
    { deep: true }
  );
  watch(
    () => currentField.value?.disabledWhen,
    (arr) => {
      if (!arr) return;
      arr.forEach((c) => (c.value = normalizeConditionValue(c.value)));
    },
    { deep: true }
  );
  watch(
    () => currentField.value?.uid,
    () => {
      if (!currentField.value) {
        componentPropsDraftText.value = '';
        componentPropsJsonError.value = '';
        return;
      }
      try {
        componentPropsDraftText.value = JSON.stringify(
          currentField.value.componentProps || {},
          null,
          2
        );
      } catch {
        componentPropsDraftText.value = '';
      }
      componentPropsJsonError.value = '';
    },
    { immediate: true }
  );
  watch(
    () => schema.value,
    () => {
      rebuildBucketsFromSchema();
    },
    { deep: true }
  );
  watch(
    () => canvasBuckets.value,
    () => {
      if (restoring.value) return;
      rebuildSchemaFromBuckets();
    },
    { deep: true }
  );
  watch(
    () => crossFieldRules.value,
    () => pushSnapshotDebounced(),
    { deep: true }
  );
  watch(
    () => base.value,
    () => pushSnapshotDebounced(),
    { deep: true }
  );
  watch(
    () => schema.value,
    () => pushSnapshotDebounced(),
    { deep: true }
  );

  onMounted(() => {
    load();
    window.addEventListener('keydown', onKeyDown);
  });
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown);
    disposeSnapshots();
  });

  return {
    isEdit,
    base,
    baseFormRef,
    baseRules,
    schema,
    selectedUid,
    selectedUids,
    saving,
    centerTab,
    previewModel,
    previewRendererRef,
    paletteKeyword,
    canvasKeyword,
    importInputRef,
    crossFieldRules,
    canvasGroups,
    publishedSchema,
    publishedAt,
    crossFieldJsonError,
    crossFieldAdvanced,
    crossFieldAdvancedCollapse,
    crossFieldInfoIconUrl,
    UNGROUPED_ID,
    canvasBuckets,
    groupVisibleCountMap,
    groupedCanvas,
    canUndo,
    canRedo,
    undo,
    redo,
    elementPalette,
    otherPalette,
    clonePalette,
    parsedCrossFieldRules,
    qualityIssues,
    qualityHasError,
    focusIssue,
    canvasItemVisible,
    canvasVisibleCount,
    isSelected,
    selectedCount,
    currentField,
    updateCurrentFieldGroupId,
    applyCurrentFieldPatch,
    onCanvasItemClick,
    removeFieldByUid,
    toggleGroupCollapsed,
    createGroupByTitle,
    renameGroupByIdTitle,
    removeGroup,
    updateCrossFieldRules,
    updateCrossFieldAdvanced,
    updateCrossFieldAdvancedCollapse,
    updateCrossFieldRulesText,
    supportsOptions,
    supportsPlaceholder,
    supportsPattern,
    supportsTextLength,
    supportsNumberRange,
    dataSourceJsonError,
    handleDataSourceTypeChange,
    conditionOps,
    currentLinkageFieldOptions,
    patternPresets,
    handlePatternPresetChange,
    cascaderJsonError,
    cascaderOptionsText,
    formatCascaderOptions,
    updateCascaderOptionsText,
    componentPropsText,
    componentPropsJsonError,
    formatComponentProps,
    updateComponentPropsText,
    addOption,
    removeOption,
    onDragEnd,
    onGroupDragEnd,
    diffOpen,
    diffHasAny,
    diffAdded,
    diffRemoved,
    diffGroupAdded,
    diffGroupRemoved,
    diffFieldMoved,
    openDiff,
    load,
    save,
    goBack,
    exportSchemaJson,
    triggerImportSchemaJson,
    onImportSchemaJson,
    crossFieldRulesText,
    validatePreview,
    dataSourceText,
    formatDataSource,
    updateDataSourceText,
    batchRemoveSelected,
    batchSetDisabled,
    batchSetSpan,
    removeSelected,
    moveSelected,
    moveSelectedTo,
    duplicateSelected,
    crossFieldFieldOptions
  };
};
