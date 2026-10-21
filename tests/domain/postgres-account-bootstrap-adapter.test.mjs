import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresAccountBootstrapStore } = await import('../../supabase/functions/_shared/postgres-account-bootstrap-adapter.ts');
const { bootstrapAccountTransactionally } = await import('../../supabase/functions/_shared/account-bootstrap.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const WORKSPACE = '22222222-2222-4222-8222-222222222222';
const EXISTING_WORKSPACE = '33333333-3333-4333-8333-333333333333';

function harness(existing = false) {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('insert into df_private.profiles')) return { rows: existing ? [] : [{ owner_id: OWNER, display_name: 'Owner', account_state: 'active', version: 1 }] };
    if (sql.includes('select owner_id, display_name')) return { rows: [{ owner_id: OWNER, display_name: 'Original', account_state: 'active', version: 2 }] };
    if (sql.includes('insert into df_private.workspaces')) return { rows: existing ? [] : [{ owner_id: OWNER, id: WORKSPACE, kind: 'personal' }] };
    if (sql.includes('select id, owner_id, kind')) return { rows: [{ owner_id: OWNER, id: EXISTING_WORKSPACE, kind: 'personal' }] };
    if (sql.includes('insert into df_private.sync_heads')) return { rows: existing ? [] : [{ owner_id: OWNER, last_sequence: '0' }] };
    if (sql.includes('select owner_id, last_sequence')) return { rows: [{ owner_id: OWNER, last_sequence: '12' }] };
    throw new Error(`unexpected SQL: ${sql}`);
  }}) };
  return { calls, store: createPostgresAccountBootstrapStore({ runner }) };
}

test('PostgreSQL adapter inserts profile, personal workspace and zero sync head', async () => {
  const h = harness();
  const result = await bootstrapAccountTransactionally({ ownerId: OWNER, workspaceId: WORKSPACE, displayName: 'Owner', store: h.store });
  assert.equal(result.workspace.workspaceId, WORKSPACE);
  assert.equal(result.syncHead.lastSequence, '0');
  assert.equal(h.calls.filter((call) => call.sql.startsWith('insert into df_private')).length, 3);
});

test('PostgreSQL adapter re-reads canonical rows on duplicate retry', async () => {
  const h = harness(true);
  const result = await bootstrapAccountTransactionally({ ownerId: OWNER, workspaceId: WORKSPACE, displayName: 'New', store: h.store });
  assert.equal(result.profile.displayName, 'Original');
  assert.equal(result.workspace.workspaceId, EXISTING_WORKSPACE);
  assert.equal(result.syncHead.lastSequence, '12');
  assert.equal(h.calls.filter((call) => call.sql.startsWith('select ')).length, 3);
});

test('PostgreSQL bootstrap adapter rejects runtime type confusion before SQL', async () => {
  const h = harness();
  await assert.rejects(h.store.withTransaction(async (store) => store.ensureProfile({ ownerId: Symbol('owner'), displayName: 'Owner' })), /VALIDATION_FAILED/);
  await assert.rejects(h.store.withTransaction(async (store) => store.ensurePersonalWorkspace({ ownerId: OWNER, workspaceId: Symbol('workspace') })), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('PostgreSQL bootstrap adapter fails closed on malformed result containers', async () => {
  const runner = { withTransaction: async (run) => run({ query: async () => ({ rows: null }) }) };
  const store = createPostgresAccountBootstrapStore({ runner });
  await assert.rejects(store.withTransaction((tx) => tx.ensureProfile({ ownerId: OWNER, displayName: 'Owner' })), /DEPENDENCY_UNAVAILABLE/);
  const malformedRow = { withTransaction: async (run) => run({ query: async () => ({ rows: [null] }) }) };
  await assert.rejects(createPostgresAccountBootstrapStore({ runner: malformedRow }).withTransaction((tx) => tx.ensureProfile({ ownerId: OWNER, displayName: 'Owner' })), /DEPENDENCY_UNAVAILABLE/);
  assert.throws(() => createPostgresAccountBootstrapStore({ runner: {} }), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresAccountBootstrapStore({ runner: { withTransaction: async () => {} } }).withTransaction(null), /VALIDATION_FAILED/);
});

test('PostgreSQL bootstrap adapter fails closed on sparse rows before dependent inserts', async () => {
  const sparse = [];
  sparse[1] = { owner_id: OWNER, display_name: 'Owner', account_state: 'active', version: 1 };
  let writes = 0;
  const store = createPostgresAccountBootstrapStore({
    runner: { withTransaction: async (run) => run({ query: async () => { writes += 1; return { rows: sparse }; } }) },
  });
  await assert.rejects(store.withTransaction((tx) => tx.ensureProfile({ ownerId: OWNER, displayName: 'Owner' })), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(writes, 1);
});
