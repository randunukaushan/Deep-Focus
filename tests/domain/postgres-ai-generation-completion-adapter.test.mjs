import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresAiGenerationCompletionStore } = await import('../../supabase/functions/_shared/postgres-ai-generation-completion-adapter.ts');
const OWNER = '11111111-1111-4111-8111-111111111111';
const REQUEST = '22222222-2222-4222-8222-222222222222';
const WORKER = '33333333-3333-4333-8333-333333333333';
const RECEIPT = '44444444-4444-4444-8444-444444444444';
const PROPOSAL = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-10-11T00:00:00.000Z';
const proposal = { ownerId: OWNER, id: PROPOSAL, contractVersion: 2, version: 1, generationRequestId: REQUEST, actionType: 'plan_my_day', expiresAt: '2026-10-11T01:00:00.000Z', reviewDigest: 'a'.repeat(64), state: 'ready', inputVersions: [], operations: [{ id: '77777777-7777-4777-8777-777777777777' }], selectedOperationIds: null, appliedAt: null };

function harness(overrides = {}) {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    const q = sql.replace(/\s+/g, ' ').trim(); calls.push({ q, params });
    if (q.includes('from df_private.ai_generation_requests') && q.includes('reservation_id')) return { rows: [{ owner_id: OWNER, request_id: REQUEST, status: 'pending', version: 1, deadline_at: '2026-10-11T01:00:00.000Z', completed_at: null, failure_code: null, reserved_actions: 1, consumed_actions: 0, proposal_id: null, proposal_contract_version: null, reservation_id: RECEIPT }] };
    if (q.includes('from df_private.ai_generation_jobs')) return { rows: [{ owner_id: OWNER, request_id: REQUEST, state: 'running', lease_id: WORKER, lease_until: '2026-10-11T00:05:00.000Z', fence: 2 }] };
    if (q.includes('from df_private.usage_reservation_receipts')) return { rows: [{ owner_id: OWNER, receipt_id: RECEIPT, capability: 'ai', period_key: '2026-10', units: 1, policy_version: 'v1', remaining_units: 9, status: 'reserved' }] };
    if (q.startsWith('update df_private.capability_allowances')) return { rows: [{ owner_id: OWNER, capability: 'ai', period_key: '2026-10' }] };
    if (q.startsWith('update df_private.usage_reservation_receipts')) return { rows: [{ owner_id: params[0], receipt_id: params[1], capability: 'ai', period_key: '2026-10', units: 1, policy_version: 'v1', remaining_units: 9, status: params.includes('released') ? 'released' : 'consumed' }] };
    if (q.startsWith('insert into df_private.ai_proposals')) return { rows: [{ owner_id: OWNER, id: PROPOSAL, contract_version: 2, version: 1, generation_request_id: REQUEST, action_type: 'plan_my_day', expires_at: '2026-10-11T01:00:00.000Z', review_digest: 'a'.repeat(64), state: 'ready', input_versions: [], operations: [{ id: '77777777-7777-4777-8777-777777777777' }], selected_operation_ids: null, applied_at: null }] };
    if (q.startsWith('update df_private.ai_generation_requests')) return { rows: [{ owner_id: OWNER, request_id: REQUEST }] };
    if (q.startsWith('update df_private.ai_generation_jobs')) return { rows: [overrides.jobUpdate ?? { owner_id: OWNER, request_id: REQUEST, state: 'reconciling', lease_id: null, lease_until: null, fence: 2 }] };
    if (q.startsWith('select owner_id, request_id, action_type')) return { rows: [{ owner_id: OWNER, request_id: REQUEST, action_type: 'plan_my_day', version: 2, created_at: '2026-10-11T00:00:00.000Z', updated_at: NOW, deadline_at: '2026-10-11T01:00:00.000Z', status: 'completed', completed_at: NOW, failure_code: null, reserved_actions: 0, consumed_actions: 1, proposal_id: PROPOSAL, proposal_contract_version: 2 }] };
    return { rows: [] };
  } }) };
  return { runner, calls };
}

test('completion holds one transaction and settles before terminal request publication', async () => {
  const h = harness();
  const result = await createPostgresAiGenerationCompletionStore(h).complete({ ownerId: OWNER, requestId: REQUEST, workerId: WORKER, fence: 2, now: NOW, outcome: { kind: 'success', proposal } });
  assert.equal(result.settlement, 'consume');
  const names = h.calls.map((call) => call.q);
  const settlementIndex = names.findIndex((q) => q.includes('from df_private.usage_reservation_receipts'));
  const proposalIndex = names.findIndex((q) => q.startsWith('insert into df_private.ai_proposals'));
  assert.ok(settlementIndex >= 0 && settlementIndex < proposalIndex);
  assert.ok(proposalIndex < names.findIndex((q) => q.startsWith('update df_private.ai_generation_requests')));
});

test('foreign proposal identity is rejected before opening a transaction', () => {
  const h = harness();
  assert.throws(() => createPostgresAiGenerationCompletionStore(h).complete({ ownerId: OWNER, requestId: REQUEST, workerId: WORKER, fence: 2, now: NOW, outcome: { kind: 'success', proposal: { ...proposal, ownerId: '77777777-7777-4777-8777-777777777777' } } }), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('invalid live fence fails before reservation settlement', async () => {
  const h = harness();
  await assert.rejects(() => createPostgresAiGenerationCompletionStore(h).complete({ ownerId: OWNER, requestId: REQUEST, workerId: WORKER, fence: 9, now: NOW, outcome: { kind: 'failure', failureCode: 'INVALID_OUTPUT' } }), /INVALID_TRANSITION/);
  assert.equal(h.calls.filter(({ q }) => q.includes('from df_private.usage_reservation_receipts')).length, 0);
});

test('provider failure releases the reservation and never creates a proposal', async () => {
  const h = harness();
  const result = await createPostgresAiGenerationCompletionStore(h).complete({ ownerId: OWNER, requestId: REQUEST, workerId: WORKER, fence: 2, now: NOW, outcome: { kind: 'failure', failureCode: 'PROVIDER_UNAVAILABLE' } });
  assert.equal(result.settlement, 'release');
  assert.equal(h.calls.some(({ q }) => q.startsWith('insert into df_private.ai_proposals')), false);
  assert.equal(h.calls.some(({ q }) => q.startsWith('update df_private.ai_generation_requests')), true);
});

test('late completion after a terminal request is a read-only replay', async () => {
  const h = harness();
  const original = h.runner.withTransaction;
  h.runner.withTransaction = async (run) => original(async (client) => {
    const wrapped = { query: async (sql, params) => {
      const q = sql.replace(/\s+/g, ' ').trim();
      if (q.includes('from df_private.ai_generation_requests') && q.includes('reservation_id')) {
        return { rows: [{ owner_id: OWNER, request_id: REQUEST, status: 'cancelled', version: 2, deadline_at: '2026-10-11T01:00:00.000Z', completed_at: NOW, failure_code: null, reserved_actions: 0, consumed_actions: 0, proposal_id: null, proposal_contract_version: null, reservation_id: RECEIPT }] };
      }
      return client.query(sql, params);
    } };
    return run(wrapped);
  });
  const result = await createPostgresAiGenerationCompletionStore(h).complete({ ownerId: OWNER, requestId: REQUEST, workerId: WORKER, fence: 2, now: NOW, outcome: { kind: 'success', proposal } });
  assert.equal(result.replayed, true);
  assert.equal(result.settlement, 'none');
  assert.equal(h.calls.some(({ q }) => q.includes('usage_reservation_receipts')), false);
});

test('completion rejects a malformed job transition receipt', async () => {
  const h = harness({ jobUpdate: { owner_id: OWNER, request_id: REQUEST, state: 'reconciling', lease_id: null, lease_until: null, fence: 1 } });
  await assert.rejects(() => createPostgresAiGenerationCompletionStore(h).complete({ ownerId: OWNER, requestId: REQUEST, workerId: WORKER, fence: 2, now: NOW, outcome: { kind: 'failure', failureCode: 'PROVIDER_UNAVAILABLE' } }), /DEPENDENCY_UNAVAILABLE/);
});

test('completion fails closed on sparse job rows before reservation settlement', async () => {
  const sparse = [];
  sparse[1] = { owner_id: OWNER, request_id: REQUEST, state: 'running', lease_id: WORKER, lease_until: '2026-10-11T00:05:00.000Z', fence: 2 };
  const h = harness();
  const original = h.runner.withTransaction;
  h.runner.withTransaction = async (run) => original(async (client) => run({ query: async (sql, params) => {
    const q = sql.replace(/\s+/g, ' ').trim();
    if (q.includes('from df_private.ai_generation_jobs')) return { rows: sparse };
    return client.query(sql, params);
  } }));
  await assert.rejects(() => createPostgresAiGenerationCompletionStore(h).complete({ ownerId: OWNER, requestId: REQUEST, workerId: WORKER, fence: 2, now: NOW, outcome: { kind: 'failure', failureCode: 'PROVIDER_UNAVAILABLE' } }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(h.calls.some(({ q }) => q.includes('usage_reservation_receipts')), false);
});
