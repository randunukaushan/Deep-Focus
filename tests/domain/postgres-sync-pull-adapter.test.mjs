import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresSyncPullStore } = await import('../../supabase/functions/_shared/postgres-sync-pull-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const TASK = '22222222-2222-4222-8222-222222222222';
const SESSION = '66666666-6666-4666-8666-666666666666';

function harness(rows, highWater = '9') {
  const calls = [];
  return {
    calls,
    runner: { withTransaction: async (run) => run({ query: async (sql, params) => { calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params }); if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] }; return { rows: sql.includes('max(sequence)') ? [{ high_water: highWater }] : rows }; } }) },
  };
}

test('sync pull adapter binds owner and reads a bounded ordered page', async () => {
  const h = harness([{ owner_id: OWNER, sequence: '3', entity_kind: 'task', entity_id: TASK, operation: 'upsert', payload: { id: TASK, title: 'Read' } }]);
  const store = createPostgresSyncPullStore({ runner: h.runner, sessionId: SESSION });
  const page = await store.readPage({ ownerId: OWNER, after: '2', highWater: null, limit: 20 });
  assert.deepEqual(page, { highWater: '9', changes: [{ sequence: '3', entityKind: 'task', entityId: TASK, operation: 'upsert', payload: { id: TASK, title: 'Read' } }] });
  assert.deepEqual(h.calls[0].params, [OWNER, SESSION]);
  assert.deepEqual(h.calls[1].params, [OWNER]);
  assert.deepEqual(h.calls[2].params, [OWNER, '2', '9', 20]);
  assert.match(h.calls[2].sql, /sequence <= \$3::bigint/);
});

test('sync pull adapter preserves signed high-water bound on cursor continuation', async () => {
  const h = harness([{ owner_id: OWNER, sequence: '8', entity_kind: 'profile', entity_id: OWNER, operation: 'upsert', payload: { id: OWNER } }]);
  const store = createPostgresSyncPullStore({ runner: h.runner, sessionId: SESSION });
  await store.readPage({ ownerId: OWNER, after: '7', highWater: '8', limit: 100 });
  assert.equal(h.calls.length, 2);
  assert.deepEqual(h.calls[0].params, [OWNER, SESSION]);
  assert.deepEqual(h.calls[1].params, [OWNER, '7', '8', 100]);
});

test('sync pull adapter fails closed on malformed stored change rows', async () => {
  const h = harness([{ owner_id: OWNER, sequence: '1', entity_kind: 'task', entity_id: TASK, operation: 'upsert', payload: null }]);
  const store = createPostgresSyncPullStore({ runner: h.runner, sessionId: SESSION });
  await assert.rejects(() => store.readPage({ ownerId: OWNER, after: '0', highWater: '1', limit: 10 }), /DEPENDENCY_UNAVAILABLE/);
});

test('sync pull adapter maps the private legacy focus_session kind to canonical session', async () => {
  const h = harness([{ owner_id: OWNER, sequence: '4', entity_kind: 'focus_session', entity_id: TASK, operation: 'upsert', payload: { id: TASK, status: 'active' } }]);
  const page = await createPostgresSyncPullStore({ runner: h.runner, sessionId: SESSION }).readPage({ ownerId: OWNER, after: '3', highWater: '4', limit: 10 });
  assert.equal(page.changes[0].entityKind, 'session');
});

test('sync pull adapter fails closed on a returned change from another owner', async () => {
  const h = harness([{ owner_id: '33333333-3333-4333-8333-333333333333', sequence: '1', entity_kind: 'task', entity_id: TASK, operation: 'upsert', payload: { id: TASK } }]);
  await assert.rejects(() => createPostgresSyncPullStore({ runner: h.runner, sessionId: SESSION }).readPage({ ownerId: OWNER, after: '0', highWater: '1', limit: 10 }), /DEPENDENCY_UNAVAILABLE/);
});

test('sync pull adapter rejects a missing session before sync data access', async () => {
  const h = harness([]);
  await assert.rejects(() => createPostgresSyncPullStore({ runner: h.runner, sessionId: undefined }).readPage({ ownerId: OWNER, after: '0', highWater: '0', limit: 10 }), /VALIDATION_FAILED/);
  assert.equal(h.calls.some((call) => call.sql.includes('sync_changes')), false);
});
