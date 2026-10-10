import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresEntitlementReader } = await import('../../supabase/functions/_shared/postgres-entitlement-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '66666666-6666-4666-8666-666666666666';

function harness(rows) {
  const calls = [];
  return { calls, runner: { withTransaction: async (run) => run({ query: async (sql, params) => { calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params }); return sql.includes('app_sessions') ? { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] } : { rows }; } }) } };
}

function sessionHarness(rows) {
  const calls = [];
  return { calls, runner: { withTransaction: async (run) => run({ query: async (sql, params) => { calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params }); if (sql.includes('app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] }; return { rows }; } }) } };
}

test('entitlement reader returns only server-verified owner capability records', async () => {
  const h = harness([{ owner_id: OWNER, capability: 'ai', status: 'active', verified_by: 'server', policy_version: 'v1', expires_at: null, offer_id: null }]);
  const result = await createPostgresEntitlementReader({ runner: h.runner }).readEntitlement(OWNER, 'ai', SESSION);
  assert.deepEqual(result, { ownerId: OWNER, capability: 'ai', status: 'active', verifiedBy: 'server', policyVersion: 'v1', expiresAt: null, offerId: null });
  assert.deepEqual(h.calls.find((call) => call.sql.includes('server_entitlements')).params, [OWNER, 'ai']);
  assert.deepEqual(h.calls.find((call) => call.sql.includes('app_sessions')).params, [OWNER, SESSION]);
});

test('entitlement reader returns null for a missing capability without granting anything', async () => {
  const h = harness([]);
  assert.equal(await createPostgresEntitlementReader({ runner: h.runner }).readEntitlement(OWNER, 'cloud_resources', SESSION), null);
});

test('entitlement reader fails closed on a client-untrusted verification marker', async () => {
  const h = harness([{ owner_id: OWNER, capability: 'ai', status: 'active', verified_by: 'client', policy_version: 'v1', expires_at: null, offer_id: null }]);
  await assert.rejects(() => createPostgresEntitlementReader({ runner: h.runner }).readEntitlement(OWNER, 'ai', SESSION), /DEPENDENCY_UNAVAILABLE/);
});

test('entitlement reader fails closed when storage returns a foreign owner or capability row', async () => {
  const foreignOwner = '33333333-3333-4333-8333-333333333333';
  const h = harness([{ owner_id: foreignOwner, capability: 'cloud_resources', status: 'active', verified_by: 'server', policy_version: 'v1', expires_at: null, offer_id: null }]);
  await assert.rejects(() => createPostgresEntitlementReader({ runner: h.runner }).readEntitlement(OWNER, 'ai', SESSION), /DEPENDENCY_UNAVAILABLE/);
});

test('session-bound entitlement read rechecks the active session before capability data', async () => {
  const h = sessionHarness([{ owner_id: OWNER, capability: 'ai', status: 'active', verified_by: 'server', policy_version: 'v1', expires_at: null, offer_id: null }]);
  const result = await createPostgresEntitlementReader({ runner: h.runner }).readEntitlement(OWNER, 'ai', SESSION);
  assert.equal(result?.capability, 'ai');
  assert.equal(h.calls[0].sql.includes('app_sessions'), true);
});

test('revoked session blocks entitlement data access', async () => {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql) => { calls.push(sql); if (sql.includes('app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'revoked', revoked_at: '2026-10-10T00:00:00.000Z' }] }; throw new Error('capability query must not run'); } }) };
  await assert.rejects(() => createPostgresEntitlementReader({ runner }).readEntitlement(OWNER, 'ai', SESSION), /AUTH_REQUIRED/);
  assert.equal(calls.length, 1);
});
