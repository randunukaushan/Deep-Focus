import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresAiGenerationCancellationStore } = await import('../../supabase/functions/_shared/postgres-ai-generation-cancellation-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const REQUEST = '22222222-2222-4222-8222-222222222222';
const MUTATION = '33333333-3333-4333-8333-333333333333';
const RESERVATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);
const NOW = '2026-10-11T00:01:00.000Z';
const DEADLINE = '2026-10-11T00:05:00.000Z';

function requestRow(overrides = {}) { return { owner_id: OWNER, request_id: REQUEST, action_type: 'plan_my_day', version: 1, created_at: '2026-10-11T00:00:00.000Z', updated_at: '2026-10-11T00:00:00.000Z', deadline_at: DEADLINE, status: 'pending', completed_at: null, failure_code: null, reserved_actions: 1, consumed_actions: 0, proposal_id: null, proposal_contract_version: null, reservation_id: RESERVATION, ...overrides }; }

function harness({ request = requestRow(), receipt = null, insertedReceipt = null, update = null, reservation = true, acknowledgement = true } = {}) {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    const normalized = sql.replace(/\s+/g, ' ').trim(); calls.push({ sql: normalized, params });
    if (normalized.includes('from df_private.ai_generation_cancel_receipts')) return { rows: receipt ? [receipt] : [] };
    if (normalized.includes('from df_private.ai_generation_requests')) return { rows: [request] };
    if (normalized.includes('from df_private.usage_reservation_receipts')) return { rows: reservation ? [{ owner_id: OWNER, receipt_id: RESERVATION, capability: 'ai', period_key: '2026-10', units: 1, policy_version: 'p1', status: 'reserved' }] : [] };
    if (normalized.startsWith('update df_private.capability_allowances')) return { rows: reservation ? [{ owner_id: OWNER, capability: 'ai', period_key: '2026-10' }] : [] };
    if (normalized.startsWith("update df_private.usage_reservation_receipts")) return { rows: reservation ? [{ owner_id: OWNER, receipt_id: RESERVATION, status: 'released' }] : [] };
    if (normalized.startsWith('update df_private.ai_generation_requests')) return acknowledgement ? { rows: [update ?? requestRow({ status: 'cancelled', version: 2, updated_at: NOW, completed_at: NOW, reserved_actions: 0 })] } : { rows: [] };
    if (normalized.startsWith('insert into df_private.ai_generation_cancel_receipts')) { const responseBody = JSON.parse(params[5]); return { rows: [insertedReceipt ?? { owner_id: params[0], request_id: params[1], mutation_id: params[2], request_sha256: params[3], outcome: params[4], response_body: responseBody, response_status: 200 }] }; }
    return { rows: [] };
  } }) };
  return { runner, calls };
}

function input(overrides = {}) { return { ownerId: OWNER, requestId: REQUEST, mutationId: MUTATION, requestSha256: HASH, now: NOW, ...overrides }; }

test('pending cancellation releases usage, updates request and writes a receipt in order', async () => {
  const h = harness();
  const result = await createPostgresAiGenerationCancellationStore(h).cancel(input());
  assert.equal(result.outcome, 'cancelled');
  assert.equal(result.request.status, 'cancelled');
  const names = h.calls.map((call) => call.sql.split(' ')[0]);
  assert.ok(h.calls.findIndex((call) => call.sql.includes('from df_private.usage_reservation_receipts')) < h.calls.findIndex((call) => call.sql.startsWith('update df_private.ai_generation_requests')));
  assert.ok(h.calls.findIndex((call) => call.sql.startsWith('update df_private.ai_generation_requests')) < h.calls.findIndex((call) => call.sql.startsWith('insert into df_private.ai_generation_cancel_receipts')));
  assert.equal(names.length > 0, true);
});

test('matching mutation replay returns the stored response without request or usage writes', async () => {
  const stored = { owner_id: OWNER, request_id: REQUEST, mutation_id: MUTATION, request_sha256: HASH, outcome: 'cancelled', response_body: { outcome: 'cancelled', request: { requestId: REQUEST, actionType: 'plan_my_day', version: 2, createdAt: '2026-10-11T00:00:00.000Z', updatedAt: NOW, deadlineAt: DEADLINE, status: 'cancelled', completedAt: NOW, result: null, failureCode: null, reservedActions: 0, consumedActions: 0 } }, response_status: 200 };
  const h = harness({ receipt: stored });
  const result = await createPostgresAiGenerationCancellationStore(h).cancel(input());
  assert.equal(result.replayed, true);
  assert.equal(h.calls.some((call) => call.sql.includes('from df_private.ai_generation_requests')), false);
});

test('missing reservation or request update acknowledgement fails without reporting cancellation', async () => {
  await assert.rejects(() => createPostgresAiGenerationCancellationStore(harness({ reservation: false })).cancel(input()), /DEPENDENCY_UNAVAILABLE/);
  await assert.rejects(() => createPostgresAiGenerationCancellationStore(harness({ acknowledgement: false })).cancel(input()), /DEPENDENCY_UNAVAILABLE/);
});

test('cancellation fails closed when the database returns an altered receipt response', async () => {
  const h = harness({ insertedReceipt: { owner_id: OWNER, request_id: REQUEST, mutation_id: MUTATION, request_sha256: HASH, outcome: 'cancelled', response_body: { outcome: 'cancelled', request: { requestId: REQUEST, actionType: 'plan_my_day', version: 99, createdAt: '2026-10-11T00:00:00.000Z', updatedAt: NOW, deadlineAt: DEADLINE, status: 'cancelled', completedAt: NOW, result: null, failureCode: null, reservedActions: 0, consumedActions: 0 } }, response_status: 200 } });
  await assert.rejects(() => createPostgresAiGenerationCancellationStore(h).cancel(input()), /DEPENDENCY_UNAVAILABLE/);
});

test('cancellation fails closed when a stored receipt uses a coercion-prone response object', async () => {
  class StoredReceiptBody {
    constructor() {
      this.outcome = 'cancelled';
      this.request = {
        requestId: REQUEST, actionType: 'plan_my_day', version: 2,
        createdAt: '2026-10-11T00:00:00.000Z', updatedAt: NOW, deadlineAt: DEADLINE,
        status: 'cancelled', completedAt: NOW, result: null, failureCode: null,
        reservedActions: 0, consumedActions: 0,
      };
    }
  }
  const h = harness({ receipt: {
    owner_id: OWNER, request_id: REQUEST, mutation_id: MUTATION, request_sha256: HASH,
    outcome: 'cancelled', response_body: new StoredReceiptBody(), response_status: 200,
  } });
  await assert.rejects(() => createPostgresAiGenerationCancellationStore(h).cancel(input()), /DEPENDENCY_UNAVAILABLE/);
});

test('terminal cancellation records its outcome without rewriting terminal timestamps', async () => {
  const h = harness({ request: requestRow({ status: 'completed', updated_at: '2026-10-11T00:00:30.000Z', completed_at: '2026-10-11T00:00:30.000Z', reserved_actions: 0, consumed_actions: 1, proposal_id: '55555555-5555-4555-8555-555555555555', proposal_contract_version: 2 }) });
  const result = await createPostgresAiGenerationCancellationStore(h).cancel(input());
  assert.equal(result.outcome, 'already_terminal');
  assert.equal(result.request.status, 'completed');
  assert.equal(result.request.completedAt, '2026-10-11T00:00:30.000Z');
  assert.equal(h.calls.some((call) => call.sql.startsWith('update df_private.ai_generation_requests')), false);
  assert.equal(h.calls.some((call) => call.sql.includes('from df_private.usage_reservation_receipts')), false);
});

test('foreign receipt and malformed identity fail closed', async () => {
  const h = harness({ receipt: { owner_id: '55555555-5555-4555-8555-555555555555', request_id: REQUEST, mutation_id: MUTATION, request_sha256: HASH, outcome: 'cancelled', response_body: {}, response_status: 200 } });
  await assert.rejects(() => createPostgresAiGenerationCancellationStore(h).cancel(input()), /DEPENDENCY_UNAVAILABLE/);
  let calls = 0;
  const noQuery = { withTransaction: async (run) => run({ query: async () => { calls += 1; return { rows: [] }; } }) };
  assert.throws(() => createPostgresAiGenerationCancellationStore({ runner: noQuery }).cancel(input({ ownerId: 'bad' })), /VALIDATION_FAILED/);
  assert.equal(calls, 0);
});

test('cancellation validates runtime inputs before opening a transaction', () => {
  let opened = false;
  const runner = { withTransaction: async () => { opened = true; throw new Error('must not open'); } };
  assert.throws(() => createPostgresAiGenerationCancellationStore({ runner }).cancel(input({ ownerId: Symbol('owner') })), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresAiGenerationCancellationStore({ runner }).cancel(input({ requestSha256: Symbol('hash') })), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});

test('cancellation rejects malformed runner and client dependencies before state access', async () => {
  assert.throws(() => createPostgresAiGenerationCancellationStore(null), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresAiGenerationCancellationStore({ runner: { withTransaction: 'nope' } }), /VALIDATION_FAILED/);
  const store = createPostgresAiGenerationCancellationStore({ runner: { withTransaction: async (run) => run(null) } });
  await assert.rejects(() => store.cancel(input()), /DEPENDENCY_UNAVAILABLE/);
});

test('cancellation fails closed on sparse reservation rows before allowance writes', async () => {
  const sparse = [];
  sparse[1] = { owner_id: OWNER, receipt_id: RESERVATION, capability: 'ai', period_key: '2026-10', units: 1, policy_version: 'p1', status: 'reserved' };
  let allowanceWrites = 0;
  const runner = { withTransaction: async (run) => run({ query: async (sql) => {
    if (sql.includes('from df_private.ai_generation_cancel_receipts')) return { rows: [] };
    if (sql.includes('from df_private.ai_generation_requests')) return { rows: [requestRow()] };
    if (sql.includes('from df_private.usage_reservation_receipts')) return { rows: sparse };
    allowanceWrites += 1;
    return { rows: [] };
  } }) };
  await assert.rejects(() => createPostgresAiGenerationCancellationStore({ runner }).cancel(input()), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(allowanceWrites, 0);
});
