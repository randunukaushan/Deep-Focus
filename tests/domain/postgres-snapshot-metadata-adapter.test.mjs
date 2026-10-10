import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresSnapshotMetadataReader } = await import('../../supabase/functions/_shared/postgres-snapshot-metadata-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SNAPSHOT = '22222222-2222-4222-8222-222222222222';
const SESSION = '66666666-6666-4666-8666-666666666666';
const NOW = '2026-10-10T12:00:00.000Z';
const ROW = { owner_id: OWNER, snapshot_id: SNAPSHOT, contract_version: 1, high_water: '9007199254740993',
  created_at: '2026-10-10 00:00:00+00', expires_at: '2026-10-11 00:00:00+00', page_count: 2,
  manifest_digest: 'a'.repeat(64), status: 'ready' };

function harness(rows = [ROW]) {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    return { rows };
  } }) };
  return { runner, calls };
}

test('metadata reader returns only a bounded owner-scoped ready snapshot', async () => {
  const h = harness();
  assert.deepEqual(await createPostgresSnapshotMetadataReader(h).read({ ownerId: OWNER, snapshotId: SNAPSHOT, now: NOW, sessionId: SESSION }), {
    snapshotId: SNAPSHOT, contractVersion: 1, highWater: '9007199254740993',
    createdAt: '2026-10-10T00:00:00.000Z', expiresAt: '2026-10-11T00:00:00.000Z',
    pageCount: 2, manifestDigest: 'a'.repeat(64), status: 'ready',
  });
  assert.ok(h.calls[1].sql.includes('where owner_id = $1 and snapshot_id = $2 and status = \'ready\''));
  assert.deepEqual(h.calls[0].params, [OWNER, SESSION]);
  assert.deepEqual(h.calls[1].params, [OWNER, SNAPSHOT, NOW]);
});

test('missing, expired or foreign metadata is treated as absent', async () => {
  assert.equal(await createPostgresSnapshotMetadataReader(harness([])).read({ ownerId: OWNER, snapshotId: SNAPSHOT, now: NOW, sessionId: SESSION }), null);
});

test('malformed metadata fails closed instead of becoming a successful status', async () => {
  await assert.rejects(() => createPostgresSnapshotMetadataReader(harness([{ ...ROW, manifest_digest: 'bad' }])).read({ ownerId: OWNER, snapshotId: SNAPSHOT, now: NOW, sessionId: SESSION }), /DEPENDENCY_UNAVAILABLE/);
});

test('metadata reader preserves PostgreSQL bigint text without Number coercion', async () => {
  const result = await createPostgresSnapshotMetadataReader(harness()).read({ ownerId: OWNER, snapshotId: SNAPSHOT, now: NOW, sessionId: SESSION });
  assert.equal(result.highWater, '9007199254740993');
});

test('invalid owner or snapshot input is rejected before the database call', async () => {
  const h = harness();
  await assert.rejects(() => createPostgresSnapshotMetadataReader(h).read({ ownerId: 'not-owner', snapshotId: SNAPSHOT, now: NOW, sessionId: SESSION }), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('metadata reader rejects a missing session before snapshot data access', async () => {
  const h = harness();
  await assert.rejects(() => createPostgresSnapshotMetadataReader(h).read({ ownerId: OWNER, snapshotId: SNAPSHOT, now: NOW, sessionId: undefined }), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});
