import assert from 'node:assert/strict';
import test from 'node:test';

const { signSnapshotPageCursor } = await import('../../supabase/functions/_shared/snapshot-page-cursor.ts');
const { createPostgresSnapshotCursorHandlers } = await import('../../supabase/functions/_shared/postgres-snapshot-cursor-handlers.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '66666666-6666-4666-8666-666666666666';
const OTHER = '22222222-2222-4222-8222-222222222222';
const SNAPSHOT = '33333333-3333-4333-8333-333333333333';
const OTHER_SNAPSHOT = '44444444-4444-4444-8444-444444444444';
const ENTITY = '55555555-5555-4555-8555-555555555555';
const SECRET = 'secret-for-snapshot-cursor-handler-0123456789';
const NOW = '2026-10-10T12:00:00.000Z';
const DIGEST = 'a'.repeat(64);

function pageRow(pageIndex = 1) {
  return {
    owner_id: OWNER,
    snapshot_id: SNAPSHOT,
    page_index: pageIndex,
    page_count: 3,
    high_water: '12',
    snapshot_high_water: '12',
    snapshot_owner_id: OWNER,
    snapshot_record_id: SNAPSHOT,
    snapshot_page_count: 3,
    page_digest: DIGEST,
    payload: { data: [{ entity: 'task', entityId: ENTITY, version: 1, operation: 'upsert', payload: { title: 'Read' } }] },
    next_cursor: 'next-page-cursor',
  };
}

function harness(rows = [pageRow()]) {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    return { rows };
  } }) };
  return { runner, calls };
}

async function tokenFor(overrides = {}) {
  return signSnapshotPageCursor({
    version: 1,
    ownerId: OWNER,
    endpoint: 'snapshot-pages',
    snapshotId: SNAPSHOT,
    pageIndex: 1,
    pageCount: 3,
    expiresAt: '2026-10-11T00:00:00.000Z',
    ...overrides,
  }, SECRET);
}

test('cursor handler verifies the token and reads the signed page scope', async () => {
  const h = harness();
  const handlers = createPostgresSnapshotCursorHandlers({ runner: h.runner, secret: SECRET });
  const result = await handlers.readPageByCursor({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, cursor: await tokenFor(), now: NOW });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.page.pageIndex, 1);
  assert.deepEqual(h.calls[1].params, [OWNER, SNAPSHOT, 1, NOW]);
});

test('cursor handler never trusts a client-supplied page index', async () => {
  const h = harness([pageRow(2)]);
  const handlers = createPostgresSnapshotCursorHandlers({ runner: h.runner, secret: SECRET });
  await handlers.readPageByCursor({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, cursor: await tokenFor({ pageIndex: 2 }), pageIndex: 0, now: NOW });
  assert.equal(h.calls[1].params[2], 2);
});

test('cursor handler rejects foreign actor or snapshot before storage', async () => {
  const h = harness();
  const handlers = createPostgresSnapshotCursorHandlers({ runner: h.runner, secret: SECRET });
  const token = await tokenFor();
  await assert.rejects(() => handlers.readPageByCursor({ actorId: OTHER, sessionId: SESSION, snapshotId: SNAPSHOT, cursor: token, now: NOW }), /VALIDATION_FAILED/);
  await assert.rejects(() => handlers.readPageByCursor({ actorId: OWNER, sessionId: SESSION, snapshotId: OTHER_SNAPSHOT, cursor: token, now: NOW }), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('cursor handler rejects tampered, expired and wrong-secret cursors', async () => {
  const h = harness();
  const handlers = createPostgresSnapshotCursorHandlers({ runner: h.runner, secret: SECRET });
  const token = await tokenFor();
  const expiredToken = await tokenFor({ expiresAt: NOW });
  const [encoded, signature] = token.split('.');
  const tampered = `${encoded.slice(0, -1)}${encoded.endsWith('A') ? 'B' : 'A'}.${signature}`;
  await assert.rejects(() => handlers.readPageByCursor({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, cursor: tampered, now: NOW }), /VALIDATION_FAILED/);
  await assert.rejects(() => handlers.readPageByCursor({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, cursor: expiredToken, now: NOW }), /VALIDATION_FAILED/);
  const wrongSecretHandlers = createPostgresSnapshotCursorHandlers({ runner: h.runner, secret: `${SECRET}-wrong` });
  await assert.rejects(() => wrongSecretHandlers.readPageByCursor({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, cursor: token, now: NOW }), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('cursor handler returns privacy-preserving not-found for an unavailable page', async () => {
  const handlers = createPostgresSnapshotCursorHandlers({ runner: harness([]).runner, secret: SECRET });
  const token = await tokenFor();
  await assert.rejects(() => handlers.readPageByCursor({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, cursor: token, now: NOW }), /NOT_FOUND/);
});

test('cursor handler fails before page access when the session is revoked', async () => {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql, params });
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'revoked', revoked_at: NOW }] };
    throw new Error('snapshot page query must not run');
  } }) };
  const handlers = createPostgresSnapshotCursorHandlers({ runner, secret: SECRET });
  const token = await tokenFor();
  await assert.rejects(() => handlers.readPageByCursor({ actorId: OWNER, sessionId: SESSION, snapshotId: SNAPSHOT, cursor: token, now: NOW }), /AUTH_REQUIRED/);
  assert.equal(calls.filter((call) => call.sql.includes('sync_snapshot')).length, 0);
});
