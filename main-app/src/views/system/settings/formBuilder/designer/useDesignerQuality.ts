import { computed } from 'vue';
import type { Ref } from 'vue';
import type { FormCrossFieldRule, FormFieldSchema } from '@/types/formBuilder';
import { buildDependencyEdges, findCycles } from '../utils';

export type QualityIssue = {
  level: 'error' | 'warn';
  message: string;
  uid?: string;
};

type UseDesignerQualityOptions = {
  schema: Ref<FormFieldSchema[]>;
  crossFieldRules: Ref<FormCrossFieldRule[]>;
  crossFieldJsonError: Ref<string>;
  dataSourceJsonError: Ref<string>;
};

export const useDesignerQuality = ({
  schema,
  crossFieldRules,
  crossFieldJsonError,
  dataSourceJsonError
}: UseDesignerQualityOptions) => {
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
      if (!label) issues.push({ level: 'error', uid, message: `标题为空（field: ${field || '(empty)'}）` });
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
            issues.push({ level: 'error', message: `跨字段规则 ${idx + 1}：条件 ${j + 1} 未选择字段` });
          }
          if (!String(c?.op || '').trim()) {
            issues.push({ level: 'error', message: `跨字段规则 ${idx + 1}：条件 ${j + 1} 未选择操作符` });
          }
        });
      }
    });

    return issues;
  });

  const qualityHasError = computed(() => qualityIssues.value.some((x) => x.level === 'error'));

  return {
    qualityIssues,
    qualityHasError
  };
};

