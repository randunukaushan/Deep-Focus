import test from 'node:test';
import assert from 'node:assert/strict';

const { createPostgresAiProposalStore } = await import('../../supabase/functions/_shared/postgres-ai-proposal-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const PROPOSAL = '22222222-2222-4222-8222-222222222222';
const REQUEST = '33333333-3333-4333-8333-333333333333';
const OPERATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);
const NOW = '2026-10-11T00:00:00.000Z';
const EXPIRY = '2026-10-11T01:00:00.000Z';

function record(overrides = {}) {
  return { ownerId: OWNER, id: PROPOSAL, contractVersion: 1, version: 1, generationRequestId: REQUEST, actionType: 'break_down_task', expiresAt: EXPIRY, reviewDigest: HASH, state: 'ready', inputVersions: [], operations: [{ id: OPERATION, dependsOn: [] }], selectedOperationIds: null, appliedAt: null, ...overrides };
}

function harness(rows = []) {
  const calls = [];
  return {
    calls,
    runner: { withTransaction: async (run) => run({ query: async (sql, params) => { calls.push({ sql, params }); return { rows: calls.length === 1 ? rows : [] }; } }) },
  };
}

test('creates a ready proposal with parameterized JSON and no prompt field', async () => {
  const h = harness([{
    owner_id: OWNER, id: PROPOSAL, contract_version: 1, version: 1, generation_request_id: REQUEST,
    action_type: 'break_down_task', expires_at: EXPIRY, review_digest: HASH, state: 'ready',
    input_versions: [], operations: [{ id: OPERATION, dependsOn: [] }], selected_operation_ids: null, applied_at: null,
  }]);
  const result = await createPostgresAiProposalStore({ runner: h.runner }).withOwnerTransaction(OWNER, (tx) => tx.create(record(), NOW));
  assert.equal(result.id, PROPOSAL);
  assert.match(h.calls[0].sql, /on conflict \(owner_id, generation_request_id, version\) do nothing/i);
  assert.equal(h.calls[0].sql.toLowerCase().includes('prompt'), false);
  assert.equal(h.calls[0].params[8], '[]');
});

test('replays an identical generation request without inserting a duplicate', async () => {
  const existing = { owner_id: OWNER, id: PROPOSAL, contract_version: 1, version: 1, generation_request_id: REQUEST, action_type: 'break_down_task', expires_at: EXPIRY, review_digest: HASH, state: 'ready', input_versions: [], operations: [{ id: OPERATION, dependsOn: [] }], selected_operation_ids: null, applied_at: null };
  const h = harness([]);
  h.runner = { withTransaction: async (run) => run({ query: async (sql, params) => { h.calls.push({ sql, params }); return sql.trimStart().startsWith('insert') ? { rows: [] } : { rows: [existing] }; } }) };
  const result = await createPostgresAiProposalStore({ runner: h.runner }).withOwnerTransaction(OWNER, (tx) => tx.create(record(), NOW));
  assert.equal(result.id, PROPOSAL);
  assert.equal(h.calls.length, 2);
});

test('treats PostgreSQL jsonb key reordering as the same generation intent', async () => {
  const existing = { owner_id: OWNER, id: PROPOSAL, contract_version: 1, version: 1, generation_request_id: REQUEST, action_type: 'break_down_task', expires_at: EXPIRY, review_digest: HASH, state: 'ready', input_versions: [{ z: 1, a: 2 }], operations: [{ dependsOn: [], id: OPERATION }], selected_operation_ids: null, applied_at: null };
  const h = harness([]);
  h.runner = { withTransaction: async (run) => run({ query: async (sql) => { h.calls.push({ sql }); return sql.trimStart().startsWith('insert') ? { rows: [] } : { rows: [existing] }; } }) };
  const result = await createPostgresAiProposalStore({ runner: h.runner }).withOwnerTransaction(OWNER, (tx) => tx.create(record({ inputVersions: [{ a: 2, z: 1 }], operations: [{ id: OPERATION, dependsOn: [] }] }), NOW));
  assert.equal(result.id, PROPOSAL);
});

test('rejects a changed payload for an existing generation request', async () => {
  const existing = { owner_id: OWNER, id: PROPOSAL, contract_version: 1, version: 1, generation_request_id: REQUEST, action_type: 'break_down_task', expires_at: EXPIRY, review_digest: 'b'.repeat(64), state: 'ready', input_versions: [], operations: [{ id: OPERATION, dependsOn: [] }], selected_operation_ids: null, applied_at: null };
  const h = harness([]);
  h.runner = { withTransaction: async (run) => run({ query: async (sql) => { h.calls.push({ sql }); return sql.trimStart().startsWith('insert') ? { rows: [] } : { rows: [existing] }; } }) };
  await assert.rejects(() => createPostgresAiProposalStore({ runner: h.runner }).withOwnerTransaction(OWNER, (tx) => tx.create(record(), NOW)), (error) => error?.code === 'AI_PROPOSAL_MISMATCH');
});

test('fails closed for expired, applied, or empty proposals', async () => {
  const store = createPostgresAiProposalStore({ runner: { withTransaction: async (run) => run({ query: async () => { throw new Error('must not query'); } }) } });
  for (const invalid of [record({ expiresAt: NOW }), record({ state: 'applied' }), record({ operations: [] })]) {
    await assert.rejects(() => store.withOwnerTransaction(OWNER, (tx) => tx.create(invalid, NOW)), /VALIDATION_FAILED/);
  }
});

test('proposal adapter rejects malformed runner, operation and query-result dependencies safely', async () => {
  assert.throws(() => createPostgresAiProposalStore(null), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresAiProposalStore({ runner: { withTransaction: 'not-a-function' } }), /VALIDATION_FAILED/);
  const store = createPostgresAiProposalStore({ runner: { withTransaction: async () => { throw new Error('must not open'); } } });
  assert.throws(() => store.withOwnerTransaction(OWNER, null), /VALIDATION_FAILED/);
  const malformed = createPostgresAiProposalStore({ runner: { withTransaction: async (run) => run({ query: async () => ({ rows: null }) }) } });
  await assert.rejects(() => malformed.withOwnerTransaction(OWNER, (tx) => tx.load(OWNER, PROPOSAL)), /DEPENDENCY_UNAVAILABLE/);
});
