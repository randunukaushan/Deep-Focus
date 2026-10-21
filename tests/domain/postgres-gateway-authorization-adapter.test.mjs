import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresGatewayAuthorizationStore } = await import('../../supabase/functions/_shared/postgres-gateway-authorization-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const ID = '22222222-2222-4222-8222-222222222222';

function harness(rows = [{ id: ID, owner_id: OWNER }]) {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => { calls.push({ sql, params }); return { rows }; } }) };
  return { calls, store: createPostgresGatewayAuthorizationStore({ runner }) };
}

test('owner adapter uses an allowlisted table and parameterized resource ID', async () => {
  const h = harness();
  assert.equal(await h.store.loadOwnerId('task', ID), OWNER);
  assert.match(h.calls[0].sql, /from df_private\.tasks where id = \$1/);
  assert.deepEqual(h.calls[0].params, [ID]);
});

test('all supported resource kinds map to their canonical private tables', async () => {
  const h = harness();
  for (const [kind, table] of Object.entries({ workspace: 'workspaces', task: 'tasks', goal: 'goals', session: 'focus_sessions', reminder: 'task_reminders', plan: 'ai_plans' })) {
    await h.store.loadOwnerId(kind, ID);
    assert.match(h.calls.at(-1).sql, new RegExp(`from df_private\\.${table} where id = \\$1`));
  }
});

test('missing rows return null without inventing an owner', async () => {
  const h = harness([]);
  assert.equal(await h.store.loadOwnerId('goal', ID), null);
});

test('invalid IDs fail before opening a database transaction', async () => {
  let opened = false;
  const store = createPostgresGatewayAuthorizationStore({ runner: { withTransaction: async () => { opened = true; throw new Error('must not open'); } } });
  await assert.rejects(store.loadOwnerId('task', 'bad-id'), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});

test('foreign or malformed returned metadata fails closed', async () => {
  const foreign = harness([{ id: ID, owner_id: 'not-an-owner' }]);
  await assert.rejects(foreign.store.loadOwnerId('session', ID), /DEPENDENCY_UNAVAILABLE/);
  const duplicate = harness([{ id: ID, owner_id: OWNER }, { id: ID, owner_id: OWNER }]);
  await assert.rejects(duplicate.store.loadOwnerId('session', ID), /DEPENDENCY_UNAVAILABLE/);
});

test('malformed database result containers fail closed', async () => {
  const runner = { withTransaction: async (run) => run({ query: async () => ({ rows: null }) }) };
  const store = createPostgresGatewayAuthorizationStore({ runner });
  await assert.rejects(() => store.loadOwnerId('task', ID), /DEPENDENCY_UNAVAILABLE/);
});

test('sparse database owner rows fail closed before authorization can use them', async () => {
  const rows = [];
  rows[1] = { id: ID, owner_id: OWNER };
  const runner = { withTransaction: async (run) => run({ query: async () => ({ rows }) }) };
  const store = createPostgresGatewayAuthorizationStore({ runner });
  await assert.rejects(() => store.loadOwnerId('task', ID), /DEPENDENCY_UNAVAILABLE/);
});

test('owner adapter rejects malformed runner configuration before serving authorization', () => {
  assert.throws(() => createPostgresGatewayAuthorizationStore(null), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresGatewayAuthorizationStore({ runner: null }), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresGatewayAuthorizationStore({ runner: { withTransaction: 'not-a-function' } }), /VALIDATION_FAILED/);
});

test('owner adapter fails closed before querying when the transaction client is malformed', async () => {
  let queried = false;
  const store = createPostgresGatewayAuthorizationStore({
    runner: { withTransaction: async (run) => run({ query: 'not-a-function' }) },
  });
  await assert.rejects(() => store.loadOwnerId('task', ID), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(queried, false);
});
