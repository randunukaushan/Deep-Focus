import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresSnapshotReadHandlers } = await import('../../supabase/functions/_shared/postgres-snapshot-read-handlers.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '66666666-6666-4666-8666-666666666666';
const SNAPSHOT = '22222222-2222-4222-8222-222222222222';
const ENTITY = '33333333-3333-4333-8333-333333333333';
const NOW = '2026-10-10T12:00:00.000Z';
const DIGEST = 'a'.repeat(64);
const metadata = { owner_id: OWNER, snapshot_id: SNAPSHOT, contract_version: 1, high_water: '12', created_at: '2026-10-10 00:00:00+00', expires_at: '2026-10-11 00:00:00+00', page_count: 1, manifest_digest: DIGEST, status: 'ready' };
const page = { owner_id: OWNER, snapshot_id: SNAPSHOT, page_index: 0, page_count: 1, high_water: 12, snapshot_owner_id: OWNER, snapshot_record_id: SNAPSHOT, snapshot_page_count: 1, snapshot_high_water: '12', page_digest: DIGEST, payload: { data: [{ entity: 'task', entityId: ENTITY, version: 1, operation: 'upsert', payload: { title: 'Read' } }] }, next_cursor: null };

function harness(rows = { metadata: [metadata], page: [page] }) {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    if (sql.includes('from df_private.sync_snapshot_pages')) return { rows: rows.page };
    return { rows: rows.metadata };
  } }) };
  return { runner, calls };
}

test('read handlers return only owner-bound metadata and page DTOs', async () => {
  const h = harness();
  const handlers = createPostgresSnapshotReadHandlers(h);
  const metadataResult = await handlers.readMetadata({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, now: NOW });
  assert.equal(metadataResult.status, 200);
  assert.equal(metadataResult.body.data.snapshot.highWater, '12');
  const pageResult = await handlers.readPage({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, pageIndex: 0, now: NOW });
  assert.equal(pageResult.status, 200);
  assert.equal(pageResult.body.data.page.data[0].entity, 'task');
  assert.deepEqual(h.calls[1].params, [OWNER, SNAPSHOT, NOW]);
});

test('missing metadata and pages become privacy-preserving not-found results', async () => {
  const handlers = createPostgresSnapshotReadHandlers(harness({ metadata: [], page: [] }));
  await assert.rejects(() => handlers.readMetadata({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, now: NOW }), /NOT_FOUND/);
  await assert.rejects(() => handlers.readPage({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, pageIndex: 0, now: NOW }), /NOT_FOUND/);
});

test('malformed actor, snapshot, page index and time are rejected before storage', async () => {
  const h = harness();
  const handlers = createPostgresSnapshotReadHandlers(h);
  await assert.rejects(() => handlers.readMetadata({ actorId: 'bad', sessionId: SESSION, snapshotId: SNAPSHOT, now: NOW }), /VALIDATION_FAILED/);
  await assert.rejects(() => handlers.readPage({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, pageIndex: -1, now: NOW }), /VALIDATION_FAILED/);
  await assert.rejects(() => handlers.readPage({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, pageIndex: 0, now: 'bad-time' }), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('handler does not allow a client-supplied owner to replace the verified actor', async () => {
  const h = harness();
  const handlers = createPostgresSnapshotReadHandlers(h);
  await handlers.readMetadata({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, now: NOW });
  assert.deepEqual(h.calls[1].params, [OWNER, SNAPSHOT, NOW]);
  assert.equal(h.calls[0].params.includes('foreign-owner'), false);
});

test('read handlers fail closed when returned snapshot metadata belongs to another owner', async () => {
  const h = harness({ metadata: [{ ...metadata, owner_id: '44444444-4444-4444-8444-444444444444' }], page: [page] });
  const handlers = createPostgresSnapshotReadHandlers(h);
  await assert.rejects(() => handlers.readMetadata({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
});

test('revoked session fails before snapshot metadata or page access', async () => {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql, params });
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'revoked', revoked_at: NOW }] };
    throw new Error('snapshot query must not run');
  } }) };
  const handlers = createPostgresSnapshotReadHandlers({ runner });
  await assert.rejects(() => handlers.readMetadata({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, now: NOW }), /AUTH_REQUIRED/);
  await assert.rejects(() => handlers.readPage({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, pageIndex: 0, now: NOW }), /AUTH_REQUIRED/);
  assert.equal(calls.filter((call) => call.sql.includes('sync_snapshot')).length, 0);
});
