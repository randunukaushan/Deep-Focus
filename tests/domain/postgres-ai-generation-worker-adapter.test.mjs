import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresAiGenerationWorkerStore } = await import('../../supabase/functions/_shared/postgres-ai-generation-worker-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const REQUEST = '22222222-2222-4222-8222-222222222222';
const DISPATCH = '33333333-3333-4333-8333-333333333333';
const WORKER = '44444444-4444-4444-8444-444444444444';
const OTHER = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-10-11T00:00:00.000Z';
const LEASE = '2026-10-11T00:01:00.000Z';

function job(overrides = {}) { return { owner_id: OWNER, request_id: REQUEST, state: 'queued', dispatch_key: DISPATCH, attempt_count: 0, fence: 1, lease_id: null, lease_until: null, last_error_code: null, ...overrides }; }

function harness(row = job(), returnedRow = null) {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    const normalized = sql.replace(/\s+/g, ' ').trim(); calls.push({ sql: normalized, params });
    if (normalized.startsWith('update df_private.ai_generation_jobs')) {
      const reconciling = normalized.includes("set state = 'reconciling'");
      const claim = normalized.includes('fence = $7');
      return { rows: [returnedRow ?? { ...row, state: reconciling ? 'reconciling' : 'running', lease_id: reconciling ? null : claim ? params[2] : row.lease_id, lease_until: reconciling ? null : claim ? params[3] : params[2], fence: claim ? params[4] : row.fence, attempt_count: claim ? params[5] : row.attempt_count, last_error_code: reconciling ? params[2] : null }] };
    }
    if (normalized.includes('from df_private.ai_generation_jobs')) return { rows: [row] };
    return { rows: [] };
  } }) };
  return { runner, calls };
}

test('claim binds owner/request and current fence in SQL', async () => {
  const h = harness();
  const result = await createPostgresAiGenerationWorkerStore(h).claim({ ownerId: OWNER, requestId: REQUEST, workerId: WORKER, now: NOW, leaseUntil: LEASE, maxAttempts: 3 });
  assert.equal(result.state, 'running');
  assert.equal(result.fence, 2);
  assert.match(h.calls.at(-1).sql, /where owner_id = \$1 and request_id = \$2 and fence = \$7/i);
});

test('listDue returns only bounded queued or expired-running work', async () => {
  const h = harness(job({ state: 'running', lease_id: WORKER, lease_until: '2026-10-10T23:59:00.000Z' }));
  const result = await createPostgresAiGenerationWorkerStore(h).listDue({ now: NOW, limit: 10 });
  assert.equal(result[0].state, 'running');
  assert.match(h.calls[0].sql, /lease_until <= \$1/i);
});

test('listDue fails closed when storage returns a sparse job array', async () => {
  const row = job();
  const sparse = [];
  sparse[1] = row;
  const runner = { withTransaction: async (run) => run({ query: async () => ({ rows: sparse }) }) };
  await assert.rejects(() => createPostgresAiGenerationWorkerStore({ runner }).listDue({ now: NOW, limit: 10 }), /DEPENDENCY_UNAVAILABLE/);
});

test('renew and reconcile require the current worker fence', async () => {
  const running = job({ state: 'running', attempt_count: 1, fence: 2, lease_id: WORKER, lease_until: LEASE });
  const renewed = await createPostgresAiGenerationWorkerStore(harness(running)).renew({ ownerId: OWNER, requestId: REQUEST, workerId: WORKER, now: NOW, leaseUntil: '2026-10-11T00:02:00.000Z', fence: 2 });
  assert.equal(renewed.leaseUntil, '2026-10-11T00:02:00.000Z');
  const reconciled = await createPostgresAiGenerationWorkerStore(harness(running)).reconcile({ ownerId: OWNER, requestId: REQUEST, workerId: WORKER, now: NOW, fence: 2, errorCode: 'PROVIDER_UNAVAILABLE' });
  assert.equal(reconciled.state, 'reconciling');
  assert.equal(reconciled.leaseId, null);
});

test('foreign returned rows fail closed and malformed identity does not query', async () => {
  const foreign = harness(job(), job({ owner_id: OTHER }));
  await assert.rejects(() => createPostgresAiGenerationWorkerStore(foreign).claim({ ownerId: OWNER, requestId: REQUEST, workerId: WORKER, now: NOW, leaseUntil: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
  let calls = 0;
  const noQuery = { withTransaction: async (run) => run({ query: async () => { calls += 1; return { rows: [] }; } }) };
  await assert.rejects(() => createPostgresAiGenerationWorkerStore({ runner: noQuery }).claim({ ownerId: 'bad', requestId: REQUEST, workerId: WORKER, now: NOW, leaseUntil: LEASE, maxAttempts: 3 }), /VALIDATION_FAILED/);
  assert.equal(calls, 0);
});

test('worker adapter rejects a returned job with a different dispatch key', async () => {
  const h = harness(job(), job({ dispatch_key: OTHER }));
  await assert.rejects(() => createPostgresAiGenerationWorkerStore(h).claim({ ownerId: OWNER, requestId: REQUEST, workerId: WORKER, now: NOW, leaseUntil: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
});

test('update acknowledgement failure becomes dependency failure', async () => {
  const h = { runner: { withTransaction: async (run) => run({ query: async (sql) => sql.includes('from df_private.ai_generation_jobs') ? { rows: [job()] } : { rows: [] } }) } };
  await assert.rejects(() => createPostgresAiGenerationWorkerStore(h).claim({ ownerId: OWNER, requestId: REQUEST, workerId: WORKER, now: NOW, leaseUntil: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
});

test('worker adapter rejects runtime type confusion before SQL', async () => {
  const h = harness();
  const store = createPostgresAiGenerationWorkerStore(h);
  await assert.rejects(() => store.claim({ ownerId: Symbol('owner'), requestId: REQUEST, workerId: WORKER, now: NOW, leaseUntil: LEASE, maxAttempts: 3 }), /VALIDATION_FAILED/);
  await assert.rejects(() => store.renew({ ownerId: OWNER, requestId: REQUEST, workerId: Symbol('worker'), now: NOW, leaseUntil: LEASE, fence: 1 }), /VALIDATION_FAILED/);
  await assert.rejects(() => store.listDue(null), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('worker claim fails closed on sparse current rows before lease update', async () => {
  const sparse = [];
  sparse[1] = job();
  let updates = 0;
  const runner = { withTransaction: async (run) => run({ query: async (sql) => {
    if (sql.includes('from df_private.ai_generation_jobs')) return { rows: sparse };
    updates += 1;
    return { rows: [] };
  } }) };
  await assert.rejects(() => createPostgresAiGenerationWorkerStore({ runner }).claim({ ownerId: OWNER, requestId: REQUEST, workerId: WORKER, now: NOW, leaseUntil: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(updates, 0);
});

test('worker claim fails closed on sparse acknowledgement rows', async () => {
  const sparse = [];
  sparse[1] = job({ state: 'running', lease_id: WORKER, lease_until: LEASE, fence: 2, attempt_count: 1 });
  const base = harness();
  const runner = { withTransaction: async (run) => base.runner.withTransaction(async (client) => run({ query: async (sql, params) => {
    if (sql.includes('update df_private.ai_generation_jobs')) return { rows: sparse };
    return client.query(sql, params);
  } })) };
  await assert.rejects(() => createPostgresAiGenerationWorkerStore({ runner }).claim({ ownerId: OWNER, requestId: REQUEST, workerId: WORKER, now: NOW, leaseUntil: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
});
