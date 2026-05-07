export type FormFieldType =
  | 'input'
  | 'textarea'
  | 'number'
  | 'autocomplete'
  | 'select'
  | 'cascader'
  | 'date'
  | 'datetime'
  | 'time'
  | 'slider'
  | 'rate'
  | 'color'
  | 'icon'
  | 'richtext'
  | 'switch'
  | 'radio'
  | 'checkbox';

export interface FormFieldDataSourceRemote {
  type: 'remote';
  /** HTTP method for remote option loading */
  method?: 'GET' | 'POST';
  /**
   * Remote URL path (recommended same-origin), e.g. `/api/system/form-builder/options/demo`
   * Query params may be appended by the renderer when `dependsOn` is configured.
   */
  url: string;
  /** Optional cache TTL in milliseconds */
  cacheTtlMs?: number;
  /**
   * Field names (schema `field`) whose values should be appended as query params when fetching.
   * When any dependency changes, cache is invalidated and options are refetched.
   */
  dependsOn?: string[];
  /**
   * Map API payload to `{label,value}[]`.
   * - `listPath`: dot path into response data for the array, e.g. `list` or `data.items`
   * - `labelKey` / `valueKey`: keys on each item object
   */
  listPath?: string;
  labelKey?: string;
  valueKey?: string;
}

export type FormFieldDataSource = { type: 'static' } | FormFieldDataSourceRemote;

export type FormFieldConditionOp =
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'includes'
  | 'not_includes'
  | 'in'
  | 'not_in';

export interface FormFieldCondition {
  /** 依赖的字段名（来自同一个表单 schema） */
  field: string;
  op: FormFieldConditionOp;
  /** 比较值（建议存储为原始类型；字符串也可） */
  value: any;
}

export interface FormFieldOption {
  label: string;
  value: string | number;
}

export interface FormFieldSchema {
  /** 前端生成的稳定 id，用于设计器选中/拖拽，不与后端 id 强绑定 */
  uid: string;
  type: FormFieldType;
  field: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  /** 必填校验失败时的提示文案 */
  requiredMessage?: string;
  disabled?: boolean;
  /**
   * 正则校验（用于 input / textarea 等文本类）。
   * 支持两种写法：
   * - 直接写 pattern 源码：`^\\d{11}$`
   * - 类似 JS 字面量：`/^\\d{11}$/i`
   */
  pattern?: string;
  /** 正则校验失败时的提示文案 */
  patternMessage?: string;
  /** 正则预设 key（仅用于设计器展示/默认填充） */
  patternPreset?: string;
  /** Element Plus 24 栅格 */
  span?: number;
  /** 文本类字段最小长度（input/textarea 等） */
  minLength?: number;
  /** 文本类字段最大长度（input/textarea 等） */
  maxLength?: number;
  /** 数值类字段最小值（number/slider/rate 等） */
  min?: number;
  /** 数值类字段最大值（number/slider/rate 等） */
  max?: number;
  /** 数值精度（number） */
  precision?: number;
  /**
   * date/datetime/time constraints (ISO-like strings parseable by `Date`, or Element Plus-compatible values).
   * These are enforced at runtime validation (in addition to any native picker constraints).
   */
  minDate?: string;
  maxDate?: string;
  minDateTime?: string;
  maxDateTime?: string;
  minTime?: string;
  maxTime?: string;
  /** select / radio / checkbox */
  options?: FormFieldOption[];
  /** cascader options（Element Plus Cascader options 结构） */
  treeOptions?: any[];
  /**
   * 显隐联动：满足所有条件时显示；为空或未配置时视为“始终显示”
   * 目前使用 AND 逻辑（conditions 全部满足）
   */
  visibleWhen?: FormFieldCondition[];
  /**
   * 禁用联动：满足所有条件时禁用；为空或未配置时仅由 disabled 控制
   * 目前使用 AND 逻辑（conditions 全部满足）
   */
  disabledWhen?: FormFieldCondition[];
  /** 透传给具体组件的 props（高级配置） */
  componentProps?: Record<string, any>;
  /** Options data source (defaults to static `options` when omitted) */
  dataSource?: FormFieldDataSource;
  /**
   * Designer-only helper for editing `dataSource` (optional; may be stripped server-side).
   * Runtime should rely on `dataSource` itself.
   */
  dataSourceType?: 'static' | 'remote';
  /** 初始值（渲染器会写入到 form model） */
  defaultValue?: any;
  /**
   * Designer-only canvas grouping.
   * - When set, the designer will render the canvas list grouped/collapsible.
   * - Runtime renderer should ignore this field.
   */
  groupId?: string;
}

export interface FormCrossFieldRule {
  /** Stable id for debugging/UI (optional) */
  id?: string;
  /** Error message when rule fails */
  message: string;
  /** Condition logic (defaults to AND) */
  logic?: 'AND' | 'OR';
  when: FormFieldCondition[];
}

export interface FormCanvasGroup {
  id: string;
  title: string;
  collapsed?: boolean;
}

export interface FormDefinition {
  id: number;
  name: string;
  code: string;
  status: number;
  schema: FormFieldSchema[];
  /**
   * Declarative cross-field validation rules (optional).
   * Evaluated at runtime by `FormRenderer` in addition to per-field rules.
   */
  crossFieldRules?: FormCrossFieldRule[];
  /**
   * Designer-only: canvas grouping metadata (optional).
   * Backward compatible: when omitted, designer treats all fields as ungrouped.
   */
  canvasGroups?: FormCanvasGroup[];
  /** Draft schema snapshot for publish workflow (optional) */
  draftSchema?: FormFieldSchema[];
  /** Published schema snapshot for publish workflow (optional) */
  publishedSchema?: FormFieldSchema[];
  /** Last publish timestamp (optional, mock server uses locale string) */
  publishedAt?: string;
  createTime?: string;
  updateTime?: string;
}

export interface FormDefinitionListParams {
  keyword?: string;
  status?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface FormSubmission {
  id: number;
  formId: number;
  payload: Record<string, any>;
  createTime?: string;
}
