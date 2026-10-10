import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresSnapshotStager } = await import('../../supabase/functions/_shared/postgres-snapshot-staging-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '66666666-6666-4666-8666-666666666666';
const SNAPSHOT = '22222222-2222-4222-8222-222222222222';
const ENTITY = '33333333-3333-4333-8333-333333333333';
const DIGEST = 'a'.repeat(64);
const MANIFEST = 'b'.repeat(64);
const CREATED = '2026-10-10T00:00:00.000Z';
const EXPIRES = '2026-10-11T00:00:00.000Z';

const page = { snapshotId: SNAPSHOT, pageIndex: 0, pageCount: 1, highWater: '12', pageDigest: DIGEST,
  data: [{ entity: 'task', entityId: ENTITY, version: 1, operation: 'upsert', payload: { title: 'Read' } }], nextCursor: null };
const input = { ownerId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, contractVersion: 1, highWater: '12', createdAt: CREATED,
  expiresAt: EXPIRES, pageCount: 1, manifestDigest: MANIFEST, pages: [page] };

function harness(overrides = {}) {
  const calls = [];
  const state = { metadata: { owner_id: OWNER, snapshot_id: SNAPSHOT, contract_version: 1, high_water: '12', created_at: CREATED,
    expires_at: EXPIRES, page_count: 1, manifest_digest: MANIFEST, status: 'building' }, pages: [], ...overrides };
  const runner = {
    withTransaction: async (run) => run({
      query: async (sql, params) => {
        calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
        if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
        if (sql.includes('insert into df_private.sync_snapshots')) return { rows: [] };
        if (sql.includes('from df_private.sync_snapshots') && !sql.includes('sync_snapshot_pages')) return { rows: state.metadata ? [state.metadata] : [] };
        if (sql.includes('insert into df_private.sync_snapshot_pages')) {
          state.pages.push({ owner_id: OWNER, snapshot_id: SNAPSHOT, page_index: page.pageIndex, page_count: page.pageCount, high_water: page.highWater,
            page_digest: page.pageDigest, next_cursor: page.nextCursor, payload: { data: page.data } });
          return { rows: [] };
        }
        if (sql.includes('page_index') && sql.includes('from df_private.sync_snapshot_pages')) return { rows: state.pages.filter((row) => row.page_index === params[2]).map((row) => ({ ...row, payload: { data: page.data } })) };
        if (sql.includes('count(*)')) return { rows: [{ page_count: state.pages.length }] };
        if (sql.includes('update df_private.sync_snapshots')) { state.metadata.status = 'ready'; return { rows: [{ owner_id: OWNER, snapshot_id: SNAPSHOT, status: 'ready' }] }; }
        return { rows: [] };
      },
    }),
  };
  return { runner, calls, state };
}

test('stages an owner-bound snapshot in one transaction and publishes ready only after all pages exist', async () => {
  const h = harness();
  assert.deepEqual(await createPostgresSnapshotStager(h).stage(input), { snapshotId: SNAPSHOT, status: 'ready', pageCount: 1 });
  assert.ok(h.calls.some((call) => call.sql.includes('on conflict (owner_id, snapshot_id) do nothing')));
  assert.ok(h.calls.some((call) => call.sql.includes('where owner_id = $1 and snapshot_id = $2 for update')));
  assert.ok(h.calls.some((call) => call.sql.startsWith('update df_private.sync_snapshots')));
});

test('same snapshot retry is idempotent after it is ready', async () => {
  const h = harness({ metadata: { ...harness().state.metadata, status: 'ready' }, pages: [{ page_index: 0, page_count: 1,
    high_water: '12', page_digest: DIGEST, next_cursor: null, payload: { data: page.data } }] });
  assert.deepEqual(await createPostgresSnapshotStager(h).stage(input), { snapshotId: SNAPSHOT, status: 'ready', pageCount: 1 });
  assert.equal(h.calls.some((call) => call.sql.includes('insert into df_private.sync_snapshot_pages')), false);
});

test('ready metadata without its complete page set fails closed', async () => {
  const h = harness({ metadata: { ...harness().state.metadata, status: 'ready' }, pages: [] });
  await assert.rejects(() => createPostgresSnapshotStager(h).stage(input), /DEPENDENCY_UNAVAILABLE/);
});

test('same snapshot with changed manifest is rejected without rewriting pages', async () => {
  const h = harness();
  await assert.rejects(() => createPostgresSnapshotStager(h).stage({ ...input, manifestDigest: 'c'.repeat(64) }), /IDEMPOTENCY_CONFLICT/);
  assert.equal(h.calls.some((call) => call.sql.includes('insert into df_private.sync_snapshot_pages')), false);
});

test('foreign owner input is rejected before any query', async () => {
  const h = harness();
  await assert.rejects(() => createPostgresSnapshotStager(h).stage({ ...input, ownerId: 'foreign-owner' }), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('duplicate page payload is not silently replaced on retry', async () => {
  const h = harness({ pages: [{ page_index: 0, page_count: 1, high_water: '12', page_digest: 'c'.repeat(64), next_cursor: null, payload: { data: [{ entity: 'task' }] } }] });
  await assert.rejects(() => createPostgresSnapshotStager(h).stage(input), /IDEMPOTENCY_CONFLICT/);
});

test('foreign returned page metadata fails closed during retry', async () => {
  const h = harness({ pages: [{ owner_id: '77777777-7777-4777-8777-777777777777', snapshot_id: SNAPSHOT, page_index: 0, page_count: 1, high_water: '12', page_digest: DIGEST, next_cursor: null, payload: { data: page.data } }] });
  await assert.rejects(() => createPostgresSnapshotStager(h).stage(input), /IDEMPOTENCY_CONFLICT/);
});

test('foreign returned ready snapshot metadata fails closed before reporting publication', async () => {
  const h = harness();
  const baseRunner = h.runner;
  const foreignRunner = {
    withTransaction: async (run) => baseRunner.withTransaction((client) => run({
      query: async (sql, params) => {
        const result = await client.query(sql, params);
        if (sql.includes('update df_private.sync_snapshots')) result.rows[0].owner_id = '77777777-7777-4777-8777-777777777777';
        return result;
      },
    })),
  };
  await assert.rejects(() => createPostgresSnapshotStager({ runner: foreignRunner }).stage(input), /DEPENDENCY_UNAVAILABLE/);
});

test('high-water values above PostgreSQL bigint range are rejected', async () => {
  const h = harness();
  await assert.rejects(() => createPostgresSnapshotStager(h).stage({ ...input, highWater: '9223372036854775808', pages: [{ ...page, highWater: '9223372036854775808' }] }), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('revoked session fails before snapshot staging writes', async () => {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql, params });
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'revoked', revoked_at: CREATED }] };
    throw new Error('snapshot write must not run');
  } }) };
  await assert.rejects(() => createPostgresSnapshotStager({ runner }).stage(input), /AUTH_REQUIRED/);
  assert.equal(calls.filter((call) => call.sql.includes('sync_snapshot')).length, 0);
});
