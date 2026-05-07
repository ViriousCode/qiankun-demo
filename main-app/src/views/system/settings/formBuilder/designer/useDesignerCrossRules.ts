import { computed } from 'vue';
import type { Ref } from 'vue';
import type { FormCrossFieldRule } from '@/types/formBuilder';

type UseDesignerCrossRulesOptions = {
  crossFieldRules: Ref<FormCrossFieldRule[]>;
  crossFieldJsonError: Ref<string>;
  pushSnapshotDebounced: () => void;
};

export const useDesignerCrossRules = ({
  crossFieldRules,
  crossFieldJsonError,
  pushSnapshotDebounced
}: UseDesignerCrossRulesOptions) => {
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

  return {
    crossFieldRulesText
  };
};

