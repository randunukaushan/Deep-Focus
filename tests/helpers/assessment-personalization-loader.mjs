export async function resolve(specifier, context, nextResolve) {
  if (specifier === './assessment-definition' && context.parentURL?.endsWith('/src/features/assessment/assessment-personalization.ts')) {
    return nextResolve(new URL('../../src/features/assessment/assessment-definition.ts', import.meta.url).href, context);
  }
  return nextResolve(specifier, context);
}
