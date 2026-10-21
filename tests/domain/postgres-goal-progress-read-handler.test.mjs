import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresGatewayReadHandlers } = await import('../../supabase/functions/_shared/postgres-gateway-read-handlers.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const GOAL = '22222222-2222-4222-8222-222222222222';
const NOW = '2026-10-11T02:00:00.000Z';
const goal = { id: GOAL, owner_id: OWNER, workspace_id: '44444444-4444-4444-8444-444444444444', title: 'Focus', description: null, type: 'focus_time', period: 'daily', target_value: 180000, target_unit: 'ms', starts_at: '2026-10-11T00:00:00.000Z', ends_at: '2026-10-12T00:00:00.000Z', time_zone: 'Asia/Colombo', status: 'active', version: 1, deleted_at: null };

function handler({ goalRow = goal, contributions = [], sourceSequence = '7' } = {}) {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: '55555555-5555-4555-8555-555555555555', status: 'active', revoked_at: null }] };
    if (sql.includes('from df_private.goals')) return { rows: [goalRow] };
    if (sql.includes('from df_private.goal_contributions')) return { rows: contributions };
    if (sql.includes('from df_private.sync_changes')) return { rows: [{ source_sequence: sourceSequence }] };
    throw new Error(`unexpected query: ${sql}`);
  } }) };
  return { calls, read: createPostgresGatewayReadHandlers({ runner, now: () => NOW }).getGoalProgress };
}

const context = { actorId: OWNER, sessionId: '55555555-5555-4555-8555-555555555555', operation: 'getGoalProgress', resourceId: GOAL, requestSha256: 'a'.repeat(64), body: null };

test('goal progress reads only the owner ledger and returns bounded current totals', async () => {
  const h = handler({ contributions: [
    { id: '66666666-6666-4666-8666-666666666666', owner_id: OWNER, goal_id: GOAL, source_kind: 'focus_session', value_unit: 'ms', value: '60000' },
    { id: '77777777-7777-4777-8777-777777777777', owner_id: OWNER, goal_id: GOAL, source_kind: 'focus_session', value_unit: 'ms', value: '30000' },
  ] });
  const result = await h.read(context);
  assert.deepEqual(result.body.data.progress, { currentValue: 90000, contributionCount: 2 });
  assert.deepEqual(result.body.data.meta, { asOf: NOW, sourceSequence: '7', ruleVersion: 'goal-attribution-v1', status: 'current' });
  assert.equal(h.calls.some((call) => call.sql.includes('owner_id = $1 and goal_id = $2')), true);
});

test('empty verified ledger returns a real zero, while foreign or malformed rows fail closed', async () => {
  const empty = await handler().read(context);
  assert.deepEqual(empty.body.data.progress, { currentValue: 0, contributionCount: 0 });
  for (const row of [
    { id: '66666666-6666-4666-8666-666666666666', owner_id: '88888888-8888-4888-8888-888888888888', goal_id: GOAL, source_kind: 'focus_session', value_unit: 'ms', value: '1' },
    { id: '66666666-6666-4666-8666-666666666666', owner_id: OWNER, goal_id: GOAL, source_kind: 'focus_session', value_unit: 'ms', value: 'not-a-number' },
  ]) await assert.rejects(() => handler({ contributions: [row] }).read(context), /DEPENDENCY_UNAVAILABLE/);
});

test('goal progress rejects deleted goals and unsupported session-count units', async () => {
  await assert.rejects(() => handler({ goalRow: { ...goal, deleted_at: NOW } }).read(context), /NOT_FOUND/);
  await assert.rejects(() => handler({ goalRow: { ...goal, type: 'session_count', target_unit: 'count' }, contributions: [{ id: '66666666-6666-4666-8666-666666666666', owner_id: OWNER, goal_id: GOAL, source_kind: 'focus_session', value_unit: 'ms', value: '1' }] }).read(context), /DEPENDENCY_UNAVAILABLE/);
});
