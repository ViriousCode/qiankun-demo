## Why

当前表单设计器已具备「字段拖拽 + 属性编辑 + 运行时渲染 + 提交记录」的完整闭环，但在复杂表单（字段多、联动多、需要复用/版本迭代）的场景下，仍存在可用性与可维护性成本：难以快速定位字段、缺少导入导出/模板复用、联动与校验表达能力有限、缺少“更像产品级”的交互（分组/页面/栅格布局、字段说明/帮助、异步选项等）。

希望在不破坏现有 schema 兼容的前提下，补齐关键能力，使其能覆盖更多真实业务表单场景，并降低后续扩展成本。

## What Changes

- 提升设计器可用性：字段搜索与定位、画布分组/折叠、批量操作、快捷键与更清晰的错误提示（重复 field、缺少 label 等）。
- 增强字段表达能力：支持更丰富的校验（数值范围/长度已有，补充日期范围、选择类必填触发、跨字段校验/依赖校验）、更可控的联动（显隐/禁用外，补充“必填联动/清空联动”）。
- 复用与协作能力：支持 schema 导入/导出（JSON）、模板/复制表单、版本化（草稿/发布）与变更对比（diff）基础能力。
- 数据源能力：选项类字段支持静态 options 之外的“远程数据源”（如接口拉取、字典映射），并在运行时渲染器中统一处理。
- 运行时体验：完善渲染器对联动、默认值初始化、隐藏字段校验清理的边界处理（例如：隐藏字段是否清空、是否参与提交）。

## Capabilities

### New Capabilities

- `form-builder-ux`: 设计器交互增强（字段搜索/定位、分组折叠、批量操作、校验提示与质量检查）。
- `form-builder-schema-extensions`: schema 扩展与兼容策略（新增属性、默认值规则、联动/校验扩展，保证老数据可渲染）。
- `form-builder-validation`: 统一校验体系（内置规则扩展、跨字段校验、联动必填/清空策略、校验触发与隐藏字段策略）。
- `form-builder-data-sources`: 选项类字段的数据源能力（静态/远程/字典），以及渲染器的取数与缓存策略。
- `form-builder-import-export-versioning`: 导入/导出（JSON）、模板复用、版本化（草稿/发布）与基础 diff/回滚策略。

### Modified Capabilities

- （暂无。当前 `openspec/specs/` 为空，本次以新增能力为主；后续若沉淀出稳定 spec，再在此处声明修改项。）

## Impact

- **前端页面**：`src/views/system/settings/formBuilder/*`（`designer.vue`、`fill.vue`、`submissions.vue`、`index.vue`）将增加交互与配置项。
- **运行时渲染器**：`src/views/system/settings/formBuilder/components/FormRenderer.vue` 将扩展数据源/校验/联动策略，并保证兼容现有 `FormFieldSchema`。
- **类型定义**：`src/types/formBuilder.ts` 将扩展 schema（新增属性需向后兼容）。
- **API/服务端**：`src/api/formDefinition.ts` 与 `serve/index.js` 可能需要新增接口（如导入导出、版本发布、远程 options 代理）或扩展校验规则。
