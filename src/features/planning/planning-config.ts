export const DEFAULT_PLANNING_MODEL = 'local-heuristic-v1';

/** Resolves a bounded model label; it never loads credentials or contacts a provider. */
export function resolvePlanningModel(value: unknown): string {
  if (value === undefined || value === null || value === '') return DEFAULT_PLANNING_MODEL;
  if (typeof value !== 'string') throw new RangeError('INVALID_PLANNING_MODEL');
  const model = value.trim();
  if (!model || model.length > 120 || /[\u0000-\u001f\u007f]/.test(model)) throw new RangeError('INVALID_PLANNING_MODEL');
  return model;
}

export function getConfiguredPlanningModel(): string {
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  return resolvePlanningModel(runtime.process?.env?.EXPO_PUBLIC_AI_MODEL);
}
