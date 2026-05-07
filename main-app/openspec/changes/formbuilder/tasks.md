## 1. Schema extensions & compatibility baseline

- [x] 1.1 Extend `src/types/formBuilder.ts` with optional extension fields (backward compatible): unknown-type handling notes, `dataSource` descriptor (remote options), cross-field rules container (name aligned with `design.md`), draft/publish snapshot fields (exact shape finalized per `design.md` open questions).
- [x] 1.2 Update `serve/index.js` `validateSchema()` to validate new optional blocks (reject invalid JSON shapes, unsafe URLs if applicable) while accepting legacy schemas unchanged.
- [x] 1.3 Add minimal unit-level helpers (pure functions) for mapping remote responses → `options` and for validating acyclic linkage/cross-rule dependencies (location TBD under `src/views/system/settings/formBuilder/` or `src/utils/`).

## 2. Designer UX: navigation, grouping, batch edits

- [x] 2.1 Add canvas-side field search + jump/selection sync in `src/views/system/settings/formBuilder/designer.vue` (complements existing palette search).
- [x] 2.2 Implement grouping model + collapsible canvas sections (persisted in schema in a backward compatible way) in `designer.vue`.
- [x] 2.3 Add multi-select + batch actions (delete / toggle disabled / set span) with undo/redo integration in `designer.vue`.
- [x] 2.4 Add pre-save quality panel (duplicate `field`, empty `label`, invalid JSON editors) blocking hard errors in `designer.vue`.

## 3. Validation: cross-field, date constraints, visibility interactions

- [x] 3.1 Extend `src/views/system/settings/formBuilder/components/FormRenderer.vue` to evaluate declarative cross-field rules alongside existing Element Plus rules.
- [x] 3.2 Implement required-when + hidden-field validation clearing behavior consistent with specs (no invisible blocking errors).
- [x] 3.3 Add min/max validation for `date`, `datetime`, and `time` fields when configured (renderer + designer property editors if missing).
- [x] 3.4 Add designer-side validation for cyclic linkage / cyclic cross-rule dependencies before save.

## 4. Remote data sources for option fields

- [x] 4.1 Add `dataSource` editor UI for eligible field types in `designer.vue` (static remains default; remote is optional).
- [x] 4.2 Implement runtime fetch + mapping + caching TTL + dependency invalidation in `FormRenderer.vue` using existing `src/utils/request.ts`.
- [x] 4.3 Add loading/error/retry UI for fields with remote sources in `FormRenderer.vue` (and/or small sub-component under `components/`).
- [x] 4.4 Add serve-side mock endpoints (if needed) in `serve/index.js` for option fetching to support local dev without external services.

## 5. Import / export / draft-publish / diff

- [x] 5.1 Add export JSON action in `src/views/system/settings/formBuilder/index.vue` or `designer.vue` (download includes `name`, `code`, `status`, `schema`, and any new snapshot fields).
- [x] 5.2 Add import JSON flow with validation + confirm-on-overwrite in `designer.vue` (create new vs update existing).
- [x] 5.3 Extend `src/api/formDefinition.ts` + `serve/index.js` to persist draft/publish snapshots per finalized storage decision in `design.md`.
- [x] 5.4 Add a basic diff UI between draft and published schemas (field-keyed) in `designer.vue` (or a small new component under `components/`).

## 6. Documentation & regression checklist

- [x] 6.1 Update `docs/form-builder.md` with new schema fields, remote `dataSource` format, cross-field rules format, and draft/publish semantics.
- [x] 6.2 Add a manual QA checklist covering: large form navigation, linkage edge cases, remote options failure/retry, import/export roundtrip, publish immutability.
