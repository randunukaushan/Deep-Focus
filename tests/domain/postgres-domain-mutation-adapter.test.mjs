import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresDomainMutationStore } = await import('../../supabase/functions/_shared/postgres-domain-mutation-adapter.ts');
const { executeDomainMutation } = await import('../../supabase/functions/_shared/domain-mutation-transaction.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const MUTATION = '22222222-2222-4222-8222-222222222222';
const HASH = 'a'.repeat(64);
const BODY = { id: '33333333-3333-4333-8333-333333333333', title: 'Read' };
const SESSION = '66666666-6666-4666-8666-666666666666';

function harness({ receiptRows = [], receiptInsertRows = [{ owner_id: OWNER, operation: 'createTask', mutation_id: MUTATION }], headRows = [{ owner_id: OWNER }], profileRows = [{ owner_id: OWNER, account_state: 'active' }], sessionRows = [{ owner_id: OWNER, session_id: SESSION, status: 'active', expires_at: '2026-10-10T01:00:00.000Z', revoked_at: null }], applyMutation = async () => ({ responseBody: { id: BODY.id }, responseStatus: 201 }), writeSyncChange } = {}) {
  const calls = [];
  let committed = false;
  const client = {
    async query(sql, params) {
      calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params: [...params] });
      if (sql.includes('from df_private.profiles')) return { rows: profileRows };
      if (sql.includes('from df_private.app_sessions')) return { rows: sessionRows };
      if (sql.includes('sync_heads')) return { rows: headRows };
      if (sql.includes('mutation_receipts') && sql.trimStart().startsWith('select')) return { rows: receiptRows };
      if (sql.includes('mutation_receipts') && sql.trimStart().startsWith('insert')) return { rows: receiptInsertRows };
      if (sql.trimStart().startsWith('insert')) return { rows: [] };
      throw new Error('unexpected query');
    },
  };
  const runner = { withTransaction: async (run) => { const result = await run(client); committed = true; return result; } };
  return { store: createPostgresDomainMutationStore({ runner, applyMutation, ...(writeSyncChange ? { writeSyncChange } : {}) }), calls, get committed() { return committed; } };
}

test('Postgres candidate locks the owner head, applies with exact input, and writes the receipt', async () => {
  let appliedInput;
  const h = harness({ applyMutation: async (_client, input) => { appliedInput = input; return { responseBody: { id: BODY.id }, responseStatus: 201 }; } });
  const result = await executeDomainMutation({ actorId: OWNER, operation: 'createTask', mutationId: MUTATION, requestSha256: HASH, body: BODY, store: h.store });
  assert.equal(result.action, 'applied');
  assert.deepEqual(appliedInput, { actorId: OWNER, operation: 'createTask', mutationId: MUTATION, requestSha256: HASH, body: BODY });
  assert.equal(h.calls.filter((call) => call.sql.includes('sync_heads')).length, 1);
  assert.equal(h.calls.filter((call) => call.sql.startsWith('insert into df_private.mutation_receipts')).length, 1);
  assert.equal(h.committed, true);
});

test('receipt replay reads the exact owner-scoped row and does not apply or insert', async () => {
  let applyCalls = 0;
  const receipt = { owner_id: OWNER, operation: 'createTask', mutation_id: MUTATION, request_sha256: HASH, response_body: { id: BODY.id }, response_status: 201 };
  const h = harness({ receiptRows: [receipt], applyMutation: async () => { applyCalls += 1; return { responseBody: {}, responseStatus: 201 }; } });
  const result = await executeDomainMutation({ actorId: OWNER, operation: 'createTask', mutationId: MUTATION, requestSha256: HASH, body: BODY, store: h.store });
  assert.equal(result.action, 'replayed');
  assert.equal(applyCalls, 0);
  assert.equal(h.calls.filter((call) => call.sql.startsWith('insert into df_private.mutation_receipts')).length, 0);
});

test('missing owner head fails closed and never runs the mutation applier', async () => {
  let applyCalls = 0;
  const h = harness({ headRows: [], applyMutation: async () => { applyCalls += 1; return { responseBody: {}, responseStatus: 201 }; } });
  await assert.rejects(executeDomainMutation({ actorId: OWNER, operation: 'createTask', mutationId: MUTATION, requestSha256: HASH, body: BODY, store: h.store }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(applyCalls, 0);
  assert.equal(h.committed, false);
});

test('inactive owner profile fails closed before locking the mutation head', async () => {
  let applyCalls = 0;
  const h = harness({ profileRows: [{ owner_id: OWNER, account_state: 'disabled' }], applyMutation: async () => { applyCalls += 1; return { responseBody: {}, responseStatus: 201 }; } });
  await assert.rejects(executeDomainMutation({ actorId: OWNER, operation: 'createTask', mutationId: MUTATION, requestSha256: HASH, body: BODY, store: h.store }), /ACCESS_DENIED/);
  assert.equal(applyCalls, 0);
  assert.equal(h.calls.some((call) => call.sql.includes('sync_heads')), false);
});

test('active app session is rechecked inside the transaction before mutation', async () => {
  let applyCalls = 0;
  const h = harness({ applyMutation: async (...args) => { applyCalls += 1; return { responseBody: { id: BODY.id }, responseStatus: 201 }; } });
  const result = await executeDomainMutation({ actorId: OWNER, sessionId: SESSION, operation: 'createTask', mutationId: MUTATION, requestSha256: HASH, body: BODY, store: h.store });
  assert.equal(result.action, 'applied');
  assert.equal(applyCalls, 1);
  assert.equal(h.calls.filter((call) => call.sql.includes('app_sessions')).length, 1);
  assert.equal(h.calls.findIndex((call) => call.sql.includes('app_sessions')) < h.calls.findIndex((call) => call.sql.includes('sync_heads')), true);
});

test('revoked or missing app session fails closed before locking the mutation head', async () => {
  let applyCalls = 0;
  for (const sessionRows of [[{ owner_id: OWNER, session_id: SESSION, status: 'revoked', revoked_at: '2026-10-10T00:00:00.000Z' }], []]) {
    const h = harness({ sessionRows, applyMutation: async () => { applyCalls += 1; return { responseBody: {}, responseStatus: 201 }; } });
    await assert.rejects(executeDomainMutation({ actorId: OWNER, sessionId: SESSION, operation: 'createTask', mutationId: MUTATION, requestSha256: HASH, body: BODY, store: h.store }), /AUTH_REQUIRED/);
    assert.equal(h.calls.some((call) => call.sql.includes('sync_heads')), false);
  }
  assert.equal(applyCalls, 0);
});

test('foreign-shaped receipt data is not returned as a trusted replay', async () => {
  const h = harness({ receiptRows: [{ owner_id: OWNER, operation: 'createTask', mutation_id: MUTATION, request_sha256: HASH, response_body: [], response_status: 201 }] });
  await assert.rejects(executeDomainMutation({ actorId: OWNER, operation: 'createTask', mutationId: MUTATION, requestSha256: HASH, body: BODY, store: h.store }), /DEPENDENCY_UNAVAILABLE/);
});

test('foreign receipt identity fails closed even when its payload is otherwise valid', async () => {
  const h = harness({ receiptRows: [{ owner_id: '44444444-4444-4444-8444-444444444444', operation: 'createTask', mutation_id: MUTATION, request_sha256: HASH, response_body: { id: BODY.id }, response_status: 201 }] });
  await assert.rejects(executeDomainMutation({ actorId: OWNER, operation: 'createTask', mutationId: MUTATION, requestSha256: HASH, body: BODY, store: h.store }), /DEPENDENCY_UNAVAILABLE/);
});

test('receipt write fails closed when the database returns no inserted row', async () => {
  const h = harness({ receiptInsertRows: [] });
  await assert.rejects(executeDomainMutation({ actorId: OWNER, operation: 'createTask', mutationId: MUTATION, requestSha256: HASH, body: BODY, store: h.store }), /DEPENDENCY_UNAVAILABLE/);
});

test('receipt write fails closed when the inserted row has foreign identity metadata', async () => {
  const h = harness({ receiptInsertRows: [{ owner_id: '44444444-4444-4444-8444-444444444444', operation: 'createTask', mutation_id: MUTATION }] });
  await assert.rejects(executeDomainMutation({ actorId: OWNER, operation: 'createTask', mutationId: MUTATION, requestSha256: HASH, body: BODY, store: h.store }), /DEPENDENCY_UNAVAILABLE/);
});

test('sync sequence can finalize a response before the durable receipt is written', async () => {
  const h = harness({
    writeSyncChange: async () => '42',
    applyMutation: async () => ({ responseBody: { pending: true }, responseStatus: 200, finalizeResponse: (committedThrough) => ({ committedThrough }) }),
  });
  const result = await executeDomainMutation({ actorId: OWNER, operation: 'createTask', mutationId: MUTATION, requestSha256: HASH, body: BODY, store: h.store });
  assert.deepEqual(result.receipt.responseBody, { committedThrough: '42' });
  const receiptInsert = h.calls.find((call) => call.sql.startsWith('insert into df_private.mutation_receipts'));
  assert.deepEqual(JSON.parse(receiptInsert.params[4]), { committedThrough: '42' });
});
