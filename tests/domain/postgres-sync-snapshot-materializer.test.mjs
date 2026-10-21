import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresSyncSnapshotMaterializer } = await import('../../supabase/functions/_shared/postgres-sync-snapshot-materializer.ts');
const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const JOB = '33333333-3333-4333-8333-333333333333';
const SNAPSHOT = '44444444-4444-4444-8444-444444444444';
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
    if (sql.includes('from df_private.sync_heads')) return { rows: [{ last_sequence: '4' }] };
    if (sql.includes('insert into df_private.sync_snapshots')) return { rows: [] };
    if (sql.includes('from df_private.sync_snapshots')) return { rows: [{ owner_id: OWNER, snapshot_id: SNAPSHOT, contract_version: 1, high_water: '4', created_at: NOW, expires_at: EXPIRES, page_count: 1, manifest_digest: DIGEST, status: 'building' }] };
    if (sql.includes('from df_private.sync_snapshot_pages')) return { rows: [{ owner_id: OWNER, snapshot_id: SNAPSHOT, page_index: 0, page_count: 1, high_water: '4', page_digest: DIGEST, payload: { data: [] }, next_cursor: null }] };
    if (sql.includes('count(*)')) return { rows: [{ page_count: 1 }] };
    if (sql.startsWith('update df_private.sync_snapshots')) return { rows: [{ owner_id: OWNER, snapshot_id: SNAPSHOT, status: 'ready' }] };
    if (sql.includes('from df_private.')) return { rows: [] };
    return { rows: [] };
  } };
  return { calls, runner: { withTransaction: async (run) => run(client) } };
}

test('materializer binds scheduler session and uses the owner-bound reader in one transaction', async () => {
  const h = harness();
  const materialize = createPostgresSyncSnapshotMaterializer({ runner: h.runner, sessionId: SESSION, createdAt: NOW, expiresAt: EXPIRES, cursorSecret: SECRET, digestPage: async () => DIGEST, digestManifest: async () => DIGEST });
  await materialize({ ownerId: OWNER, jobId: JOB, snapshotId: SNAPSHOT });
  assert.equal(h.calls[0].sql, 'set transaction isolation level repeatable read');
  assert.equal(h.calls.some((call) => call.sql.includes('from df_private.sync_heads') && call.params[0] === OWNER), true);
  assert.equal(h.calls.some((call) => call.sql.includes('from df_private.app_sessions') && call.params[1] === SESSION), true);
});

test('materializer rejects a forged identity before opening a transaction', async () => {
  const h = harness();
  const materialize = createPostgresSyncSnapshotMaterializer({ runner: h.runner, sessionId: SESSION, createdAt: NOW, expiresAt: EXPIRES, cursorSecret: SECRET, digestPage: async () => DIGEST, digestManifest: async () => DIGEST });
  await assert.rejects(() => materialize({ ownerId: 'not-owner', jobId: JOB, snapshotId: SNAPSHOT }), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('materializer rejects unsafe scheduler and job runtime types before opening a transaction', async () => {
  const h = harness();
  const base = { runner: h.runner, sessionId: SESSION, createdAt: NOW, expiresAt: EXPIRES, cursorSecret: SECRET, digestPage: async () => DIGEST, digestManifest: async () => DIGEST };
  assert.throws(() => createPostgresSyncSnapshotMaterializer({ ...base, sessionId: Symbol('session') }), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresSyncSnapshotMaterializer({ ...base, createdAt: Symbol('clock') }), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresSyncSnapshotMaterializer({ ...base, cursorSecret: Symbol('secret') }), /VALIDATION_FAILED/);
  const materialize = createPostgresSyncSnapshotMaterializer(base);
  await assert.rejects(() => materialize({ ownerId: Symbol('owner'), jobId: JOB, snapshotId: SNAPSHOT }), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('materializer rejects malformed dependencies at construction', () => {
  const base = { sessionId: SESSION, createdAt: NOW, expiresAt: EXPIRES, cursorSecret: SECRET, digestPage: async () => DIGEST, digestManifest: async () => DIGEST };
  assert.throws(() => createPostgresSyncSnapshotMaterializer({ ...base, runner: null }), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresSyncSnapshotMaterializer({ ...base, runner: { withTransaction: 'not-callable' } }), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresSyncSnapshotMaterializer({ ...base, runner: harness().runner, digestPage: null }), /VALIDATION_FAILED/);
});
