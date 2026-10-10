import assert from 'node:assert/strict';
import test from 'node:test';

import { authRouteDecision } from '../../src/features/auth/auth-routing.ts';

test('initial session restoration never renders a protected route', () => {
  assert.deepEqual(authRouteDecision('initializing', ['(tabs)', 'home']), { blocked: true });
  assert.deepEqual(authRouteDecision('initializing', ['auth', 'sign-in']), { blocked: true });
});

test('signed-out, unverified and configuration-error states allow only public entry routes', () => {
  for (const status of ['signed_out', 'verification_required', 'configuration_error', 'error']) {
    assert.deepEqual(authRouteDecision(status, ['(tabs)', 'home']), { blocked: true, redirect: '/auth/sign-in' });
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
