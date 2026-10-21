import test from 'node:test';
import assert from 'node:assert/strict';

const { createPostgresAiGenerationRequestReader } = await import('../../supabase/functions/_shared/postgres-ai-generation-request-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const REQUEST = '22222222-2222-4222-8222-222222222222';
const PROPOSAL = '33333333-3333-4333-8333-333333333333';
const base = { owner_id: OWNER, request_id: REQUEST, action_type: 'plan_my_day', version: 1, created_at: '2026-10-11T08:00:00.000Z', updated_at: '2026-10-11T08:00:00.000Z', deadline_at: '2026-10-11T09:00:00.000Z', status: 'pending', completed_at: null, failure_code: null, reserved_actions: 1, consumed_actions: 0, proposal_id: null, proposal_contract_version: null };

function client(row = base, rows = row ? [row] : []) {
  const calls = [];
  return { calls, query: async (sql, params) => { calls.push({ sql, params }); return { rows }; } };
}

test('loads only the owner-bound public pending status fields', async () => {
  const c = client({ ...base, input_snapshot: { prompt: 'must not be selected' }, provider_response: 'must not be selected' });
  const result = await createPostgresAiGenerationRequestReader(c).loadStatus(OWNER, REQUEST);
  assert.deepEqual(result, { requestId: REQUEST, actionType: 'plan_my_day', version: 1, createdAt: base.created_at, updatedAt: base.updated_at, deadlineAt: base.deadline_at, status: 'pending', completedAt: null, result: null, failureCode: null, reservedActions: 1, consumedActions: 0 });
  assert.match(c.calls[0].sql, /where owner_id = \$1 and request_id = \$2/i);
  assert.equal(c.calls[0].sql.includes('input_snapshot'), false);
  assert.equal(c.calls[0].sql.includes('provider_response'), false);
  assert.deepEqual(c.calls[0].params, [OWNER, REQUEST]);
});

test('maps a completed row to only its proposal reference', async () => {
  const result = await createPostgresAiGenerationRequestReader(client({ ...base, updated_at: '2026-10-11T08:10:00.000Z', status: 'completed', completed_at: '2026-10-11T08:10:00.000Z', reserved_actions: 0, consumed_actions: 1, proposal_id: PROPOSAL, proposal_contract_version: 2 })).loadStatus(OWNER, REQUEST);
  assert.deepEqual(result?.result, { proposalId: PROPOSAL, contractVersion: 2 });
});

test('returns null for a missing request without inventing a terminal state', async () => {
  assert.equal(await createPostgresAiGenerationRequestReader(client(null)).loadStatus(OWNER, REQUEST), null);
});

test('fails closed when the request result rows are sparse', async () => {
  await assert.rejects(
    () => createPostgresAiGenerationRequestReader(client(base, (() => { const rows = []; rows[1] = base; return rows; })())).loadStatus(OWNER, REQUEST),
    /DEPENDENCY_UNAVAILABLE/,
  );
});

test('rejects malformed identities before querying', async () => {
  let queried = false;
  const reader = createPostgresAiGenerationRequestReader({ query: async () => { queried = true; return { rows: [] }; } });
  await assert.rejects(() => reader.loadStatus('not-an-id', REQUEST), /VALIDATION_FAILED/);
  assert.equal(queried, false);
});

test('fails closed for foreign or malformed returned rows', async () => {
  await assert.rejects(() => createPostgresAiGenerationRequestReader(client({ ...base, owner_id: '44444444-4444-4444-8444-444444444444' })).loadStatus(OWNER, REQUEST), /DEPENDENCY_UNAVAILABLE/);
  await assert.rejects(() => createPostgresAiGenerationRequestReader(client({ ...base, status: 'pending', reserved_actions: 0 })).loadStatus(OWNER, REQUEST), /DEPENDENCY_UNAVAILABLE/);
});

test('status adapter rejects runtime type confusion before exposing a row', async () => {
  let queried = false;
  const reader = createPostgresAiGenerationRequestReader({ query: async () => { queried = true; return { rows: [] }; } });
  await assert.rejects(() => reader.loadStatus(Symbol('owner'), REQUEST), /VALIDATION_FAILED/);
  assert.equal(queried, false);
  await assert.rejects(() => createPostgresAiGenerationRequestReader({ query: async () => ({ rows: [null] }) }).loadStatus(OWNER, REQUEST), /DEPENDENCY_UNAVAILABLE/);
});
