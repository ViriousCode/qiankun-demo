import { computed } from 'vue';
import type { Ref } from 'vue';
import type { FormCrossFieldRule, FormFieldSchema } from '@/types/formBuilder';

type UseDesignerCrossFieldBindingsOptions = {
  schema: Ref<FormFieldSchema[]>;
  crossFieldRules: Ref<FormCrossFieldRule[]>;
  crossFieldAdvanced: Ref<boolean>;
  crossFieldAdvancedCollapse: Ref<string[]>;
  crossFieldRulesText: Ref<string>;
};

export const useDesignerCrossFieldBindings = ({
  schema,
  crossFieldRules,
  crossFieldAdvanced,
  crossFieldAdvancedCollapse,
  crossFieldRulesText
}: UseDesignerCrossFieldBindingsOptions) => {
  const crossFieldFieldOptions = computed(() =>
    schema.value
      .filter((x) => x.field)
      .map((x) => ({
        value: String(x.field),
        label: `${x.label || x.field}（${x.field}）`
      }))
  );

  const updateCrossFieldRules = (next: FormCrossFieldRule[]) => {
    crossFieldRules.value = Array.isArray(next) ? next : [];
  };
  const updateCrossFieldAdvanced = (next: boolean) => {
    crossFieldAdvanced.value = Boolean(next);
  };
  const updateCrossFieldAdvancedCollapse = (next: string[]) => {
    crossFieldAdvancedCollapse.value = Array.isArray(next) ? next : [];
  };
  const updateCrossFieldRulesText = (text: string) => {
    crossFieldRulesText.value = text;
  };

  const parsedCrossFieldRules = computed(() => crossFieldRules.value || []);

  return {
    crossFieldFieldOptions,
    updateCrossFieldRules,
    updateCrossFieldAdvanced,
    updateCrossFieldAdvancedCollapse,
    updateCrossFieldRulesText,
    parsedCrossFieldRules
  };
};

