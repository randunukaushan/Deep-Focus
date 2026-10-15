import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresSyncTransactionStore } = await import('../../supabase/functions/_shared/postgres-sync-transaction-adapter.ts');
const { commitAuthorizedSyncPage, hashSyncChange } = await import('../../supabase/functions/_shared/sync-transaction.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const TASK = '22222222-2222-4222-8222-222222222222';
const SESSION = '66666666-6666-4666-8666-666666666666';
const change = { sequence: '1', entityKind: 'task', entityId: TASK, operation: 'upsert', payload: { id: TASK, title: 'Read' } };

function harness() {
  const heads = new Map([[OWNER, '0']]);
  const changes = new Map();
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('update df_private.sync_heads')) { heads.set(params[0], params[1]); return { rows: [{ owner_id: params[0], last_sequence: params[1] }] }; }
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    if (sql.includes('last_sequence')) return { rows: [{ last_sequence: heads.get(params[0]) ?? '0' }] };
    if (sql.includes('from df_private.sync_changes')) {
      const stored = changes.get(`${params[0]}:${params[1]}`);
      return { rows: stored ? [{ owner_id: OWNER, sequence: stored.sequence, entity_kind: stored.entityKind, entity_id: stored.entityId, operation: stored.operation, payload: stored.payload, change_hash: stored.changeHash }] : [] };
    }
    if (sql.startsWith('insert into df_private.sync_changes')) {
      changes.set(`${params[0]}:${params[1]}`, { sequence: params[1], entityKind: params[2], entityId: params[3], operation: params[4], payload: JSON.parse(params[5]), changeHash: params[6] });
      return { rows: [{ owner_id: params[0], sequence: params[1], entity_kind: params[2] === 'session' ? 'focus_session' : params[2], entity_id: params[3], operation: params[4], change_hash: params[6] }] };
    }
    return { rows: [] };
  } };
  return { heads, changes, calls, runner: { withTransaction: async (run) => run(client) } };
}

function syncStore(runner) { return createPostgresSyncTransactionStore({ runner, sessionId: SESSION }); }

function page(changes, cursorLastSequence = '0') {
  return { actorId: OWNER, cursorOwnerId: OWNER, cursorLastSequence, nextCursor: 'cursor-next', changes, store: syncStore(harnessRef.runner) };
}

let harnessRef;

test('PostgreSQL sync transaction adapter appends an ordered change and advances the owner head', async () => {
  harnessRef = harness();
  const result = await commitAuthorizedSyncPage({ ...page([change]), store: syncStore(harnessRef.runner) });
  assert.deepEqual(result, { applied: 1, replayed: 0, lastSequence: '1', nextCursor: 'cursor-next' });
  assert.equal(harnessRef.changes.get(`${OWNER}:1`).changeHash.length, 64);
  assert.equal(harnessRef.heads.get(OWNER), '1');
});

test('PostgreSQL sync transaction adapter replays exact changes and rejects changed replays', async () => {
  harnessRef = harness();
  const store = syncStore(harnessRef.runner);
  await commitAuthorizedSyncPage({ ...page([change]), store });
  const replay = await commitAuthorizedSyncPage({ ...page([change], '1'), store });
  assert.deepEqual(replay, { applied: 0, replayed: 1, lastSequence: '1', nextCursor: 'cursor-next' });
  await assert.rejects(() => commitAuthorizedSyncPage({ ...page([{ ...change, payload: { id: TASK, title: 'Tampered' } }], '1'), store }), /SYNC_REPLAY_CONFLICT/);
});

test('PostgreSQL sync transaction adapter rejects a stored payload whose hash no longer matches', async () => {
  harnessRef = harness();
  const store = syncStore(harnessRef.runner);
  await commitAuthorizedSyncPage({ ...page([change]), store });
  harnessRef.changes.get(`${OWNER}:1`).payload = { id: TASK, title: 'Tampered in storage' };
  await assert.rejects(() => commitAuthorizedSyncPage({ ...page([change], '1'), store }), /DEPENDENCY_UNAVAILABLE/);
});

test('PostgreSQL sync transaction adapter keeps owner identity in every database key', async () => {
  harnessRef = harness();
  const store = syncStore(harnessRef.runner);
  await commitAuthorizedSyncPage({ ...page([change]), store });
  assert.equal(harnessRef.calls.every((call) => call.params[0] === OWNER), true);
});

test('PostgreSQL sync transaction adapter stores canonical session changes under the private legacy kind', async () => {
  harnessRef = harness();
  await commitAuthorizedSyncPage({ ...page([{ ...change, entityKind: 'session' }]), store: syncStore(harnessRef.runner) });
  assert.equal(harnessRef.changes.get(`${OWNER}:1`).entityKind, 'focus_session');
});

test('PostgreSQL sync transaction adapter fails closed when head advancement changes no row', async () => {
  harnessRef = harness();
  const originalQuery = harnessRef.runner;
  const client = {
    query: async (sql, params) => {
      const result = await originalQuery.withTransaction(async (transactionClient) => transactionClient.query(sql, params));
      return sql.includes('update df_private.sync_heads') ? { rows: [] } : result;
    },
  };
  const store = syncStore({ withTransaction: async (run) => run(client) });
  await assert.rejects(() => commitAuthorizedSyncPage({ ...page([change]), store }), /DEPENDENCY_UNAVAILABLE/);
});

test('PostgreSQL sync transaction adapter fails closed when change insert is not acknowledged', async () => {
  harnessRef = harness();
  const baseRunner = harnessRef.runner;
  const client = {
    query: async (sql, params) => {
      const result = await baseRunner.withTransaction(async (transactionClient) => transactionClient.query(sql, params));
      return sql.startsWith('insert into df_private.sync_changes') ? { rows: [] } : result;
    },
  };
  const store = syncStore({ withTransaction: async (run) => run(client) });
  await assert.rejects(() => commitAuthorizedSyncPage({ ...page([change]), store }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(harnessRef.heads.get(OWNER), '0');
});

test('PostgreSQL sync transaction adapter fails closed on a foreign returned insert row', async () => {
  harnessRef = harness();
  const baseRunner = harnessRef.runner;
  const client = {
    query: async (sql, params) => {
      const result = await baseRunner.withTransaction(async (transactionClient) => transactionClient.query(sql, params));
      if (sql.startsWith('insert into df_private.sync_changes')) result.rows[0].owner_id = '33333333-3333-4333-8333-333333333333';
      return result;
    },
  };
  const store = syncStore({ withTransaction: async (run) => run(client) });
  await assert.rejects(() => commitAuthorizedSyncPage({ ...page([change]), store }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(harnessRef.heads.get(OWNER), '0');
});

test('PostgreSQL sync transaction adapter fails closed when inserted change identity is altered', async () => {
  harnessRef = harness();
  const baseRunner = harnessRef.runner;
  const client = {
    query: async (sql, params) => {
      const result = await baseRunner.withTransaction(async (transactionClient) => transactionClient.query(sql, params));
      if (sql.startsWith('insert into df_private.sync_changes')) result.rows[0].entity_id = '33333333-3333-4333-8333-333333333333';
      return result;
    },
  };
  const alteredStore = syncStore({ withTransaction: async (run) => run(client) });
  await assert.rejects(() => commitAuthorizedSyncPage({ ...page([change]), store: alteredStore }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(harnessRef.heads.get(OWNER), '0');
});

test('PostgreSQL sync transaction adapter fails closed on a foreign returned replay row', async () => {
  harnessRef = harness();
  const store = syncStore(harnessRef.runner);
  await commitAuthorizedSyncPage({ ...page([change]), store });
  const baseRunner = harnessRef.runner;
  const client = {
    query: async (sql, params) => {
      const result = await baseRunner.withTransaction(async (transactionClient) => transactionClient.query(sql, params));
      if (sql.includes('from df_private.sync_changes') && result.rows.length > 0) result.rows[0].owner_id = '33333333-3333-4333-8333-333333333333';
      return result;
    },
  };
  const foreignRowStore = syncStore({ withTransaction: async (run) => run(client) });
  await assert.rejects(() => commitAuthorizedSyncPage({ ...page([change], '1'), store: foreignRowStore }), /DEPENDENCY_UNAVAILABLE/);
});

test('PostgreSQL sync transaction adapter fails closed on a foreign returned head row', async () => {
  harnessRef = harness();
  const baseRunner = harnessRef.runner;
  const client = {
    query: async (sql, params) => {
      const result = await baseRunner.withTransaction(async (transactionClient) => transactionClient.query(sql, params));
      if (sql.includes('update df_private.sync_heads')) result.rows[0].owner_id = '33333333-3333-4333-8333-333333333333';
      return result;
    },
  };
  const foreignHeadStore = syncStore({ withTransaction: async (run) => run(client) });
  await assert.rejects(() => commitAuthorizedSyncPage({ ...page([change]), store: foreignHeadStore }), /DEPENDENCY_UNAVAILABLE/);
});

test('PostgreSQL sync transaction adapter rejects malformed or ambiguous result rows', async () => {
  harnessRef = harness();
  const baseRunner = harnessRef.runner;
  const malformedClient = {
    query: async (sql, params) => {
      if (sql.includes('last_sequence')) return { rows: null };
      return baseRunner.withTransaction(async (transactionClient) => transactionClient.query(sql, params));
    },
  };
  const malformedStore = syncStore({ withTransaction: async (run) => run(malformedClient) });
  await assert.rejects(() => commitAuthorizedSyncPage({ ...page([change]), store: malformedStore }), /DEPENDENCY_UNAVAILABLE/);

  harnessRef = harness();
  harnessRef.heads.set(OWNER, '1');
  const duplicateClient = {
    query: async (sql, params) => {
      const result = await harnessRef.runner.withTransaction(async (transactionClient) => transactionClient.query(sql, params));
      if (sql.includes('from df_private.sync_changes') && result.rows.length === 0) return { rows: [{ owner_id: OWNER, sequence: '1', entity_kind: 'task', entity_id: TASK, operation: 'upsert', payload: change.payload, change_hash: await hashChange(change) }, { owner_id: OWNER, sequence: '1', entity_kind: 'task', entity_id: TASK, operation: 'upsert', payload: change.payload, change_hash: await hashChange(change) }] };
      return result;
    },
  };
  const duplicateStore = syncStore({ withTransaction: async (run) => run(duplicateClient) });
  await assert.rejects(() => commitAuthorizedSyncPage({ ...page([change], '1'), store: duplicateStore }), /DEPENDENCY_UNAVAILABLE/);
});

async function hashChange(value) {
  return hashSyncChange({ sequence: value.sequence, entityKind: value.entityKind, entityId: value.entityId, operation: value.operation, payload: value.payload });
}

test('sync transaction adapter rejects malformed runner, operation and client dependencies before writes', async () => {
  assert.throws(() => createPostgresSyncTransactionStore(null), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresSyncTransactionStore({ runner: { withTransaction: 'not-a-function' }, sessionId: SESSION }), /VALIDATION_FAILED/);
  let opened = false;
  const store = createPostgresSyncTransactionStore({ runner: { withTransaction: async () => { opened = true; } }, sessionId: SESSION });
  assert.throws(() => store.withTransaction(null), /VALIDATION_FAILED/);
  const malformedClientStore = createPostgresSyncTransactionStore({ runner: { withTransaction: async (run) => run({ query: 'not-a-function' }) }, sessionId: SESSION });
  await assert.rejects(() => malformedClientStore.withTransaction(async () => 'must not run'), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(opened, false);
});

test('sync transaction adapter fails closed on sparse head rows before change writes', async () => {
  const sparse = [];
  sparse[1] = { last_sequence: '0' };
  let writes = 0;
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    if (sql.includes('last_sequence')) return { rows: sparse };
    writes += 1;
    return { rows: [] };
  } };
  const store = syncStore({ withTransaction: async (run) => run(client) });
  await assert.rejects(() => commitAuthorizedSyncPage({ ...page([change]), store }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(writes, 0);
});
