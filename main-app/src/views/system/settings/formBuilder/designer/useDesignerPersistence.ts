import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import type { Router } from 'vue-router';
import type { Ref } from 'vue';
import { addFormDefinition, getFormDefinitionDetail, updateFormDefinition } from '@/api/formDefinition';
import type { FormCanvasGroup, FormCrossFieldRule, FormDefinition, FormFieldSchema, FormFieldType } from '@/types/formBuilder';

type BaseModel = { name: string; code: string; status: number };

type UseDesignerPersistenceOptions = {
  router: Router;
  isEdit: Ref<boolean>;
  idParam: Ref<number | null>;
  base: Ref<BaseModel>;
  baseFormRef: Ref<FormInstance | undefined>;
  schema: Ref<FormFieldSchema[]>;
  crossFieldRules: Ref<FormCrossFieldRule[]>;
  canvasGroups: Ref<FormCanvasGroup[]>;
  selectedUid: Ref<string>;
  selectedUids: Ref<Set<string>>;
  publishedSchema: Ref<FormFieldSchema[] | null>;
  publishedAt: Ref<string>;
  crossFieldJsonError: Ref<string>;
  crossFieldAdvanced: Ref<boolean>;
  dataSourceJsonError: Ref<string>;
  saving: Ref<boolean>;
  importInputRef: Ref<HTMLInputElement | null>;
  normalizeDesignerSchema: (list: FormFieldSchema[]) => void;
  rebuildBucketsFromSchema: () => void;
  initSnapshots: () => void;
  supportsOptions: (type: FormFieldType) => boolean;
  qualityHasError: Ref<boolean>;
};

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useDesignerPersistence = ({
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
}: UseDesignerPersistenceOptions) => {
  const goBack = () => {
    router.push('/system/settings/formBuilder');
  };

  const load = async () => {
    if (!isEdit.value) return;
    const id = idParam.value;
    if (id == null) return;
    const row: FormDefinition = await getFormDefinitionDetail(id);
    base.value = { name: row.name, code: row.code, status: row.status };
    publishedSchema.value = Array.isArray((row as any).publishedSchema)
      ? deepClone((row as any).publishedSchema as any)
      : Array.isArray((row as any).schema)
        ? deepClone((row as any).schema as any)
        : null;
    publishedAt.value = String((row as any).publishedAt || row.updateTime || row.createTime || '');
    schema.value = Array.isArray((row as any).draftSchema)
      ? deepClone((row as any).draftSchema as any)
      : Array.isArray(row.schema)
        ? deepClone(row.schema as any)
        : [];
    normalizeDesignerSchema(schema.value);
    crossFieldRules.value = Array.isArray(row.crossFieldRules) ? row.crossFieldRules : [];
    (crossFieldRules.value || []).forEach((r: any) => {
      if (!r) return;
      if (r.logic !== 'AND' && r.logic !== 'OR') r.logic = 'AND';
    });
    canvasGroups.value = Array.isArray((row as any).canvasGroups) ? ((row as any).canvasGroups as any) : [];
    rebuildBucketsFromSchema();
    if (crossFieldRules.value.length > 0) crossFieldAdvanced.value = false;
    crossFieldJsonError.value = '';
    selectedUid.value = schema.value[0]?.uid || '';
    selectedUids.value = selectedUid.value ? new Set([selectedUid.value]) : new Set();
    initSnapshots();
  };

  const save = async () => {
    try {
      await baseFormRef.value?.validate();
    } catch {
      return;
    }
    const name = String(base.value.name || '').trim();
    const code = String(base.value.code || '').trim();
    if (schema.value.length === 0) return ElMessage.error('请至少添加一个字段');
    if (qualityHasError.value) return ElMessage.error('保存失败：请先修复质量检查中的错误');
    if (crossFieldJsonError.value) return ElMessage.error('跨字段规则 JSON 未通过校验，请先修正');
    if (dataSourceJsonError.value) return ElMessage.error('远程选项配置 JSON 未通过校验，请先修正');

    const fieldSet = new Set<string>();
    for (const f of schema.value) {
      const field = String(f.field || '').trim();
      const label = String(f.label || '').trim();
      if (!field) return ElMessage.error('存在字段名为空的项');
      if (!label) return ElMessage.error('存在标题为空的项');
      if (fieldSet.has(field)) return ElMessage.error(`字段名重复：${field}`);
      fieldSet.add(field);
    }

    saving.value = true;
    try {
      const schemaForSave = deepClone(schema.value || []).map((f: any) => {
        const next = { ...f };
        const dsType = next.dataSourceType;
        delete next.dataSourceType;
        if (supportsOptions(next.type) && dsType !== 'remote') {
          delete next.dataSource;
        }
        return next;
      });

      const payload: any = {
        name,
        code,
        status: base.value.status,
        schema: schemaForSave,
        draftSchema: schemaForSave
      };
      if ((crossFieldRules.value || []).length > 0) {
        payload.crossFieldRules = crossFieldRules.value;
      }
      if ((canvasGroups.value || []).length > 0) {
        payload.canvasGroups = canvasGroups.value;
      }
      if (isEdit.value && idParam.value != null) {
        await updateFormDefinition(idParam.value, payload);
        ElMessage.success('保存成功');
        goBack();
      } else {
        await addFormDefinition(payload as any);
        ElMessage.success('创建成功');
        goBack();
      }
    } finally {
      saving.value = false;
    }
  };

  const exportSchemaJson = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            name: base.value.name,
            code: base.value.code,
            status: base.value.status,
            schema: schema.value,
            crossFieldRules: crossFieldRules.value || [],
            canvasGroups: canvasGroups.value || [],
            draftSchema: schema.value
          },
          null,
          2
        )
      ],
      { type: 'application/json;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${String(base.value.code || 'form').trim() || 'form'}-schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerImportSchemaJson = () => {
    importInputRef.value?.click();
  };

  const onImportSchemaJson = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') {
        ElMessage.error('导入失败：JSON 格式不正确');
        return;
      }
      if (Array.isArray(parsed)) {
        schema.value = parsed as FormFieldSchema[];
        normalizeDesignerSchema(schema.value);
        crossFieldRules.value = [];
        crossFieldJsonError.value = '';
        canvasGroups.value = [];
        rebuildBucketsFromSchema();
        selectedUid.value = schema.value[0]?.uid || '';
        initSnapshots();
        ElMessage.success('已导入 schema（数组格式）');
        return;
      }
      if (Array.isArray(parsed.schema)) {
        schema.value = parsed.schema as FormFieldSchema[];
        normalizeDesignerSchema(schema.value);
      }
      if (parsed.name != null) base.value.name = String(parsed.name);
      if (parsed.code != null) base.value.code = String(parsed.code);
      if (parsed.status != null) base.value.status = Number(parsed.status);
      if (Array.isArray(parsed.crossFieldRules)) {
        crossFieldRules.value = parsed.crossFieldRules as FormCrossFieldRule[];
        crossFieldJsonError.value = '';
      }
      if (Array.isArray(parsed.canvasGroups)) {
        canvasGroups.value = parsed.canvasGroups as any;
      }
      if (Array.isArray((parsed as any).draftSchema)) {
        schema.value = (parsed as any).draftSchema as any;
        normalizeDesignerSchema(schema.value);
      }
      rebuildBucketsFromSchema();
      selectedUid.value = schema.value[0]?.uid || '';
      initSnapshots();
      ElMessage.success('导入成功');
    } catch {
      ElMessage.error('导入失败：无法读取文件');
    }
  };

  return {
    load,
    save,
    goBack,
    exportSchemaJson,
    triggerImportSchemaJson,
    onImportSchemaJson
  };
};
