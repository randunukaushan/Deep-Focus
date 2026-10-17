import type { AuthStatus } from './auth-context';
import type { OnboardingState } from '@/features/onboarding/onboarding-storage';

export type RecoveryState = 'none' | 'pending' | 'found' | 'error';
export type AuthRouteDecision = { blocked: boolean; redirect?: '/auth/sign-in' | '/auth/reset-password' | '/(tabs)/home' | '/onboarding' | '/onboarding/assessment' | '/onboarding/productivity-profile' };

export function authRouteDecision(status: AuthStatus, segments: readonly string[], onboarding: OnboardingState | null = { status: 'completed', step: 'intro', version: 1 }, recovery: RecoveryState = 'none'): AuthRouteDecision {
  const root = segments[0];
  const authRoute = root === 'auth';
  const publicRoute = authRoute || root === 'welcome';
  const resetRoute = authRoute && segments[1] === 'reset-password';

  if (status === 'initializing') return { blocked: true };
  if (status === 'recovering') return resetRoute ? { blocked: false } : { blocked: true, redirect: '/auth/reset-password' };
  if (status === 'signed_in') {
    if (recovery === 'pending' || recovery === 'found' || onboarding === null) return { blocked: true };
    if (onboarding.status === 'not_started') return onboardingRouteDecision(segments, '/onboarding');
    if (onboarding.status === 'in_progress') return onboardingRouteDecision(segments, onboarding.step === 'assessment' ? '/onboarding/assessment' : onboarding.step === 'profile' ? '/onboarding/productivity-profile' : '/onboarding');
    if (root === 'onboarding') return { blocked: true, redirect: '/(tabs)/home' };
    return authRoute || root === 'welcome' || !root
      ? { blocked: !resetRoute, ...(!resetRoute ? { redirect: '/(tabs)/home' as const } : {}) }
      : { blocked: false };
  }
  return publicRoute ? { blocked: false } : { blocked: true, redirect: '/auth/sign-in' };
}

function onboardingRouteDecision(segments: readonly string[], target: '/onboarding' | '/onboarding/assessment' | '/onboarding/productivity-profile'): AuthRouteDecision {
  const current = segments[0] === 'onboarding' ? `/onboarding/${segments[1] ?? ''}`.replace(/\/$/, '') : '';
  return current === target ? { blocked: false } : { blocked: true, redirect: target };
}
