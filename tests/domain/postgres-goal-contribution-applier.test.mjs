import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresGoalContributionStore } = await import('../../supabase/functions/_shared/postgres-goal-contribution-applier.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const GOAL = '22222222-2222-4222-8222-222222222222';
const SESSION = '33333333-3333-4333-8333-333333333333';
const CONTRIBUTION = '44444444-4444-4444-8444-444444444444';
const NOW = '2026-10-11T02:00:00.000Z';
const goalRow = { owner_id: OWNER, id: GOAL, type: 'focus_time', status: 'active', deleted_at: null, starts_at: '2026-10-10T00:00:00.000Z', ends_at: '2026-10-12T00:00:00.000Z' };
const sessionRow = { owner_id: OWNER, id: SESSION, status: 'cancelled', focused_ms: 60000, ended_at: '2026-10-11T01:00:00.000Z', version: 2 };

function harness({ inserted = true, existing = false, existingRow = null, rows = [goalRow], session = sessionRow, insertedValue = null, existingValue = null } = {}) {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.goals')) return { rows };
    if (sql.includes('from df_private.focus_sessions')) return { rows: session ? [session] : [] };
    const valueUnit = rows[0]?.type === 'session_count' ? 'count' : 'ms';
    const storedValue = valueUnit === 'count' ? 1 : 60000;
    if (sql.startsWith('insert into df_private.goal_contributions')) return { rows: inserted ? [{ id: CONTRIBUTION, owner_id: OWNER, goal_id: GOAL, source_id: SESSION, value: insertedValue ?? storedValue, value_unit: valueUnit, source_version: 2, rule_version: 'goal-attribution-v1' }] : [] };
    if (sql.includes('from df_private.goal_contributions')) return { rows: existing ? [existingRow ?? { id: CONTRIBUTION, owner_id: OWNER, goal_id: GOAL, source_id: SESSION, value: existingValue ?? storedValue, value_unit: valueUnit, source_version: 2, rule_version: 'goal-attribution-v1' }] : [] };
    throw new Error(`unexpected query: ${sql}`);
  } }) };
  return { calls, store: createPostgresGoalContributionStore({ runner }) };
}

test('focus-session contribution binds owner/goal/session, records actual focused ms and is atomic', async () => {
  const h = harness();
  const result = await h.store.attributeFocusSession({ ownerId: OWNER, goalId: GOAL, sessionId: SESSION, contributionId: CONTRIBUTION, now: NOW });
  assert.deepEqual(result, { action: 'created', id: CONTRIBUTION, ownerId: OWNER, goalId: GOAL, sourceId: SESSION, value: 60000, valueUnit: 'ms', sourceVersion: 2, ruleVersion: 'goal-attribution-v1' });
  assert.equal(h.calls[0].sql.includes('for update'), true);
  assert.equal(h.calls.some((call) => call.sql.includes('on conflict (owner_id, goal_id, source_kind, source_id)')), true);
});

test('malformed contribution input fails before opening a transaction', async () => {
  for (const value of [null, { ownerId: Symbol('owner') }, { ownerId: OWNER, goalId: GOAL, sessionId: SESSION, contributionId: CONTRIBUTION, now: Symbol('clock') }]) {
    const h = harness();
    await assert.rejects(() => h.store.attributeFocusSession(value), /VALIDATION_FAILED/);
    assert.equal(h.calls.length, 0);
  }
});

test('repeated contribution returns the existing row without awarding twice', async () => {
  const h = harness({ inserted: false, existing: true });
  const result = await h.store.attributeFocusSession({ ownerId: OWNER, goalId: GOAL, sessionId: SESSION, contributionId: CONTRIBUTION, now: NOW });
  assert.equal(result.action, 'existing');
});

test('normalizes PostgreSQL bigint strings from the session and inserted contribution', async () => {
  const h = harness({ session: { ...sessionRow, focused_ms: '60000' }, insertedValue: '60000' });
  const result = await h.store.attributeFocusSession({ ownerId: OWNER, goalId: GOAL, sessionId: SESSION, contributionId: CONTRIBUTION, now: NOW });
  assert.equal(result.value, 60000);
  assert.equal(result.valueUnit, 'ms');
});

test('normalizes PostgreSQL bigint strings from an existing idempotent contribution', async () => {
  const h = harness({ inserted: false, existing: true, session: { ...sessionRow, focused_ms: '60000' }, existingValue: '60000' });
  const result = await h.store.attributeFocusSession({ ownerId: OWNER, goalId: GOAL, sessionId: SESSION, contributionId: CONTRIBUTION, now: NOW });
  assert.equal(result.action, 'existing');
  assert.equal(result.value, 60000);
});

test('session-count goals count completed sessions but reject cancelled sessions', async () => {
  const h = harness({ rows: [{ ...goalRow, type: 'session_count' }], session: { ...sessionRow, status: 'completed' } });
  const result = await h.store.attributeFocusSession({ ownerId: OWNER, goalId: GOAL, sessionId: SESSION, contributionId: CONTRIBUTION, now: NOW });
  assert.deepEqual(result, { action: 'created', id: CONTRIBUTION, ownerId: OWNER, goalId: GOAL, sourceId: SESSION, value: 1, valueUnit: 'count', sourceVersion: 2, ruleVersion: 'goal-attribution-v1' });
  const cancelled = harness({ rows: [{ ...goalRow, type: 'session_count' }] });
  await assert.rejects(() => cancelled.store.attributeFocusSession({ ownerId: OWNER, goalId: GOAL, sessionId: SESSION, contributionId: CONTRIBUTION, now: NOW }), /VALIDATION_FAILED/);
});

test('foreign, deleted, wrong-type, out-of-period and future sessions fail before contribution insert', async () => {
  for (const override of [
    { session: { ...sessionRow, owner_id: '55555555-5555-4555-8555-555555555555' } },
    { rows: [{ ...goalRow, deleted_at: NOW }] },
    { rows: [{ ...goalRow, type: 'session_count' }] },
    { session: { ...sessionRow, ended_at: '2026-10-12T00:00:00.000Z' } },
    { session: { ...sessionRow, ended_at: '2026-10-11T03:00:00.000Z' } },
  ]) {
    const h = harness(override);
    await assert.rejects(() => h.store.attributeFocusSession({ ownerId: OWNER, goalId: GOAL, sessionId: SESSION, contributionId: CONTRIBUTION, now: NOW }), /VALIDATION_FAILED|DEPENDENCY_UNAVAILABLE/);
    assert.equal(h.calls.some((call) => call.sql.startsWith('insert into df_private.goal_contributions')), false);
  }
});

test('changed existing contribution fails closed instead of silently changing history', async () => {
  const h = harness({ inserted: false, existing: true, existingRow: { id: CONTRIBUTION, owner_id: OWNER, goal_id: GOAL, source_id: SESSION, value: 1, value_unit: 'ms', source_version: 1, rule_version: 'goal-attribution-v1' } });
  await assert.rejects(() => h.store.attributeFocusSession({ ownerId: OWNER, goalId: GOAL, sessionId: SESSION, contributionId: CONTRIBUTION, now: NOW }), /IDEMPOTENCY_CONFLICT/);
});

test('goal contribution fails closed on malformed or ambiguous persistence results', async () => {
  const malformed = createPostgresGoalContributionStore({ runner: { withTransaction: async (run) => run({ query: async () => ({ rows: null }) }) } });
  await assert.rejects(() => malformed.attributeFocusSession({ ownerId: OWNER, goalId: GOAL, sessionId: SESSION, contributionId: CONTRIBUTION, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
  const existingRow = { id: CONTRIBUTION, owner_id: OWNER, goal_id: GOAL, source_id: SESSION, value: 60000, value_unit: 'ms', source_version: 2, rule_version: 'goal-attribution-v1' };
  const ambiguousStore = createPostgresGoalContributionStore({ runner: { withTransaction: async (run) => run({ query: async (sql, params) => {
    void params;
    if (sql.includes('from df_private.goals')) return { rows: [goalRow] };
    if (sql.includes('from df_private.focus_sessions')) return { rows: [sessionRow] };
    if (sql.startsWith('insert into df_private.goal_contributions')) return { rows: [] };
    return { rows: [existingRow, existingRow] };
  } }) } });
  await assert.rejects(() => ambiguousStore.attributeFocusSession({ ownerId: OWNER, goalId: GOAL, sessionId: SESSION, contributionId: CONTRIBUTION, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
});

test('goal contribution fails closed on sparse persistence result rows before attribution', async () => {
  const sparse = [];
  sparse[1] = goalRow;
  const calls = [];
  const store = createPostgresGoalContributionStore({ runner: { withTransaction: async (run) => run({ query: async (sql) => {
    calls.push(sql);
    if (sql.includes('from df_private.goals')) return { rows: sparse };
    return { rows: [] };
  } }) } });
  await assert.rejects(() => store.attributeFocusSession({ ownerId: OWNER, goalId: GOAL, sessionId: SESSION, contributionId: CONTRIBUTION, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(calls.some((sql) => sql.startsWith('insert into df_private.goal_contributions')), false);
});
