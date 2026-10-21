import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresAiGenerationAdmissionAdapter } = await import('../../supabase/functions/_shared/postgres-ai-generation-admission-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const REQUEST = '33333333-3333-4333-8333-333333333333';
const RESERVATION = '44444444-4444-4444-8444-444444444444';
const DISPATCH = '55555555-5555-4555-8555-555555555555';
const TASK = '66666666-6666-4666-8666-666666666666';
const HASH = 'a'.repeat(64);
const NOW = '2026-10-11T00:00:00.000Z';

const request = { ownerId: OWNER, requestId: REQUEST, reservationId: RESERVATION, dispatchKey: DISPATCH, intentSha256: HASH, inputSnapshot: { taskIds: [TASK] }, inputVersions: [{ taskId: TASK, version: 1 }], createdAt: NOW, deadlineAt: '2026-10-11T00:05:00.000Z' };

function harness({ existing = null, existingRows = null, receipt = null, entitlement = true, reservationCommit = true, requestInserted = true } = {}) {
  const calls = [];
  const client = { query: async (sql, params) => {
    const normalized = sql.replace(/\s+/g, ' ').trim(); calls.push({ sql: normalized, params });
    if (normalized.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    if (normalized.includes('from df_private.ai_generation_requests') && normalized.includes('status from')) return { rows: existingRows ?? (existing ? [existing] : []) };
    if (normalized.includes('from df_private.usage_reservation_receipts')) return { rows: receipt ? [receipt] : [] };
    if (normalized.includes('from df_private.server_entitlements')) return entitlement ? { rows: [{ owner_id: OWNER, capability: 'ai', status: 'active', verified_by: 'server', policy_version: 'p1', expires_at: null, offer_id: null }] } : { rows: [] };
    if (normalized.startsWith('select owner_id, capability, period_key, limit_units')) return { rows: [{ owner_id: OWNER, capability: 'ai', period_key: '2026-10', limit_units: 3, consumed_units: 0, reserved_units: 0, policy_version: 'p1' }] };
    if (normalized.startsWith('update df_private.capability_allowances')) return reservationCommit ? { rows: [{ owner_id: OWNER, capability: 'ai', period_key: '2026-10', limit_units: 3, consumed_units: 0, reserved_units: 1, policy_version: 'p1' }] } : { rows: [] };
    if (normalized.startsWith('insert into df_private.usage_reservation_receipts')) return reservationCommit ? { rows: [{ receipt_id: params[1], owner_id: params[0], capability: params[2], period_key: params[3], units: params[4], policy_version: params[5], remaining_units: params[6], status: 'reserved' }] } : { rows: [] };
    if (normalized.startsWith('insert into df_private.ai_generation_requests')) return existing ? { rows: [] } : (requestInserted ? { rows: [{ owner_id: OWNER, request_id: REQUEST, intent_sha256: HASH, reservation_id: RESERVATION }] } : { rows: [] });
    if (normalized.startsWith('insert into df_private.ai_generation_jobs')) return { rows: [{ owner_id: OWNER, request_id: REQUEST, dispatch_key: DISPATCH }] };
    if (normalized.includes('select owner_id, request_id, intent_sha256')) return { rows: existing ? [existing] : [] };
    if (normalized.includes('select owner_id, request_id, dispatch_key')) return { rows: [{ owner_id: OWNER, request_id: REQUEST, dispatch_key: DISPATCH }] };
    if (normalized.includes('from df_private.ai_generation_requests') && normalized.includes('action_type')) return { rows: [{ owner_id: OWNER, request_id: REQUEST, action_type: 'plan_my_day', version: 1, created_at: NOW, updated_at: NOW, deadline_at: request.deadlineAt, status: 'pending', completed_at: null, failure_code: null, reserved_actions: 1, consumed_actions: 0, proposal_id: null, proposal_contract_version: null }] };
    return { rows: [] };
  } };
  return { calls, runner: { withTransaction: async (run) => run(client) } };
}

function input(h) { return { ownerId: OWNER, sessionId: SESSION, now: NOW, periodKey: '2026-10', request, runner: h.runner }; }

test('atomic admission reserves usage before creating the request and job', async () => {
  const h = harness();
  const result = await createPostgresAiGenerationAdmissionAdapter(h).accept(input(h));
  assert.equal(result.status.status, 'pending');
  const names = h.calls.map((call) => call.sql.split(' ')[0]);
  assert.ok(h.calls.findIndex((call) => call.sql.startsWith('insert into df_private.usage_reservation_receipts')) < h.calls.findIndex((call) => call.sql.startsWith('insert into df_private.ai_generation_requests')));
  assert.equal(names.includes('insert'), true);
});

test('pending request with a missing reservation fails closed instead of repairing state', async () => {
  const h = harness({ existing: { owner_id: OWNER, request_id: REQUEST, status: 'pending' } });
  await assert.rejects(() => createPostgresAiGenerationAdmissionAdapter(h).accept(input(h)), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(h.calls.some((call) => call.sql.startsWith('update df_private.capability_allowances')), false);
});

test('admission fails closed when the existing-request result is sparse', async () => {
  const sparse = [];
  sparse[1] = { owner_id: OWNER, request_id: REQUEST, status: 'pending' };
  const h = harness({ existingRows: sparse });
  await assert.rejects(() => createPostgresAiGenerationAdmissionAdapter(h).accept(input(h)), /DEPENDENCY_UNAVAILABLE/);
});

test('identical pending replay reuses the locked reservation without another allowance write', async () => {
  const h = harness({
    existing: { owner_id: OWNER, request_id: REQUEST, intent_sha256: HASH, reservation_id: RESERVATION, status: 'pending' },
    receipt: { owner_id: OWNER, receipt_id: RESERVATION, capability: 'ai', period_key: '2026-10', units: 1, policy_version: 'p1', remaining_units: 2, status: 'reserved' },
  });
  const result = await createPostgresAiGenerationAdmissionAdapter(h).accept(input(h));
  assert.equal(result.replayed, true);
  assert.equal(h.calls.some((call) => call.sql.startsWith('update df_private.capability_allowances')), false);
  assert.equal(h.calls.some((call) => call.sql.startsWith('insert into df_private.usage_reservation_receipts')), false);
  assert.equal(h.calls.some((call) => call.sql.startsWith('insert into df_private.ai_generation_jobs')), false);
});

test('reservation denial prevents request/job creation', async () => {
  const h = harness({ entitlement: false });
  await assert.rejects(() => createPostgresAiGenerationAdmissionAdapter(h).accept(input(h)), /AI_FEATURE_DISABLED/);
  assert.equal(h.calls.some((call) => call.sql.includes('ai_generation_requests') && call.sql.startsWith('insert')), false);
});

test('invalid identity fails before opening a transaction', async () => {
  let opened = false;
  const runner = { withTransaction: async () => { opened = true; throw new Error('must not run'); } };
  assert.throws(() => createPostgresAiGenerationAdmissionAdapter({ runner }).accept({ ...input({}), ownerId: 'bad' }), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});

test('malformed generation input fails before session or allowance work', () => {
  const h = harness();
  assert.throws(() => createPostgresAiGenerationAdmissionAdapter(h).accept({
    ...input(h),
    request: { ...request, reservationId: Symbol('reservation') },
  }), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresAiGenerationAdmissionAdapter(h).accept({
    ...input(h),
    periodKey: Symbol('period'),
  }), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('admission rejects malformed runner and client dependencies before state changes', async () => {
  assert.throws(() => createPostgresAiGenerationAdmissionAdapter(null), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresAiGenerationAdmissionAdapter({ runner: { withTransaction: 'nope' } }), /VALIDATION_FAILED/);
  const malformed = createPostgresAiGenerationAdmissionAdapter({ runner: { withTransaction: async (run) => run(null) } });
  await assert.rejects(() => malformed.accept({ ownerId: OWNER, sessionId: SESSION, now: NOW, periodKey: '2026-10', request }), /DEPENDENCY_UNAVAILABLE/);
});
