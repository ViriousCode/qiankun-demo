import type { FormCrossFieldRule, FormFieldCondition, FormFieldSchema } from '@/types/formBuilder';

export type RemoteOption = { label: string; value: string | number };

export const getByPath = (obj: any, path: string) => {
  const p = String(path || '').trim();
  if (!p) return obj;
  return p.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
};

export const mapRemoteOptions = (raw: any, schema: FormFieldSchema): RemoteOption[] => {
  const ds: any = (schema as any)?.dataSource;
  const listPath = String(ds?.listPath || '').trim();
  const arr = listPath ? getByPath(raw, listPath) : raw;
  const list = Array.isArray(arr) ? arr : Array.isArray(raw) ? raw : [];
  const labelKey = String(ds?.labelKey || 'label');
  const valueKey = String(ds?.valueKey || 'value');
  return list
    .map((x: any) => ({
      label: String(x?.[labelKey] ?? ''),
      value: x?.[valueKey]
    }))
    .filter((x: any) => x.label && x.value !== undefined && x.value !== null);
};

export type DependencyEdge = { from: string; to: string; reason: string };

export const buildDependencyEdges = (schema: FormFieldSchema[]) => {
  const edges: DependencyEdge[] = [];
  const list = Array.isArray(schema) ? schema : [];
  list.forEach((f: any) => {
    const toField = String(f?.field || '').trim();
    if (!toField) return;
    const collectConds = (conds: any, reason: string) => {
      const cList = Array.isArray(conds) ? conds : [];
      cList.forEach((c: any) => {
        const fromField = String(c?.field || '').trim();
        if (!fromField || fromField === toField) return;
        edges.push({ from: fromField, to: toField, reason });
      });
    };
    collectConds(f.visibleWhen, 'visibleWhen');
    collectConds(f.disabledWhen, 'disabledWhen');
    const ds = f.dataSource;
    if (ds && ds.type === 'remote' && Array.isArray((ds as any).dependsOn)) {
      (ds as any).dependsOn.forEach((x: any) => {
        const fromField = String(x || '').trim();
        if (!fromField || fromField === toField) return;
        edges.push({ from: fromField, to: toField, reason: 'dataSource.dependsOn' });
      });
    }
  });
  return edges;
};

export const buildCrossFieldEdges = (rules: FormCrossFieldRule[] | undefined) => {
  const edges: DependencyEdge[] = [];
  const list = Array.isArray(rules) ? rules : [];
  list.forEach((r, idx) => {
    const conds = Array.isArray(r?.when) ? (r.when as FormFieldCondition[]) : [];
    // This is a soft dependency: rule references fields. We don't model rule nodes here,
    // but we can still use field->field edges to catch obvious cycles with linkage deps.
    const fields = Array.from(new Set(conds.map((c: any) => String(c?.field || '').trim()).filter(Boolean)));
    for (let i = 0; i < fields.length; i += 1) {
      for (let j = 0; j < fields.length; j += 1) {
        if (i === j) continue;
        const from = fields[i] || '';
        const to = fields[j] || '';
        if (!from || !to) continue;
        edges.push({ from, to, reason: `crossFieldRules[${idx}]` });
      }
    }
  });
  return edges;
};

export const findCycles = (edges: Array<{ from: string; to: string }>) => {
  const graph = new Map<string, Set<string>>();
  edges.forEach((e) => {
    const from = String(e.from || '').trim();
    const to = String(e.to || '').trim();
    if (!from || !to) return;
    if (!graph.has(from)) graph.set(from, new Set());
    graph.get(from)!.add(to);
  });

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  const cycles: string[][] = [];

  const dfs = (node: string) => {
    if (visited.has(node)) return;
    if (visiting.has(node)) {
      const idx = stack.indexOf(node);
      if (idx >= 0) cycles.push([...stack.slice(idx), node]);
      return;
    }
    visiting.add(node);
    stack.push(node);
    const next = graph.get(node);
    if (next) next.forEach((n) => dfs(n));
    stack.pop();
    visiting.delete(node);
    visited.add(node);
  };

  Array.from(new Set([...graph.keys(), ...Array.from(graph.values()).flatMap((s) => Array.from(s))])).forEach(
    (n) => dfs(n)
  );

  const dedupCycleKey = (cycle: string[]) => {
    const nodes = cycle.slice(0, -1);
    const min = nodes.slice().sort()[0] || '';
    const rotated = (() => {
      const i = nodes.indexOf(min);
      if (i < 0) return nodes;
      return [...nodes.slice(i), ...nodes.slice(0, i)];
    })();
    return rotated.join('->');
  };

  const seen = new Set<string>();
  const out: string[][] = [];
  cycles.forEach((c) => {
    const key = dedupCycleKey(c);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(c);
  });
  return out;
};

