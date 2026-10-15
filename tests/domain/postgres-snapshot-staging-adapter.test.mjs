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
        if (sql.includes('page_index') && sql.includes('from df_private.sync_snapshot_pages')) return { rows: state.pages.filter((row) => row.page_index === params[2]).map((row) => ({ ...row, payload: state.returnedPayload ?? { data: page.data } })) };
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

test('malformed stored page numbers fail closed before retry comparison', async () => {
  const h = harness({ returnedPayload: { data: [{ ...page.data[0], payload: { elapsedSeconds: Number.NaN } }] } });
  await assert.rejects(() => createPostgresSnapshotStager(h).stage(input), /DEPENDENCY_UNAVAILABLE/);
});

test('malformed JSON-coercible stored payloads fail closed before retry comparison', async () => {
  const sparse = []; sparse[1] = 'gap';
  const symbolBearing = []; symbolBearing.push('value'); symbolBearing[Symbol('metadata')] = 'hidden';
  class CustomPayload { constructor() { this.value = 'hidden-shape'; } }
  for (const payload of [{ values: sparse }, { values: symbolBearing }, new CustomPayload()]) {
    const h = harness({ returnedPayload: { data: [{ ...page.data[0], payload }] } });
    await assert.rejects(() => createPostgresSnapshotStager(h).stage(input), /DEPENDENCY_UNAVAILABLE/);
  }
});

test('JSONB key reordering does not turn an identical page into a conflict', async () => {
  const reorderedInput = { ...input, pages: [{ ...page, data: [{ ...page.data[0], payload: { note: 'Read note', title: 'Read' } }] }] };
  const h = harness({ returnedPayload: { data: [{ entity: 'task', entityId: ENTITY, version: 1, operation: 'upsert', payload: { title: 'Read', note: 'Read note' } }] } });
  assert.deepEqual(await createPostgresSnapshotStager(h).stage(reorderedInput), { snapshotId: SNAPSHOT, status: 'ready', pageCount: 1 });
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

test('oversized page payload is rejected before snapshot writes', async () => {
  const h = harness();
  const oversized = { ...page, data: [{ ...page.data[0], payload: { title: 'x'.repeat(262144) } }] };
  await assert.rejects(() => createPostgresSnapshotStager(h).stage({ ...input, pages: [oversized] }), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('snapshot staging rejects unsafe request and page runtime types before writes', async () => {
  const h = harness();
  const stager = createPostgresSnapshotStager(h);
  await assert.rejects(() => stager.stage({ ...input, ownerId: Symbol('owner') }), /VALIDATION_FAILED/);
  await assert.rejects(() => stager.stage({ ...input, sessionId: Symbol('session') }), /VALIDATION_FAILED/);
  await assert.rejects(() => stager.stage({ ...input, createdAt: Symbol('clock') }), /VALIDATION_FAILED/);
  await assert.rejects(() => stager.stage({ ...input, pages: [{ ...page, data: null }] }), /VALIDATION_FAILED/);
  await assert.rejects(() => stager.stage({ ...input, pages: [{ ...page, nextCursor: Symbol('cursor') }] }), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('snapshot stager rejects malformed runner, client and result containers before publication', async () => {
  assert.throws(() => createPostgresSnapshotStager(null), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresSnapshotStager({ runner: { withTransaction: 'not-a-function' } }), /VALIDATION_FAILED/);
  const malformedClient = createPostgresSnapshotStager({ runner: { withTransaction: async (run) => run({ query: 'not-a-function' }) } });
  await assert.rejects(() => malformedClient.stage(input), /DEPENDENCY_UNAVAILABLE/);
  const malformedRows = createPostgresSnapshotStager({ runner: { withTransaction: async (run) => run({ query: async (sql) => sql.includes('from df_private.app_sessions') ? { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] } : sql.includes('sync_snapshots') && sql.includes('from') ? { rows: null } : { rows: [] } }) } });
  await assert.rejects(() => malformedRows.stage(input), /DEPENDENCY_UNAVAILABLE/);
});

test('snapshot stager fails closed on sparse result rows before publication', async () => {
  const sparse = [];
  sparse[1] = { owner_id: OWNER, snapshot_id: SNAPSHOT, contract_version: 1, high_water: '12', created_at: CREATED,
    expires_at: EXPIRES, page_count: 1, manifest_digest: MANIFEST, status: 'building' };
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql) => {
    calls.push(sql);
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    if (sql.includes('from df_private.sync_snapshots') && !sql.includes('sync_snapshot_pages')) return { rows: sparse };
    return { rows: [] };
  } }) };
  await assert.rejects(() => createPostgresSnapshotStager({ runner }).stage(input), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(calls.some((sql) => sql.includes('sync_snapshot_pages')), false);
});
