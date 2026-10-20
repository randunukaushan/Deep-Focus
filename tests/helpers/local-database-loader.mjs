const modules = {
  'expo-sqlite': 'export const openDatabaseAsync = async () => { throw new Error("TEST_DATABASE_REQUIRED") }',
  'expo-file-system/legacy': 'export const documentDirectory = null; export const getInfoAsync = async () => ({ exists: false }); export const readAsStringAsync = async () => ""',
  'react-native': 'export const Platform = { OS: "test" }',
  'expo-crypto': 'export const CryptoDigestAlgorithm = { SHA256: "SHA-256" }; export const digestStringAsync = async (_algorithm, value) => "a".repeat(64);',
};

export async function resolve(specifier, context, nextResolve) {
  if (specifier === '@/features/onboarding/setup-definition') {
    return nextResolve(new URL('../../src/features/onboarding/setup-definition.ts', import.meta.url).href, context);
  }
  if (specifier === '@/features/settings/presentation-preferences') {
    return nextResolve(new URL('../../src/features/settings/presentation-preferences.ts', import.meta.url).href, context);
  }
  if (specifier === '@/features/tasks/task-planning') {
    return nextResolve(new URL('../../src/features/tasks/task-planning.ts', import.meta.url).href, context);
  }
  if (Object.hasOwn(modules, specifier)) {
    return { url: `data:text/javascript,${encodeURIComponent(modules[specifier])}`, shortCircuit: true };
  }
  if (specifier === '@/features/focus/session-engine') {
    return nextResolve(new URL('../../src/features/focus/session-engine.ts', import.meta.url).href, context);
  }
  if (specifier === '@/features/focus/completion-processing') {
    return nextResolve(new URL('../../src/features/focus/completion-processing.ts', import.meta.url).href, context);
  }
  if (specifier === '@/features/goals/goal-progress') {
    return nextResolve(new URL('../../src/features/goals/goal-progress.ts', import.meta.url).href, context);
  }
  if (specifier === '@/features/resources/resource-types') {
    return nextResolve(new URL('../../src/features/resources/resource-types.ts', import.meta.url).href, context);
  }
  if (specifier === '@/features/education/teacher-assignment-draft') {
    return nextResolve(new URL('../../src/features/education/teacher-assignment-draft.ts', import.meta.url).href, context);
  }
  if (specifier === '@/features/progress/progression-rules') {
    return nextResolve(new URL('../../src/features/progress/progression-rules.ts', import.meta.url).href, context);
  }
  if (specifier === '@/features/progress/streak') {
    return nextResolve(new URL('../../src/features/progress/streak.ts', import.meta.url).href, context);
  }
  if (specifier === '@/features/monetization/entitlement-policy') {
    return nextResolve(new URL('../../src/features/monetization/entitlement-policy.ts', import.meta.url).href, context);
  }
  if (specifier === './local-owner' && context.parentURL?.endsWith('/src/features/storage/local-database.ts')) {
    return nextResolve(new URL('../../src/features/storage/local-owner.ts', import.meta.url).href, context);
  }
  return nextResolve(specifier, context);
}
