import assert from 'node:assert/strict';
import test from 'node:test';

const { createAiGenerationRequestInTransaction, createPostgresAiGenerationRequestCreator } = await import('../../supabase/functions/_shared/postgres-ai-generation-request-creator.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const REQUEST = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const RESERVATION = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const DISPATCH = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const HASH = 'a'.repeat(64);
const BASE = { ownerId: OWNER, requestId: REQUEST, reservationId: RESERVATION, dispatchKey: DISPATCH, intentSha256: HASH,
  inputSnapshot: { taskIds: ['dddddddd-dddd-4ddd-8ddd-dddddddddddd'] }, inputVersions: [{ taskId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', version: 1 }],
  createdAt: '2026-10-11T00:00:00.000Z', deadlineAt: '2026-10-11T00:05:00.000Z' };

const status = { owner_id: OWNER, request_id: REQUEST, action_type: 'plan_my_day', version: 1,
  created_at: BASE.createdAt, updated_at: BASE.createdAt, deadline_at: BASE.deadlineAt, status: 'pending', completed_at: null,
  failure_code: null, reserved_actions: 1, consumed_actions: 0, proposal_id: null, proposal_contract_version: null };

function harness({ existing = null, job = true } = {}) {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('insert into df_private.ai_generation_requests')) return existing ? { rows: [] } : { rows: [{ owner_id: OWNER, request_id: REQUEST, intent_sha256: HASH, reservation_id: RESERVATION }] };
    if (sql.includes('insert into df_private.ai_generation_jobs')) return { rows: [{ owner_id: OWNER, request_id: REQUEST, dispatch_key: DISPATCH }] };
    if (sql.includes('select owner_id, request_id, intent_sha256')) return { rows: existing ? [existing] : [] };
    if (sql.includes('select owner_id, request_id, dispatch_key from df_private.ai_generation_jobs')) return { rows: job ? [{ owner_id: OWNER, request_id: REQUEST, dispatch_key: DISPATCH }] : [] };
    if (sql.includes('from df_private.ai_generation_requests') && sql.includes('select owner_id, request_id, action_type')) return { rows: [status] };
    return { rows: [] };
  } };
  return { calls, runner: { withTransaction: async (run) => run(client) } };
}

test('creates request and queued job atomically, then returns public pending status', async () => {
  const h = harness();
  const result = await createPostgresAiGenerationRequestCreator({ runner: h.runner }).create(BASE);
  assert.equal(result.replayed, false);
  assert.equal(result.status.status, 'pending');
  assert.equal(h.calls.filter((call) => call.sql.startsWith('insert into df_private.ai_generation_requests')).length, 1);
  assert.equal(h.calls.filter((call) => call.sql.startsWith('insert into df_private.ai_generation_jobs')).length, 1);
});

test('identical request replay returns existing status without a second job', async () => {
  const h = harness({ existing: { owner_id: OWNER, request_id: REQUEST, intent_sha256: HASH, reservation_id: RESERVATION, status: 'pending' } });
  const result = await createPostgresAiGenerationRequestCreator({ runner: h.runner }).create(BASE);
  assert.equal(result.replayed, true);
  assert.equal(h.calls.filter((call) => call.sql.startsWith('insert into df_private.ai_generation_jobs')).length, 0);
});

test('changed intent replay is rejected before status is returned', async () => {
  const h = harness({ existing: { owner_id: OWNER, request_id: REQUEST, intent_sha256: 'b'.repeat(64), reservation_id: RESERVATION, status: 'pending' } });
  await assert.rejects(() => createPostgresAiGenerationRequestCreator({ runner: h.runner }).create(BASE), /IDEMPOTENCY_CONFLICT/);
});

test('pending replay fails closed when its durable job is missing', async () => {
  const h = harness({ existing: { owner_id: OWNER, request_id: REQUEST, intent_sha256: HASH, reservation_id: RESERVATION, status: 'pending' }, job: false });
  await assert.rejects(() => createPostgresAiGenerationRequestCreator({ runner: h.runner }).create(BASE), /DEPENDENCY_UNAVAILABLE/);
});

test('replay rejects a changed reservation identity before returning status', async () => {
  const h = harness({ existing: { owner_id: OWNER, request_id: REQUEST, intent_sha256: HASH, reservation_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', status: 'pending' } });
  await assert.rejects(() => createPostgresAiGenerationRequestCreator({ runner: h.runner }).create(BASE), /IDEMPOTENCY_CONFLICT/);
  assert.equal(h.calls.some((call) => call.sql.includes('from df_private.ai_generation_requests') && call.sql.includes('action_type')), false);
});

test('pending replay rejects a changed dispatch identity before returning status', async () => {
  const h = harness({ existing: { owner_id: OWNER, request_id: REQUEST, intent_sha256: HASH, reservation_id: RESERVATION, status: 'pending' } });
  await assert.rejects(() => createPostgresAiGenerationRequestCreator({ runner: h.runner }).create({ ...BASE, dispatchKey: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' }), /IDEMPOTENCY_CONFLICT/);
});

test('invalid deadline or identity fails before opening a transaction', async () => {
  let opened = false;
  const runner = { withTransaction: async () => { opened = true; throw new Error('must not open'); } };
  let error;
  try { await createPostgresAiGenerationRequestCreator({ runner }).create({ ...BASE, deadlineAt: BASE.createdAt }); } catch (caught) { error = caught; }
  assert.equal(error?.code, 'VALIDATION_FAILED');
  assert.equal(opened, false);
});

test('request creator rejects runtime type confusion and non-serializable snapshots before SQL', async () => {
  let opened = false;
  const runner = { withTransaction: async () => { opened = true; throw new Error('must not open'); } };
  assert.throws(() => createPostgresAiGenerationRequestCreator({ runner }).create({ ...BASE, ownerId: Symbol('owner') }), /VALIDATION_FAILED/);
  const snapshot = { toJSON: () => undefined };
  assert.throws(() => createPostgresAiGenerationRequestCreator({ runner }).create({ ...BASE, inputSnapshot: snapshot }), /VALIDATION_FAILED/);
  await assert.rejects(() => createAiGenerationRequestInTransaction({}, null), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});

test('request creator rejects JSON-coercible snapshot and version values before SQL', async () => {
  const runner = { withTransaction: async () => { throw new Error('must not open'); } };
  class CustomValue { constructor() { this.value = 'hidden-shape'; } }
  const sparse = []; sparse[1] = 'gap';
  for (const inputSnapshot of [{ when: new Date('2026-10-10T00:00:00.000Z') }, { custom: new CustomValue() }, { values: sparse }]) {
    assert.throws(() => createPostgresAiGenerationRequestCreator({ runner }).create({ ...BASE, inputSnapshot }), /VALIDATION_FAILED/);
  }
  assert.throws(() => createPostgresAiGenerationRequestCreator({ runner }).create({ ...BASE, inputVersions: [{ when: new Date('2026-10-10T00:00:00.000Z') }] }), /VALIDATION_FAILED/);
});

test('request creator rejects malformed runner and client dependencies before SQL', async () => {
  assert.throws(() => createPostgresAiGenerationRequestCreator(null), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresAiGenerationRequestCreator({ runner: { withTransaction: 'nope' } }), /VALIDATION_FAILED/);
  await assert.rejects(() => createAiGenerationRequestInTransaction(null, BASE), /DEPENDENCY_UNAVAILABLE/);
});

test('request creator fails closed on malformed database result containers', async () => {
  const runner = { withTransaction: async (run) => run({ query: async () => ({ rows: null }) }) };
  await assert.rejects(() => createPostgresAiGenerationRequestCreator({ runner }).create(BASE), /DEPENDENCY_UNAVAILABLE/);
});

test('request creator fails closed on sparse database result rows before job creation', async () => {
  const sparse = [];
  sparse[1] = { owner_id: OWNER, request_id: REQUEST, intent_sha256: HASH, reservation_id: RESERVATION };
  let calls = 0;
  const runner = { withTransaction: async (run) => run({ query: async () => { calls += 1; return { rows: sparse }; } }) };
  await assert.rejects(() => createPostgresAiGenerationRequestCreator({ runner }).create(BASE), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(calls, 1);
});
