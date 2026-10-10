import type { AuthStatus } from './auth-context';

export type AuthRouteDecision = { blocked: boolean; redirect?: '/auth/sign-in' | '/auth/reset-password' | '/(tabs)/home' };

export function authRouteDecision(status: AuthStatus, segments: readonly string[]): AuthRouteDecision {
  const root = segments[0];
  const authRoute = root === 'auth';
  const publicRoute = authRoute || root === 'welcome';
  const resetRoute = authRoute && segments[1] === 'reset-password';

  if (status === 'initializing') return { blocked: true };
  if (status === 'recovering') return resetRoute ? { blocked: false } : { blocked: true, redirect: '/auth/reset-password' };
  if (status === 'signed_in') {
    return authRoute || root === 'welcome' || !root
      ? { blocked: !resetRoute, ...(!resetRoute ? { redirect: '/(tabs)/home' as const } : {}) }
      : { blocked: false };
  }
  return publicRoute ? { blocked: false } : { blocked: true, redirect: '/auth/sign-in' };
}
