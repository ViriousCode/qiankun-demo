# 可视化表单生成器（Form Builder）

本模块提供「表单定义管理 + 可视化拖拽设计器 + 运行时渲染 + 提交记录」能力，默认对接 `main-app/serve` 的内存模拟接口。

## 功能

- **表单定义列表**
  - 查询（关键词：名称/编码）、分页、删除
  - 入口：`/system/settings/formBuilder`
- **表单设计器**
  - 左侧组件库拖拽到画布
  - 画布字段拖拽排序、选中、移除
  - 右侧属性编辑（标题/字段名/必填/禁用/占用列/提示/正则/选项等）
  - 预览 tab 实时预览（画布/预览均在面板内滚动）
  - 入口：`/system/settings/formBuilder/designer?id=...`
- **预览填报**
  - 渲染表单并提交数据
  - 入口：`/system/settings/formBuilder/fill?id=...`
- **提交记录**
  - 分页列表、查看 payload 详情
  - 入口：`/system/settings/formBuilder/submissions?id=...`

## 页面与核心文件

- **类型定义**：`src/types/formBuilder.ts`
- **API 封装**：`src/api/formDefinition.ts`
- **列表页**：`src/views/system/settings/formBuilder/index.vue`
- **设计器**：`src/views/system/settings/formBuilder/designer.vue`
- **预览填报**：`src/views/system/settings/formBuilder/fill.vue`
- **提交记录**：`src/views/system/settings/formBuilder/submissions.vue`
- **运行时渲染器**：`src/views/system/settings/formBuilder/components/FormRenderer.vue`
- **富文本组件（wangeditor）**：`src/views/system/settings/formBuilder/components/RichTextEditor.vue`
- **图标选择（azura-icon）**：复用 `src/components/IconSelect.vue`

## 字段 Schema（核心数据结构）

表单定义保存为一条记录（`FormDefinition`），其中 `schema` 为字段数组（`FormFieldSchema[]`）。

### `FormDefinition`

- `id: number`
- `name: string` 表单名称
- `code: string` 唯一编码（serve 侧校验：字母开头，3–50 位，仅字母/数字/下划线）
- `status: number` 0/1
- `schema: FormFieldSchema[]`
- `crossFieldRules?: Array<{ message: string; when: Array<{ field: string; op: string; value: any }> }>`
  - 用于跨字段校验（运行时由 `FormRenderer` 执行）
- `createTime? / updateTime?: string`

### `FormFieldSchema`（常用字段）

- `uid: string` 前端生成的稳定 id（拖拽/选中用）
- `type: FormFieldType`
- `field: string` 字段名（同一表单内必须唯一）
- `label: string` 标题
- `span?: number` Element Plus 24 栅格
- `placeholder?: string`
- `disabled?: boolean`
- `defaultValue?: any`

#### 校验
- `required?: boolean`
- `requiredMessage?: string` 必填为空提示文案
- `pattern?: string` 正则字符串，支持：
  - `^\\d{11}$`
  - `/^\\d{11}$/i`
- `patternMessage?: string` 正则不通过提示文案
- `minDate? / maxDate?`：约束 `date`（可解析为 `Date` 的字符串）
- `minDateTime? / maxDateTime?`：约束 `datetime`
- `minTime? / maxTime?`：约束 `time`（字符串比较，建议 `HH:mm:ss`）

#### 选项类
- `options?: { label: string; value: string | number }[]`
  - 适用：`select / radio / checkbox / autocomplete`
- `dataSource?: { type: 'remote'; method?: 'GET'|'POST'; url: string; listPath?: string; labelKey?: string; valueKey?: string; cacheTtlMs?: number; dependsOn?: string[] }`
  - 适用：`select / radio / checkbox / autocomplete`
  - `url` 在 serve 侧要求 **必须以 `/api/` 开头**（仅允许同源接口路径）
  - 内置示例接口：`GET /api/system/form-builder/options/demo`（返回 `{ list: [{label,value}] }`）
- `dataSourceType?: 'static' | 'remote'`：仅设计器使用的编辑辅助字段（保存时会剥离）
- `treeOptions?: any[]`
  - 适用：`cascader`（Element Plus Cascader options 结构）

#### 高级透传
- `componentProps?: Record<string, any>`
  - 透传给对应 Element Plus 组件（按需扩展）

### `FormFieldType`（当前支持）

**Element**
- `input` `textarea` `number`
- `autocomplete` `select` `cascader`
- `radio` `checkbox`
- `date` `datetime` `time`
- `slider` `rate` `color`
- `switch`

**其他**
- `icon`：Azura 图标选择（`IconSelect`）
- `richtext`：富文本（wangeditor）

## 运行时渲染与校验

渲染器 `FormRenderer.vue` 负责将 `schema` 映射为 Element Plus 表单组件，并生成 `rules`：

- **必填**：优先使用 `requiredMessage`，否则默认 `请填写${label}`
- **正则**：仅对 `input / textarea / number` 生效；空值不拦截（交给 required）
- **日期/时间范围**：对 `date / datetime / time` 读取 `min*` / `max*` 字段并校验
- **远程选项**：对声明 `dataSource.type=remote` 的字段，会请求 `url` 并将结果映射为 `options`（支持 `cacheTtlMs` 与 `dependsOn` 触发刷新）
- **跨字段规则**：读取 `FormDefinition.crossFieldRules`（由 `fill.vue` 传入 `FormRenderer`），当某条 rule 的 `when` **未全部满足**时校验失败（用于表达“必须满足的约束”）
- **双向绑定防递归**：内部 `localModel` 与 `v-model` 同步时使用 `syncing` 标记，避免 watch 循环触发导致递归更新

## 后端（serve）接口

实现位置：`serve/index.js`（内存模拟库）。

### 表单定义
- `GET /api/system/form-definitions`
  - query：`keyword?` `status?` `pageIndex?` `pageSize?`
  - return：`{ list, total }`
- `POST /api/system/form-definitions`
- `GET /api/system/form-definitions/:id`
- `PUT /api/system/form-definitions/:id`
- `DELETE /api/system/form-definitions/:id`
  - 默认 **级联删除** 对应 submissions

### 提交记录
- `GET /api/system/form-definitions/:id/submissions`
  - query：`pageIndex?` `pageSize?`
  - return：`{ list, total }`
- `POST /api/system/form-definitions/:id/submissions`
  - body：`{ payload: object }`

### serve 侧校验
- `schema` 必须为数组
- `uid/field/label/type` 必填
- `field` 去重
- `pattern` 若填写必须可编译成 RegExp
- `dataSource` 若填写：仅支持 `type=remote`，且 `url` 必须以 `/api/` 开头
- `crossFieldRules` 若填写：必须为数组；每条必须包含 `message` 与非空 `when`，且 `when[*].field` 必须存在于 `schema.field` 中

## 菜单与权限

### 菜单（动态路由）
在 `serve/index.js` 的 `menuList` 中加入：
- `系统设置 → 表单生成器`：`/system/settings/formBuilder`
- 隐藏菜单用于路由注入：
  - `/system/settings/formBuilder/designer`
  - `/system/settings/formBuilder/fill`
  - `/system/settings/formBuilder/submissions`

### 权限常量
`src/constants/permissions.ts`：`PERMS.FORM_DEF.*`

### 管理员权限
`serve/index.js` 的 `roles[0].permissionIds` 已包含相关菜单与按钮 id，确保可见可操作。

## 扩展指引

- **新增组件类型**：
  1. 在 `src/types/formBuilder.ts` 扩展 `FormFieldType` 与字段结构
  2. `designer.vue`：palette 增加项 + `clonePalette()` 生成默认字段
  3. `FormRenderer.vue`：新增渲染分支 + `getComponentProps()`（必要时新增校验/trigger）
  4. 如需服务端校验，补充 `serve/index.js` 的 `validateSchema()`

## 手工回归检查清单（QA）

覆盖重点：大表单导航、联动边界、远程选项失败/重试、导入导出、发布前质量检查、分组/拖拽。

### 设计器（designer）

- **大表单导航**
  - 画布字段搜索：关键字命中高亮/可定位
  - 点击质量检查问题：能定位到对应字段
  - 画布滚动：最后一项可完整显示；分组折叠/展开不抖动

- **分组**
  - 新建分组后现有字段不丢失
  - 字段可切换分组（属性面板“分组”下拉）
  - 分组支持拖动排序；排序后保存/重新打开顺序保持一致

- **拖拽与批量**
  - 左侧组件拖入画布、组内/组间拖拽排序
  - 多选（Ctrl/Cmd、Shift）+ 批量操作（移除/禁用/启用/占用列）正确
  - 撤销/重做能恢复：字段顺序、分组顺序、选择状态、跨字段规则

- **联动（visibleWhen / disabledWhen）**
  - 显隐联动切换时：隐藏字段不应在界面上残留报错
  - 禁用联动切换时：组件状态变化正确

- **跨字段规则**
  - 规则未满足时：提示信息能显示具体规则与失败字段
  - 规则引用隐藏字段时：不应因为隐藏字段导致校验失败

- **远程选项 dataSource**
  - 正常加载：下拉/单选/多选/自动补全能渲染选项
  - 依赖字段变化：`dependsOn` 触发刷新
  - 接口失败：显示错误与“重试”按钮；重试生效

- **导入/导出**
  - 导出 JSON 后可导入还原（字段、分组、跨字段规则）
  - 导入非法 JSON：应阻止保存并提示问题原因

### 运行时（fill / preview）

- **基础渲染**
  - 各类型组件可输入/选择，双向绑定正常
  - 必填/正则/范围校验触发时机正确（blur/change）

- **联动与校验**
  - 字段隐藏时不应阻塞提交校验（看不见的字段不应导致 validate 失败）
  - 跨字段规则与单字段规则同时存在时：错误提示清晰

### serve（模拟后端）

- **保存校验**
  - `schema`、`dataSource`、`crossFieldRules` 的校验提示清晰
  - 更新（PUT）与新增（POST）行为一致：可保存 `crossFieldRules` / `canvasGroups`

