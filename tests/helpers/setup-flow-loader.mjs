export async function resolve(specifier, context, nextResolve) {
  if (specifier === './setup-definition' && context.parentURL?.endsWith('/src/features/onboarding/setup-flow.ts')) {
    return nextResolve(new URL('../../src/features/onboarding/setup-definition.ts', import.meta.url).href, context);
  }
  return nextResolve(specifier, context);
}
