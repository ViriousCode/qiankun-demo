## Context

The main-app already ships a working form builder loop: list + designer + runtime renderer + submissions, backed by `serve/index.js` in-memory APIs (`src/api/formDefinition.ts`). The designer (`designer.vue`) supports drag/drop, undo/redo, property editing, preview, and basic linkage (`visibleWhen` / `disabledWhen`). The renderer (`FormRenderer.vue`) maps schema to Element Plus components and generates Element Plus rules.

The pain points are mostly “product completeness” for larger forms: navigation at scale, safer editing workflows (import/export), richer validation and linkage, and remote option sources.

## Goals / Non-Goals

**Goals:**
- Add backward-compatible schema extensions that unlock UX, validation, remote options, and import/export/versioning without breaking existing saved forms.
- Keep the implementation incremental: ship behind clear UI entry points and safe defaults.
- Ensure runtime validation behavior is predictable with visibility/linkage (no “invisible but blocking” errors).

**Non-Goals:**
- Building a full enterprise BPM form engine (complex nested layouts, dynamic tables, graph-based rule engine) in one iteration.
- Replacing Element Plus form validation entirely; we extend it where needed.

## Decisions

### Decision: Backward compatibility is enforced at the type + runtime layers
- **Choice**: All new schema keys are optional; unknown `type` degrades gracefully.
- **Rationale**: The repo already has persisted schemas in dev via `serve`; breaking changes would strand data.
- **Alternatives considered**: Versioned schema top-level (`schemaVersion`) only — rejected as unnecessary until we need migrations.

### Decision: Cross-field validation is declarative and evaluated in the renderer
- **Choice**: Add a small `crossRules` (name TBD) structure on the form definition or schema root, evaluated by `FormRenderer.vue` using `el-form` `rules` + custom validators.
- **Rationale**: Keeps validation UX consistent with Element Plus.
- **Alternatives considered**: Pure JS rule functions in schema — rejected (not serializable / unsafe).

### Decision: Remote options use a first-party “data source descriptor” + existing `request` wrapper
- **Choice**: Add `dataSource` config on eligible fields; renderer fetches and maps to `options` with caching + dependency keys.
- **Rationale**: Matches existing axios/request stack; avoids ad-hoc `fetch` scattered across components.
- **Alternatives considered**: Only allow static options — rejected (common real need).

### Decision: Draft/publish stores published snapshot alongside draft fields
- **Choice**: Extend `FormDefinition` with optional `draftSchema` + `publishedSchema` + `publishedAt` OR store snapshots in nested object; keep `schema` as “active editing schema” for compatibility OR migrate carefully (final choice to be finalized during implementation).
- **Rationale**: Needs explicit storage semantics in `serve/index.js` and UI.
- **Alternatives considered**: Separate tables/endpoints — likely too heavy for current mock backend.

## Risks / Trade-offs

- **[Risk] Remote option endpoints may be untrusted or vary by environment** → Mitigation: restrict to same-origin paths by default; add allowlist config; sanitize mapping.
- **[Risk] Draft/publish duplication increases storage complexity** → Mitigation: start with minimal snapshot fields; add migration path when moving to real DB.
- **[Risk] Cross-field rules can create cycles** → Mitigation: enforce acyclic dependency graph at save time in designer.

## Migration Plan

- Phase 1: ship schema extensions as optional fields; no DB migration required for mock `serve` beyond additive fields.
- Phase 2: add UI for import/export + diff; default behavior unchanged.
- Phase 3: introduce draft/publish fields; default existing records to “published == current schema, draft empty”.

## Open Questions

- Should `schema` remain the canonical field for compatibility, with `publishedSchema` as derived, or should we introduce `schemaVersion` now?
- Do we require a server-side proxy for third-party option URLs, or only same-origin API paths?
- What is the desired UX for hidden-field values: keep values but exclude from submit vs clear on hide?
