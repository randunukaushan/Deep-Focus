import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresSyncGatewayHandlers } = await import('../../supabase/functions/_shared/postgres-sync-gateway-handlers.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '66666666-6666-4666-8666-666666666666';
const TASK = '22222222-2222-4222-8222-222222222222';
const SECRET = 's'.repeat(32);
const NOW = '2026-10-10T00:00:00.000Z';
const EXPIRY = '2026-10-10T01:00:00.000Z';

function harness() {
  const changes = new Map();
  const calls = [];
  let head = '0';
  const client = { query: async (sql, params) => {
    calls.push(sql.replace(/\s+/g, ' ').trim());
    if (sql.includes('max(sequence)')) return { rows: [{ high_water: head }] };
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    if (sql.includes('update df_private.sync_heads')) { head = params[1]; return { rows: [{ owner_id: params[0], last_sequence: params[1] }] }; }
    if (sql.includes('last_sequence')) return { rows: [{ last_sequence: head }] };
    if (sql.includes('from df_private.sync_changes')) {
      const row = [...changes.values()].find((candidate) => BigInt(candidate.sequence) > BigInt(params[1]) && BigInt(candidate.sequence) <= BigInt(params[2]));
      return { rows: row ? [{ owner_id: OWNER, sequence: row.sequence, entity_kind: row.entityKind, entity_id: row.entityId, operation: row.operation, payload: row.payload, change_hash: row.changeHash }] : [] };
    }
    if (sql.includes('insert into df_private.sync_changes')) { changes.set(`${params[0]}:${params[1]}`, { sequence: params[1], entityKind: params[2], entityId: params[3], operation: params[4], payload: JSON.parse(params[5]), changeHash: params[6] }); return { rows: [{ owner_id: params[0], sequence: params[1], change_hash: params[6] }] }; }
    return { rows: [] };
  } };
  return { changes, calls, runner: { withTransaction: async (run) => run(client) } };
}

test('sync handlers bind pull and commit to the verified actor', async () => {
  const h = harness();
  const handlers = createPostgresSyncGatewayHandlers({ runner: h.runner, cursorSecret: SECRET, now: NOW, expiresAt: EXPIRY });
  const committed = await handlers.commit({ actorId: OWNER, sessionId: SESSION, cursorLastSequence: '0', nextCursor: 'cursor-1', changes: [{ sequence: '1', entityKind: 'task', entityId: TASK, operation: 'upsert', payload: { id: TASK, title: 'Read' } }] });
  assert.equal(committed.applied, 1);
  assert.equal(h.changes.size, 1, h.calls.join('\n'));
  const pulled = await handlers.pull({ actorId: OWNER, sessionId: SESSION, cursor: null, limit: 10 });
  assert.equal(pulled.changes.length, 1);
  assert.equal(pulled.changes[0].entityId, TASK);
});

test('sync handlers reject invalid actor before opening the database transaction', async () => {
  let opened = false;
  const runner = { withTransaction: async () => { opened = true; throw new Error('must not open'); } };
  const handlers = createPostgresSyncGatewayHandlers({ runner, cursorSecret: SECRET, now: NOW, expiresAt: EXPIRY });
  await assert.rejects(() => handlers.pull({ actorId: 'not-an-owner', sessionId: SESSION, cursor: null, limit: 10 }), /VALIDATION_FAILED/);
  await assert.rejects(() => handlers.commit({ actorId: 'not-an-owner', sessionId: SESSION, cursorLastSequence: '0', nextCursor: 'cursor', changes: [] }), /VALIDATION_FAILED/);
  await assert.rejects(() => handlers.pull({ actorId: OWNER, sessionId: 'bad-session', cursor: null, limit: 10 }), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});

test('sync pull handler preserves signed cursor owner and limit binding', async () => {
  const h = harness();
  const handlers = createPostgresSyncGatewayHandlers({ runner: h.runner, cursorSecret: SECRET, now: NOW, expiresAt: EXPIRY });
  const first = await handlers.pull({ actorId: OWNER, sessionId: SESSION, cursor: null, limit: 10 });
  await assert.rejects(() => handlers.pull({ actorId: '33333333-3333-4333-8333-333333333333', sessionId: SESSION, cursor: first.nextCursor, limit: 10 }), /SYNC_CURSOR_INVALID/);
});

test('sync gateway rejects a revoked transaction session before database data access', async () => {
  const h = harness();
  const revokedRunner = { withTransaction: async (run) => run({ query: async (sql) => {
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'revoked', revoked_at: NOW }] };
    throw new Error('data access must not run');
  } }) };
  const handlers = createPostgresSyncGatewayHandlers({ runner: revokedRunner, cursorSecret: SECRET, now: NOW, expiresAt: EXPIRY });
  await assert.rejects(() => handlers.pull({ actorId: OWNER, sessionId: SESSION, cursor: null, limit: 10 }), /AUTH_REQUIRED/);
  await assert.rejects(() => handlers.commit({ actorId: OWNER, sessionId: SESSION, cursorLastSequence: '0', nextCursor: 'cursor', changes: [] }), /AUTH_REQUIRED/);
  assert.equal(h.changes.size, 0);
});
