import assert from 'node:assert/strict';
import test from 'node:test';

import { authRouteDecision } from '../../src/features/auth/auth-routing.ts';

test('initial session restoration never renders a protected route', () => {
  assert.deepEqual(authRouteDecision('initializing', ['(tabs)', 'home']), { blocked: true });
  assert.deepEqual(authRouteDecision('initializing', ['auth', 'sign-in']), { blocked: true });
});

test('signed-out, unverified and configuration-error states allow only public entry routes', () => {
  for (const status of ['signed_out', 'verification_required', 'configuration_error', 'error']) {
    assert.deepEqual(authRouteDecision(status, ['(tabs)', 'home']), { blocked: true, redirect: '/auth/sign-up' });
    assert.deepEqual(authRouteDecision(status, ['auth', 'sign-up']), { blocked: false });
    assert.deepEqual(authRouteDecision(status, ['welcome']), { blocked: false });
  }
});

test('signed-in state enters the app, redirects public entry, and recovery stays isolated', () => {
  assert.deepEqual(authRouteDecision('signed_in', ['(tabs)', 'home']), { blocked: false });
  assert.deepEqual(authRouteDecision('signed_in', ['welcome']), { blocked: true, redirect: '/(tabs)/home' });
  assert.deepEqual(authRouteDecision('recovering', ['auth', 'reset-password']), { blocked: false });
  assert.deepEqual(authRouteDecision('recovering', ['(tabs)', 'home']), { blocked: true, redirect: '/auth/reset-password' });
});

test('signed-in onboarding states route to intro, resumable step, or Home', () => {
  assert.deepEqual(authRouteDecision('signed_in', ['(tabs)', 'home'], { status: 'not_started', step: 'intro', version: 1 }), { blocked: true, redirect: '/onboarding' });
  assert.deepEqual(authRouteDecision('signed_in', ['onboarding'], { status: 'in_progress', step: 'assessment', version: 1 }), { blocked: true, redirect: '/onboarding/assessment' });
  assert.deepEqual(authRouteDecision('signed_in', ['onboarding', 'productivity-profile'], { status: 'in_progress', step: 'profile', version: 1 }), { blocked: false });
  assert.deepEqual(authRouteDecision('signed_in', ['onboarding'], { status: 'completed', step: 'intro', version: 1 }), { blocked: true, redirect: '/(tabs)/home' });
  assert.deepEqual(authRouteDecision('signed_in', ['(tabs)', 'home'], { status: 'skipped', step: 'intro', version: 1 }), { blocked: false });
});

test('active-session recovery has priority over incomplete onboarding', () => {
  const onboarding = { status: 'not_started', step: 'intro', version: 1 };
  assert.deepEqual(authRouteDecision('signed_in', ['(tabs)', 'home'], onboarding, 'pending'), { blocked: true });
  assert.deepEqual(authRouteDecision('signed_in', ['(tabs)', 'home'], onboarding, 'found'), { blocked: true });
});
