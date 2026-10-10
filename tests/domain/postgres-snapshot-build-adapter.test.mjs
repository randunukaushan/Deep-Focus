import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresSnapshotBuilder } = await import('../../supabase/functions/_shared/postgres-snapshot-build-adapter.ts');
const { verifySnapshotPageCursor } = await import('../../supabase/functions/_shared/snapshot-page-cursor.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '66666666-6666-4666-8666-666666666666';
const SNAPSHOT = '22222222-2222-4222-8222-222222222222';
const ENTITY_A = '33333333-3333-4333-8333-333333333333';
const SECRET = 'secret-for-snapshot-build-adapter-0123456789';
const CREATED = '2026-10-10T00:00:00.000Z';
const EXPIRES = '2026-10-11T00:00:00.000Z';
const DIGEST = 'a'.repeat(64);
const MANIFEST = 'b'.repeat(64);

function entity(entityId) { return { entity: 'task', entityId, version: 1, operation: 'upsert', payload: { title: entityId } }; }

function runnerHarness() {
  const calls = [];
  const state = { metadata: { owner_id: OWNER, snapshot_id: SNAPSHOT, contract_version: 1, high_water: '12', created_at: CREATED,
    expires_at: EXPIRES, page_count: 1, manifest_digest: MANIFEST, status: 'building' }, pages: [] };
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    if (sql.includes('insert into df_private.sync_snapshots')) return { rows: [] };
    if (sql.includes('from df_private.sync_snapshots') && !sql.includes('sync_snapshot_pages')) return { rows: [state.metadata] };
    if (sql.includes('insert into df_private.sync_snapshot_pages')) { state.pages.push({ owner_id: OWNER, snapshot_id: SNAPSHOT, page_index: params[2], page_count: params[3], high_water: params[4], page_digest: params[5], next_cursor: params[7], payload: JSON.parse(params[6]) }); return { rows: [] }; }
    if (sql.includes('page_index') && sql.includes('from df_private.sync_snapshot_pages')) return { rows: state.pages.filter((row) => row.page_index === params[2]) };
    if (sql.includes('count(*)')) return { rows: [{ page_count: state.pages.length }] };
    if (sql.includes('update df_private.sync_snapshots')) return { rows: [{ owner_id: OWNER, snapshot_id: SNAPSHOT, status: 'ready' }] };
    return { rows: [] };
  } }) };
  return { runner, calls, state };
}

function input(overrides = {}) {
  return { ownerId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, highWater: '12', records: [entity(ENTITY_A)], contractVersion: 1,
    createdAt: CREATED, expiresAt: EXPIRES, secret: SECRET, digestPage: async () => DIGEST,
    digestManifest: async () => MANIFEST, ...overrides };
}

test('builder materializes records and stages the resulting ready snapshot', async () => {
  const h = runnerHarness();
  const result = await createPostgresSnapshotBuilder(h).build(input());
  assert.deepEqual(result, { snapshotId: SNAPSHOT, status: 'ready', pageCount: 1 });
  assert.equal(h.state.pages.length, 1);
  assert.equal(h.state.pages[0].next_cursor, null);
});

test('builder uses signed next-page cursors for multi-page snapshots', async () => {
  const h = runnerHarness();
  const records = Array.from({ length: 101 }, (_, index) => entity(`${String(index + 1).padStart(8, '0')}-1111-4111-8111-111111111111`));
  h.state.metadata.page_count = 2;
  const result = await createPostgresSnapshotBuilder(h).build(input({ records }));
  assert.equal(result.pageCount, 2);
  assert.equal(h.state.pages.length, 2);
  const cursor = h.state.pages[0].next_cursor;
  assert.equal((await verifySnapshotPageCursor(cursor, SECRET, { ownerId: OWNER, snapshotId: SNAPSHOT, now: CREATED })).pageIndex, 1);
  assert.equal(h.state.pages[1].next_cursor, null);
});

test('builder validates cursor configuration before opening a staging transaction', async () => {
  const h = runnerHarness();
  await assert.rejects(() => createPostgresSnapshotBuilder(h).build(input({ secret: 'short' })), /SNAPSHOT_CURSOR_FACTORY_INVALID/);
  assert.equal(h.calls.length, 0);
});

test('builder propagates staging failures and never reports a ready result', async () => {
  const h = runnerHarness();
  const failingRunner = { withTransaction: async () => { throw new Error('STAGE_FAILED'); } };
  await assert.rejects(() => createPostgresSnapshotBuilder({ runner: failingRunner }).build(input()), /STAGE_FAILED/);
  assert.equal(h.state.pages.length, 0);
});
