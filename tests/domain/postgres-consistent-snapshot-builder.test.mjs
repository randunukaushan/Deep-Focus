import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresConsistentSnapshotBuilder } = await import('../../supabase/functions/_shared/postgres-consistent-snapshot-builder.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const SNAPSHOT = '33333333-3333-4333-8333-333333333333';
const NOW = '2026-10-11T02:00:00.000Z';
const EXPIRES = '2026-10-11T03:00:00.000Z';
const DIGEST = 'a'.repeat(64);
const SECRET = 'snapshot-secret-that-is-long-enough-123456';

function harness() {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.startsWith('set transaction')) return { rows: [] };
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    if (sql.includes('insert into df_private.sync_snapshots')) return { rows: [] };
    if (sql.includes('from df_private.sync_snapshots')) return { rows: [{ owner_id: OWNER, snapshot_id: SNAPSHOT, contract_version: 1, high_water: '7', created_at: NOW, expires_at: EXPIRES, page_count: 1, manifest_digest: DIGEST, status: 'building' }] };
    if (sql.includes('insert into df_private.sync_snapshot_pages')) return { rows: [] };
    if (sql.includes('from df_private.sync_snapshot_pages')) return { rows: [{ owner_id: OWNER, snapshot_id: SNAPSHOT, page_index: 0, page_count: 1, high_water: '7', page_digest: DIGEST, payload: { data: [{ entity: 'task', entityId: '44444444-4444-4444-8444-444444444444', version: 1, operation: 'upsert', payload: { title: 'Read' } }] }, next_cursor: null }] };
    if (sql.includes('count(*)')) return { rows: [{ page_count: 1 }] };
    if (sql.startsWith('update df_private.sync_snapshots')) return { rows: [{ owner_id: OWNER, snapshot_id: SNAPSHOT, status: 'ready' }] };
    throw new Error(`unexpected query: ${sql}`);
  } };
  return { client, calls, runner: { withTransaction: async (run) => run(client) } };
}

test('consistent snapshot builder reads and stages through one repeatable-read transaction', async () => {
  const h = harness();
  const result = await createPostgresConsistentSnapshotBuilder({ runner: h.runner }).build({
    ownerId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, createdAt: NOW, expiresAt: EXPIRES, cursorSecret: SECRET,
    readSource: async (client, ownerId) => { assert.equal(client, h.client); assert.equal(ownerId, OWNER); return { highWater: '7', records: [{ entity: 'task', entityId: '44444444-4444-4444-8444-444444444444', version: 1, operation: 'upsert', payload: { title: 'Read' } }] }; },
    digestPage: async () => DIGEST,
    digestManifest: async () => DIGEST,
  });
  assert.deepEqual(result, { snapshotId: SNAPSHOT, status: 'ready', pageCount: 1 });
  assert.equal(h.calls[0].sql, 'set transaction isolation level repeatable read');
  assert.equal(h.calls.filter((call) => call.sql.includes('from df_private.app_sessions')).length, 2);
  assert.equal(h.calls.some((call) => call.sql.includes('insert into df_private.sync_snapshot_pages')), true);
});

test('consistent snapshot builder rejects unsafe input before opening a transaction', async () => {
  let transactions = 0;
  const builder = createPostgresConsistentSnapshotBuilder({ runner: { withTransaction: async () => { transactions += 1; throw new Error('must not run'); } } });
  await assert.rejects(() => builder.build({ ownerId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, createdAt: NOW, expiresAt: NOW, cursorSecret: SECRET, readSource: async () => ({ highWater: '0', records: [] }), digestPage: async () => DIGEST, digestManifest: async () => DIGEST }), /VALIDATION_FAILED/);
  assert.equal(transactions, 0);
});

test('consistent snapshot builder rejects an invalid transaction runner at construction', () => {
  assert.throws(() => createPostgresConsistentSnapshotBuilder({ runner: null }), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresConsistentSnapshotBuilder({ runner: { withTransaction: 'not-callable' } }), /VALIDATION_FAILED/);
});

test('consistent snapshot builder stops before staging when source read fails', async () => {
  const h = harness();
  await assert.rejects(() => createPostgresConsistentSnapshotBuilder({ runner: h.runner }).build({
    ownerId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, createdAt: NOW, expiresAt: EXPIRES, cursorSecret: SECRET,
    readSource: async () => { throw new Error('source unavailable'); }, digestPage: async () => DIGEST, digestManifest: async () => DIGEST,
  }), /source unavailable/);
  assert.equal(h.calls.some((call) => call.sql.includes('insert into df_private.sync_snapshots')), false);
});

test('consistent snapshot builder rejects unsafe identity, clock and source high-water types', async () => {
  const h = harness();
  const base = {
    ownerId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, createdAt: NOW, expiresAt: EXPIRES, cursorSecret: SECRET,
    readSource: async () => ({ highWater: '7', records: [] }), digestPage: async () => DIGEST, digestManifest: async () => DIGEST,
  };
  const builder = createPostgresConsistentSnapshotBuilder({ runner: h.runner });
  await assert.rejects(() => builder.build({ ...base, ownerId: Symbol('owner') }), /VALIDATION_FAILED/);
  await assert.rejects(() => builder.build({ ...base, createdAt: Symbol('clock') }), /VALIDATION_FAILED/);
  await assert.rejects(() => builder.build({ ...base, readSource: async () => ({ highWater: Symbol('high-water'), records: [] }) }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(h.calls.filter((call) => call.sql === 'set transaction isolation level repeatable read').length, 1);
});
