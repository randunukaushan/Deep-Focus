import assert from 'node:assert/strict';
import test from 'node:test';

const { requireRecentAuthentication } = await import('../../supabase/functions/_shared/recent-auth-policy.ts');

const NOW = '2026-10-11T02:00:00.000Z';

test('recent-auth policy accepts authentication inside the caller-supplied age window', () => {
  assert.doesNotThrow(() => requireRecentAuthentication({ authenticatedAt: '2026-10-11T01:59:00.000Z', now: NOW, maxAgeMs: 120000 }));
  assert.doesNotThrow(() => requireRecentAuthentication({ authenticatedAt: NOW, now: NOW, maxAgeMs: 1 }));
});

test('recent-auth policy rejects stale, future or malformed evidence', () => {
  for (const authenticatedAt of ['2026-10-11T01:57:59.999Z', '2026-10-11T02:00:00.001Z', 'bad']) {
    assert.throws(() => requireRecentAuthentication({ authenticatedAt, now: NOW, maxAgeMs: 120000 }), /AUTH_REQUIRED/);
  }
});

test('recent-auth policy rejects unsafe policy configuration', () => {
  assert.throws(() => requireRecentAuthentication({ authenticatedAt: NOW, now: NOW, maxAgeMs: 0 }), /AUTH_REQUIRED/);
  assert.throws(() => requireRecentAuthentication({ authenticatedAt: NOW, now: NOW, maxAgeMs: 86_400_001 }), /AUTH_REQUIRED/);
});
