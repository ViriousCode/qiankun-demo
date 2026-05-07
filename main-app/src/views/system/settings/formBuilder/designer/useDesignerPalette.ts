import { computed } from 'vue';
import type { Ref } from 'vue';
import type { FormFieldSchema, FormFieldType } from '@/types/formBuilder';

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

type UseDesignerPaletteOptions = {
  paletteKeyword: Ref<string>;
  schema: Ref<FormFieldSchema[]>;
};

export const useDesignerPalette = ({ paletteKeyword, schema }: UseDesignerPaletteOptions) => {
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

  return {
    elementPalette,
    otherPalette,
    createUid,
    buildFieldSet,
    createUniqueField,
    clonePalette
  };
};

