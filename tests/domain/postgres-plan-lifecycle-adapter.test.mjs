import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresPlanLifecycleAdapter, createPostgresPlanActionCandidate } = await import('../../supabase/functions/_shared/postgres-plan-lifecycle-adapter.ts');
const OWNER = '11111111-1111-4111-8111-111111111111';
const PLAN = '22222222-2222-4222-8222-222222222222';
const REMINDER = '33333333-3333-4333-8333-333333333333';
const NOW = '2026-10-11T00:00:00.000Z';

function harness({ state = 'active', version = 2, deleted = null, failReminder = false } = {}) {
  const calls = [];
  const client = { query: async (sql, params) => {
    const q = sql.replace(/\s+/g, ' ').trim(); calls.push({ q, params });
    if (q.includes('from df_private.profiles')) return { rows: [{ owner_id: OWNER, account_state: 'active' }] };
    if (q.includes('from df_private.sync_heads')) return { rows: [{ owner_id: OWNER }] };
    if (q.includes('from df_private.ai_plans')) return { rows: [{ id: PLAN, owner_id: OWNER, state, version, deleted_at: deleted }] };
    if (q.startsWith('select r.id')) return { rows: deleted ? [] : [{ id: REMINDER, version: 4 }] };
    if (q.startsWith('update df_private.task_reminders')) { if (failReminder) throw new Error('injected reminder failure'); return { rows: [{ id: REMINDER, version: 5 }] }; }
    if (q.startsWith('update df_private.ai_plans')) return { rows: [{ id: PLAN, version: version + 1, state: params[2], deleted_at: params[3] } ] };
    return { rows: [] };
  } };
  return { calls, runner: { withTransaction: async (run) => run(client) } };
}

test('archive locks owner head, disables the exact reminder and advances plan once', async () => {
  const h = harness();
  const result = await createPostgresPlanLifecycleAdapter(h).apply({ actorId: OWNER, planId: PLAN, command: { action: 'archive', expectedVersion: 2, reminderVersions: [{ id: REMINDER, expectedVersion: 4 }] }, now: NOW });
  assert.equal(result.data.mutation.entityVersion, 3);
  assert.equal(result.data.mutation.state, 'archived');
  assert.ok(h.calls.find((call) => call.q.includes('from df_private.sync_heads')));
  assert.equal(h.calls.filter((call) => call.q.startsWith('update df_private.task_reminders')).length, 1);
});

test('restore has no reminder write and reactivates without shifting history', async () => {
  const h = harness({ state: 'archived' });
  const result = await createPostgresPlanLifecycleAdapter(h).apply({ actorId: OWNER, planId: PLAN, command: { action: 'restore', expectedVersion: 2, reminderVersions: [] }, now: NOW });
  assert.equal(result.data.mutation.state, 'active');
  assert.equal(h.calls.filter((call) => call.q.startsWith('update df_private.task_reminders')).length, 0);
});

test('delete writes a timestamped tombstone and never returns deleted content', async () => {
  const h = harness({ state: 'archived' });
  const result = await createPostgresPlanLifecycleAdapter(h).apply({ actorId: OWNER, planId: PLAN, command: { action: 'delete', expectedVersion: 2, reminderVersions: [{ id: REMINDER, expectedVersion: 4 }] }, now: NOW });
  assert.equal(result.data.mutation.state, 'deleted');
  assert.equal(result.data.mutation.entityVersion, 3);
  assert.equal(result.data.mutation.deletedAt, NOW);
});

test('reminder failure propagates and the injected transaction cannot report success', async () => {
  const h = harness({ failReminder: true });
  await assert.rejects(() => createPostgresPlanLifecycleAdapter(h).apply({ actorId: OWNER, planId: PLAN, command: { action: 'archive', expectedVersion: 2, reminderVersions: [{ id: REMINDER, expectedVersion: 4 }] }, now: NOW }), /injected reminder failure/);
});

test('plan lifecycle boundaries reject malformed runtime dependencies before storage', async () => {
  assert.throws(() => createPostgresPlanLifecycleAdapter({ runner: null }), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresPlanActionCandidate({ runner: { withTransaction: 'not-callable' }, now: NOW }), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresPlanActionCandidate({ runner: harness().runner, now: 'bad' }), /VALIDATION_FAILED/);
  await assert.rejects(() => createPostgresPlanLifecycleAdapter(harness()).apply({ actorId: Symbol('actor'), planId: PLAN, command: {}, now: NOW }), /VALIDATION_FAILED/);
  const { applyPostgresPlanLifecycle } = await import('../../supabase/functions/_shared/postgres-plan-lifecycle-adapter.ts');
  await assert.rejects(() => applyPostgresPlanLifecycle({ query: null }, { actorId: OWNER, planId: PLAN, command: {}, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
});

test('plan lifecycle fails closed on malformed or ambiguous singleton results', async () => {
  const malformed = { runner: { withTransaction: async (run) => run({ query: async () => ({ rows: null }) }) } };
  await assert.rejects(() => createPostgresPlanLifecycleAdapter(malformed).apply({ actorId: OWNER, planId: PLAN, command: { action: 'restore', expectedVersion: 2, reminderVersions: [] }, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
  const duplicatePlan = harness();
  const originalQuery = duplicatePlan.runner.withTransaction;
  duplicatePlan.runner = { withTransaction: async (run) => originalQuery((client) => run({ query: async (sql, params) => sql.includes('from df_private.ai_plans') ? { rows: [{ id: PLAN, owner_id: OWNER, state: 'active', version: 2, deleted_at: null }, { id: PLAN, owner_id: OWNER, state: 'active', version: 2, deleted_at: null }] } : client.query(sql, params) })) };
  await assert.rejects(() => createPostgresPlanLifecycleAdapter(duplicatePlan).apply({ actorId: OWNER, planId: PLAN, command: { action: 'restore', expectedVersion: 2, reminderVersions: [] }, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
});

test('plan lifecycle fails closed on sparse profile rows before lifecycle writes', async () => {
  const sparse = [];
  sparse[1] = { owner_id: OWNER, account_state: 'active' };
  let writes = 0;
  const runner = { withTransaction: async (run) => run({ query: async (sql) => {
    if (sql.includes('from df_private.profiles')) return { rows: sparse };
    writes += 1;
    return { rows: [] };
  } }) };
  await assert.rejects(() => createPostgresPlanLifecycleAdapter({ runner }).apply({ actorId: OWNER, planId: PLAN, command: { action: 'restore', expectedVersion: 2, reminderVersions: [] }, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(writes, 0);
});
