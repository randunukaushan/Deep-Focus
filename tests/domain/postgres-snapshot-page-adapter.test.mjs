import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresSnapshotPageReader } = await import('../../supabase/functions/_shared/postgres-snapshot-page-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SNAPSHOT = '22222222-2222-4222-8222-222222222222';
const SESSION = '66666666-6666-4666-8666-666666666666';
const NOW = '2026-10-10T00:00:00.000Z';
const DIGEST = 'a'.repeat(64);

function harness(row, match = true) {
  const calls = [];
  return { calls, runner: { withTransaction: async (run) => run({ query: async (sql, params) => { calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params }); if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] }; return { rows: match && row ? [row] : [] }; } }) } };
}

const row = { owner_id: OWNER, snapshot_id: SNAPSHOT, page_index: 0, page_count: 1, high_water: 12, snapshot_owner_id: OWNER, snapshot_record_id: SNAPSHOT, snapshot_page_count: 1, snapshot_high_water: '12', page_digest: DIGEST, payload: { data: [{ entity: 'task', entityId: '33333333-3333-4333-8333-333333333333', version: 1, operation: 'upsert', payload: { title: 'Read' } }] }, next_cursor: null };

test('snapshot page reader returns only a ready-page shaped result from the owner-bound query', async () => {
  const h = harness(row);
  const result = await createPostgresSnapshotPageReader({ runner: h.runner }).readPage({ ownerId: OWNER, snapshotId: SNAPSHOT, pageIndex: 0, now: NOW, sessionId: SESSION });
  assert.deepEqual(result, { snapshotId: SNAPSHOT, pageIndex: 0, pageCount: 1, highWater: '12', data: row.payload.data, pageDigest: DIGEST, nextCursor: null });
  assert.deepEqual(h.calls[0].params, [OWNER, SESSION]);
  assert.deepEqual(h.calls[1].params, [OWNER, SNAPSHOT, 0, NOW]);
  assert.match(h.calls[1].sql, /s\.status = 'ready'/);
  assert.match(h.calls[1].sql, /s\.expires_at > \$4::timestamptz/);
});

test('snapshot page reader returns null for a missing, expired or foreign page', async () => {
  const h = harness(row, false);
  assert.equal(await createPostgresSnapshotPageReader({ runner: h.runner }).readPage({ ownerId: OWNER, snapshotId: SNAPSHOT, pageIndex: 0, now: NOW, sessionId: SESSION }), null);
});

test('snapshot page reader fails closed on malformed stored page data', async () => {
  const h = harness({ ...row, page_digest: 'bad' });
  await assert.rejects(() => createPostgresSnapshotPageReader({ runner: h.runner }).readPage({ ownerId: OWNER, snapshotId: SNAPSHOT, pageIndex: 0, now: NOW, sessionId: SESSION }), /DEPENDENCY_UNAVAILABLE/);
});

test('snapshot page reader fails closed on an invalid entity payload', async () => {
  const h = harness({ ...row, payload: { data: [{ entity: 'task', entityId: 'not-an-id', version: 1, operation: 'upsert', payload: {} }] } });
  await assert.rejects(() => createPostgresSnapshotPageReader({ runner: h.runner }).readPage({ ownerId: OWNER, snapshotId: SNAPSHOT, pageIndex: 0, now: NOW, sessionId: SESSION }), /DEPENDENCY_UNAVAILABLE/);
});

test('snapshot page reader accepts PostgreSQL bigint text and preserves it as a decimal string', async () => {
  const h = harness({ ...row, high_water: '9007199254740993', snapshot_high_water: '9007199254740993' });
  const result = await createPostgresSnapshotPageReader({ runner: h.runner }).readPage({ ownerId: OWNER, snapshotId: SNAPSHOT, pageIndex: 0, now: NOW, sessionId: SESSION });
  assert.equal(result.highWater, '9007199254740993');
});

test('snapshot page reader rejects a page index outside the stored page count', async () => {
  const h = harness({ ...row, page_index: 2, page_count: 2 });
  await assert.rejects(() => createPostgresSnapshotPageReader({ runner: h.runner }).readPage({ ownerId: OWNER, snapshotId: SNAPSHOT, pageIndex: 2, now: NOW, sessionId: SESSION }), /DEPENDENCY_UNAVAILABLE/);
});

test('snapshot page reader rejects page metadata that disagrees with the snapshot record', async () => {
  const h = harness({ ...row, snapshot_high_water: '13' });
  await assert.rejects(() => createPostgresSnapshotPageReader({ runner: h.runner }).readPage({ ownerId: OWNER, snapshotId: SNAPSHOT, pageIndex: 0, now: NOW, sessionId: SESSION }), /DEPENDENCY_UNAVAILABLE/);
});

test('snapshot page reader fails closed when returned ownership metadata disagrees with the request', async () => {
  const h = harness({ ...row, owner_id: '44444444-4444-4444-8444-444444444444' });
  await assert.rejects(() => createPostgresSnapshotPageReader({ runner: h.runner }).readPage({ ownerId: OWNER, snapshotId: SNAPSHOT, pageIndex: 0, now: NOW, sessionId: SESSION }), /DEPENDENCY_UNAVAILABLE/);
});

test('snapshot page reader rejects a missing session before page data access', async () => {
  const h = harness(row);
  await assert.rejects(() => createPostgresSnapshotPageReader({ runner: h.runner }).readPage({ ownerId: OWNER, snapshotId: SNAPSHOT, pageIndex: 0, now: NOW, sessionId: undefined }), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});
