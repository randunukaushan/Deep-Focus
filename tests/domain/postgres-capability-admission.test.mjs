import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresCapabilityAdmission } = await import('../../supabase/functions/_shared/postgres-entitlement-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '66666666-6666-4666-8666-666666666666';
const NOW = '2026-10-10T12:00:00.000Z';

function harness(rows) {
  return {
    runner: {
      withTransaction: async (run) => run({ query: async (sql) => sql.includes('app_sessions')
        ? { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] }
        : { rows } }),
    },
  };
}

test('composed capability admission allows an active server entitlement', async () => {
  const h = harness([{ owner_id: OWNER, capability: 'ai', status: 'active', verified_by: 'server', policy_version: 'v2', expires_at: null, offer_id: null }]);
  assert.deepEqual(await createPostgresCapabilityAdmission(h).admit(OWNER, 'ai', NOW, SESSION), { allowed: true, ownerId: OWNER, capability: 'ai', policyVersion: 'v2' });
});

test('composed capability admission rejects an expired server entitlement', async () => {
  const h = harness([{ owner_id: OWNER, capability: 'cloud_resources', status: 'active', verified_by: 'server', policy_version: 'v2', expires_at: '2026-10-10T11:59:59.000Z', offer_id: null }]);
  assert.deepEqual(await createPostgresCapabilityAdmission(h).admit(OWNER, 'cloud_resources', NOW, SESSION), { allowed: false, reason: 'expired' });
});

test('composed capability admission rejects a malformed expiry without granting access', async () => {
  const h = harness([{ owner_id: OWNER, capability: 'ai', status: 'active', verified_by: 'server', policy_version: 'v2', expires_at: 'not-a-timestamp', offer_id: null }]);
  assert.deepEqual(await createPostgresCapabilityAdmission(h).admit(OWNER, 'ai', NOW, SESSION), { allowed: false, reason: 'expired' });
});

test('composed capability admission rejects a missing entitlement', async () => {
  const h = harness([]);
  assert.deepEqual(await createPostgresCapabilityAdmission(h).admit(OWNER, 'ai', NOW, SESSION), { allowed: false, reason: 'missing_entitlement' });
});

test('composed capability admission does not turn a foreign owner row into access', async () => {
  const FOREIGN = '22222222-2222-4222-8222-222222222222';
  const h = {
    runner: {
      withTransaction: async (run) => run({
        query: async (sql, params) => sql.includes('app_sessions')
          ? { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] }
          : ({
          rows: params[0] === FOREIGN && params[1] === 'ai'
            ? [{ owner_id: FOREIGN, capability: 'ai', status: 'active', verified_by: 'server', policy_version: 'v2', expires_at: null, offer_id: null }]
            : [],
        }),
      }),
    },
  };
  assert.deepEqual(await createPostgresCapabilityAdmission(h).admit(OWNER, 'ai', NOW, SESSION), { allowed: false, reason: 'missing_entitlement' });
});
