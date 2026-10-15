import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresGatewayReadHandlers } = await import('../../supabase/functions/_shared/postgres-gateway-read-handlers.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const TASK = '22222222-2222-4222-8222-222222222222';
const OTHER = '33333333-3333-4333-8333-333333333333';
const SESSION = '66666666-6666-4666-8666-666666666666';
const SETTINGS = '77777777-7777-4777-8777-777777777777';
const REMINDER = '88888888-8888-4888-8888-888888888888';
const PROPOSAL = '99999999-9999-4999-8999-999999999999';
const REQUEST = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const OPERATION = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const PRIVACY_JOB = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const HASH = 'a'.repeat(64);
const PLAN = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const WORKSPACE = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

function runner(query) {
  return {
    withTransaction: async (run) => run({
      query: async (sql, params) => sql.includes('from df_private.app_sessions')
        ? { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] }
        : query(sql, params),
    }),
  };
}

test('getPlan returns the canonical owner-bound plan and bound reminder shape', async () => {
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql) => {
    if (sql.includes('from df_private.ai_plans')) return { rows: [{ owner_id: OWNER, id: PLAN, workspace_id: WORKSPACE, generation_request_id: REQUEST, proposal_id: PROPOSAL, contract_version: 2, version: 1, local_date: '2026-10-11', time_zone: 'Asia/Colombo', available_start: '2026-10-11T00:00:00.000Z', available_end: '2026-10-11T02:00:00.000Z', explanation: null, state: 'active', deleted_at: null, confirmed_at: '2026-10-11T00:00:00.000Z', created_at: '2026-10-11T00:00:00.000Z', updated_at: '2026-10-11T00:00:00.000Z' }] };
    if (sql.includes('from df_private.ai_plan_blocks')) return { rows: [{ owner_id: OWNER, plan_id: PLAN, id: OPERATION, kind: 'focus', task_id: TASK, after_block_id: null, starts_at: '2026-10-11T00:10:00.000Z', ends_at: '2026-10-11T00:35:00.000Z', reminder_id: REMINDER, version: 1 }] };
    if (sql.includes('from df_private.task_reminders r')) return { rows: [{ id: REMINDER, owner_id: OWNER, task_id: TASK, scheduled_for: '2026-10-11T00:05:00.000Z', time_zone: 'Asia/Colombo', enabled: true, delivery: 'local_device', version: 1, updated_at: '2026-10-11T00:00:00.000Z', deleted_at: null, bound_task_id: TASK }] };
    return { rows: [] };
  }) });
  const result = await handlers.getPlan({ actorId: OWNER, sessionId: SESSION, operation: 'getPlan', resourceId: PLAN, body: null });
  assert.equal(result.body.data.plan.sourceProposalId, PROPOSAL);
  assert.equal(result.body.data.plan.blocks[0].kind, 'focus');
  assert.equal(result.body.data.boundReminders[0].taskId, TASK);
});

test('listPlans returns owner-bound plans and a signed descending cursor', async () => {
  const planRow = { owner_id: OWNER, id: PLAN, workspace_id: WORKSPACE, generation_request_id: REQUEST, proposal_id: PROPOSAL, contract_version: 2, version: 1, local_date: '2026-10-11', time_zone: 'Asia/Colombo', available_start: '2026-10-11T00:00:00.000Z', available_end: '2026-10-11T02:00:00.000Z', explanation: null, state: 'active', deleted_at: null, confirmed_at: '2026-10-11T00:00:00.000Z', created_at: '2026-10-11T00:00:00.000Z', updated_at: '2026-10-11T00:00:00.000Z' };
  const secondPlan = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const summaryRows = [{ id: PLAN, created_at: planRow.created_at }, { id: secondPlan, created_at: '2026-10-10T00:00:00.000Z' }];
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql) => {
    if (sql.includes('select id, created_at from df_private.ai_plans')) return { rows: summaryRows };
    if (sql.includes('from df_private.ai_plans')) return { rows: [planRow] };
    if (sql.includes('from df_private.ai_plan_blocks')) return { rows: [{ owner_id: OWNER, plan_id: PLAN, id: OPERATION, kind: 'focus', task_id: TASK, after_block_id: null, starts_at: '2026-10-11T00:10:00.000Z', ends_at: '2026-10-11T00:35:00.000Z', reminder_id: null, version: 1 }] };
    return { rows: [] };
  }), listCursorSecret: 'x'.repeat(32), now: () => '2026-10-11T00:00:00.000Z' });
  const result = await handlers.listPlans({ actorId: OWNER, sessionId: SESSION, operation: 'listPlans', query: { limit: 1 }, body: null });
  assert.equal(result.body.data.length, 1);
  assert.equal(result.body.data[0].id, PLAN);
  assert.match(result.body.meta.nextCursor, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
});

test('getTask binds both route ID and verified actor and returns a safe DTO', async () => {
  let received;
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql, params) => { received = { sql, params }; return { rows: [{ id: TASK, owner_id: OWNER, workspace_id: OTHER, goal_id: null, title: 'Read', description: null, status: 'pending', priority: null, due_kind: 'none', due_date: null, due_at: null, version: 1 }] }; }) });
  const result = await handlers.getTask({ actorId: OWNER, sessionId: SESSION, operation: 'getTask', resourceId: TASK, body: null });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { id: TASK, workspaceId: OTHER, goalId: null, title: 'Read', description: null, status: 'pending', priority: null, due: { kind: 'none' }, version: 1 });
  assert.deepEqual(received.params, [TASK, OWNER]);
});

test('getAiGenerationRequest returns only the owner-bound public status DTO', async () => {
  let received;
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql, params) => {
    received = { sql, params };
    return { rows: [{ owner_id: OWNER, request_id: REQUEST, action_type: 'plan_my_day', version: 1,
      created_at: '2026-10-11T00:00:00.000Z', updated_at: '2026-10-11T00:00:01.000Z', deadline_at: '2026-10-11T00:05:00.000Z',
      status: 'pending', completed_at: null, failure_code: null, reserved_actions: 1, consumed_actions: 0,
      proposal_id: null, proposal_contract_version: null }] };
  }) });
  const result = await handlers.getAiGenerationRequest({ actorId: OWNER, sessionId: SESSION, operation: 'getAiGenerationRequest', resourceId: REQUEST, body: null });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.data, { requestId: REQUEST, actionType: 'plan_my_day', version: 1,
    createdAt: '2026-10-11T00:00:00.000Z', updatedAt: '2026-10-11T00:00:01.000Z', deadlineAt: '2026-10-11T00:05:00.000Z',
    status: 'pending', completedAt: null, result: null, failureCode: null, reservedActions: 1, consumedActions: 0 });
  assert.match(received.sql, /from df_private\.ai_generation_requests/i);
  assert.deepEqual(received.params, [OWNER, REQUEST]);
});

test('getAiGenerationRequest returns not-found for an owner-missing request', async () => {
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [] })) });
  await assert.rejects(handlers.getAiGenerationRequest({ actorId: OWNER, sessionId: SESSION, operation: 'getAiGenerationRequest', resourceId: REQUEST, body: null }), /NOT_FOUND/);
});

test('listTasks uses a bounded owner-scoped query and maps typed deadlines', async () => {
  let received;
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql, params) => { received = { sql, params }; return { rows: [{ id: TASK, owner_id: OWNER, workspace_id: OTHER, goal_id: null, title: 'Read', description: null, status: 'pending', priority: 'high', due_kind: 'date', due_date: '2026-10-10', due_at: null, version: 2 }] }; }) });
  const result = await handlers.listTasks({ actorId: OWNER, sessionId: SESSION, operation: 'listTasks', body: null });
  assert.deepEqual(result.body.items[0].due, { kind: 'date', date: '2026-10-10' });
  assert.match(received.sql, /limit 100/i);
  assert.deepEqual(received.params, [OWNER]);
});

test('listTasks fails closed when the database returns a sparse row array', async () => {
  const row = { id: TASK, owner_id: OWNER, workspace_id: OTHER, goal_id: null, title: 'Read', description: null, status: 'pending', priority: null, due_kind: 'none', due_date: null, due_at: null, version: 1 };
  const rows = [];
  rows[1] = row;
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows })) });
  await assert.rejects(handlers.listTasks({ actorId: OWNER, sessionId: SESSION, operation: 'listTasks', body: null }), /DEPENDENCY_UNAVAILABLE/);
});

test('listGoals normalizes PostgreSQL bigint target values', async () => {
  const goal = { id: TASK, owner_id: OWNER, workspace_id: OTHER, title: 'Focus', description: null, type: 'focus_time', period: 'daily', target_value: '1500000', target_unit: 'ms', starts_at: '2026-10-10T00:00:00.000Z', ends_at: '2026-10-11T00:00:00.000Z', time_zone: 'Asia/Colombo', status: 'active', version: 1 };
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [goal] })) });
  const result = await handlers.listGoals({ actorId: OWNER, sessionId: SESSION, operation: 'listGoals', body: null });
  assert.equal(result.body.items[0].targetValue, 1500000);
});

test('goal reads fail closed for malformed bigint target values', async () => {
  const goal = { id: TASK, owner_id: OWNER, workspace_id: OTHER, title: 'Focus', description: null, type: 'focus_time', period: 'daily', target_value: 'not-a-number', target_unit: 'ms', starts_at: '2026-10-10T00:00:00.000Z', ends_at: '2026-10-11T00:00:00.000Z', time_zone: 'Asia/Colombo', status: 'active', version: 1 };
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [goal] })) });
  await assert.rejects(handlers.listGoals({ actorId: OWNER, sessionId: SESSION, operation: 'listGoals', body: null }), /DEPENDENCY_UNAVAILABLE/);
});

test('listSessions signs descending history pages and keeps owner/session checks', async () => {
  let received;
  const rows = [1, 2, 3].map((index) => ({ id: `66666666-6666-4666-8666-66666666686${index}`, owner_id: OWNER, workspace_id: OTHER, task_id: TASK, task_title_snapshot: 'Read', status: 'completed', planned_ms: 1500000, focused_ms: 1200000, paused_ms: 300000, started_at: `2026-10-10T0${index}:00:00.000Z`, ended_at: `2026-10-10T0${index}:25:00.000Z`, version: 1 }));
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql, params) => { received = { sql, params }; return { rows }; }), listCursorSecret: 'x'.repeat(32), now: () => '2026-10-11T00:00:00.000Z' });
  const result = await handlers.listSessions({ actorId: OWNER, sessionId: SESSION, operation: 'listSessions', query: { limit: 2 }, body: null });
  assert.equal(result.body.items.length, 2);
  assert.match(result.body.meta.nextCursor, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.match(received.sql, /order by started_at desc, id desc/i);
  assert.match(received.sql, /limit 3/i);
  const next = await handlers.listSessions({ actorId: OWNER, sessionId: SESSION, operation: 'listSessions', query: { limit: 2, cursor: result.body.meta.nextCursor }, body: null });
  assert.equal(next.body.items.length, 2);
  assert.match(received.sql, /started_at, id\) </i);
  assert.deepEqual(received.params.slice(0, 1), [OWNER]);
});

test('listSessions normalizes PostgreSQL bigint timer strings', async () => {
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [{ id: SESSION, owner_id: OWNER, workspace_id: OTHER, task_id: null, task_title_snapshot: null, status: 'completed', planned_ms: '1500000', focused_ms: '1200000', paused_ms: '300000', started_at: '2026-10-10T01:00:00.000Z', ended_at: '2026-10-10T01:25:00.000Z', version: 1 }] })) });
  const result = await handlers.listSessions({ actorId: OWNER, sessionId: SESSION, operation: 'listSessions', query: { limit: 1 }, body: null });
  assert.deepEqual(result.body.items[0], { id: SESSION, workspaceId: OTHER, taskId: null, taskTitleSnapshot: null, status: 'completed', plannedMs: 1500000, focusedMs: 1200000, pausedMs: 300000, startedAt: '2026-10-10T01:00:00.000Z', endedAt: '2026-10-10T01:25:00.000Z', version: 1 });
});

test('listAccountSessions returns only safe owner-bound rows and marks the current session', async () => {
  let received;
  const rows = [SESSION, '66666666-6666-4666-8666-666666666667', '66666666-6666-4666-8666-666666666668'].map((id, index) => ({ owner_id: OWNER, session_id: id, status: index === 2 ? 'revoked' : 'active', issued_at: `2026-10-10T0${index + 1}:00:00.000Z`, expires_at: '2026-12-10T00:00:00.000Z', revoked_at: index === 2 ? '2026-10-10T04:00:00.000Z' : null }));
  let guardRead = true;
  const handlers = createPostgresGatewayReadHandlers({ runner: { withTransaction: async (run) => run({ query: async (sql, params) => {
    if (guardRead && sql.includes('from df_private.app_sessions')) { guardRead = false; return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] }; }
    received = { sql, params }; return { rows };
  } }) }, listCursorSecret: 'x'.repeat(32), now: () => '2026-10-11T00:00:00.000Z' });
  const result = await handlers.listAccountSessions({ actorId: OWNER, sessionId: SESSION, operation: 'listAccountSessions', query: { limit: 2 }, body: null });
  assert.equal(result.body.data.length, 2);
  assert.equal(result.body.data[0].current, true);
  assert.equal(result.body.data[0].id, rows[0].session_id);
  assert.equal(result.body.data[0].status, 'active');
  assert.match(received.sql, /order by issued_at desc, session_id desc/i);
  assert.match(received.sql, /limit 3/i);
  assert.deepEqual(received.params, [OWNER]);
  assert.match(result.body.meta.nextCursor, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
});

test('listAccountSessions fails closed on foreign or malformed registry rows', async () => {
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [{ owner_id: OTHER, session_id: SESSION, status: 'active', issued_at: 'bad', expires_at: 'bad', revoked_at: null }] })) });
  await assert.rejects(handlers.listAccountSessions({ actorId: OWNER, sessionId: SESSION, operation: 'listAccountSessions', body: null }), /DEPENDENCY_UNAVAILABLE/);
});

test('listAccountSessions fails closed on inconsistent registry timestamps or status', async () => {
  let guarded = true;
  const handlers = createPostgresGatewayReadHandlers({ runner: { withTransaction: async (run) => run({ query: async (sql) => {
    if (guarded && sql.includes('from df_private.app_sessions')) {
      guarded = false;
      return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: '2026-10-10T00:00:00.000Z', expires_at: '2026-10-12T00:00:00.000Z', revoked_at: null }] };
    }
    return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: '2026-10-10T00:00:00.000Z', expires_at: '2026-10-09T00:00:00.000Z', revoked_at: null }] };
  } }) } });
  await assert.rejects(handlers.listAccountSessions({ actorId: OWNER, sessionId: SESSION, operation: 'listAccountSessions', body: null }), /DEPENDENCY_UNAVAILABLE/);
});

test('listBreaks returns an owner-bound descending history page and cursor', async () => {
  let received;
  const rows = [1, 2, 3].map((index) => ({ owner_id: OWNER, id: `99999999-9999-4999-8999-99999999999${index}`, focus_session_id: SESSION, started_at: `2026-10-10T0${index}:00:00.000Z`, ended_at: `2026-10-10T0${index}:05:00.000Z`, planned_ms: 300000, actual_ms: 300000, outcome: 'completed', version: 1, verification_state: 'pending' }));
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql, params) => { received = { sql, params }; return { rows }; }), listCursorSecret: 'x'.repeat(32), now: () => '2026-10-11T00:00:00.000Z' });
  const result = await handlers.listBreaks({ actorId: OWNER, sessionId: SESSION, operation: 'listBreaks', query: { limit: 2 }, body: null });
  assert.equal(result.body.data.length, 2);
  assert.equal(result.body.data[0].focusSessionId, SESSION);
  assert.match(result.body.meta.nextCursor, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.match(received.sql, /order by ended_at desc, id desc/i);
  assert.deepEqual(received.params, [OWNER]);
});

test('listBreaks normalizes PostgreSQL bigint duration strings', async () => {
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [{ owner_id: OWNER, id: '99999999-9999-4999-8999-999999999991', focus_session_id: SESSION, started_at: '2026-10-10T01:00:00.000Z', ended_at: '2026-10-10T01:05:00.000Z', planned_ms: '300000', actual_ms: '300000', outcome: 'completed', version: 1, verification_state: 'pending' }] })) });
  const result = await handlers.listBreaks({ actorId: OWNER, sessionId: SESSION, operation: 'listBreaks', body: null });
  assert.equal(result.body.data[0].plannedMs, 300000);
  assert.equal(result.body.data[0].actualMs, 300000);
});

test('listBreaks fails closed on malformed rows', async () => {
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [{ owner_id: OWNER, id: 'bad', focus_session_id: SESSION, started_at: 'bad', ended_at: 'bad', planned_ms: 1, actual_ms: 1, outcome: 'completed', version: 1, verification_state: 'pending' }] })) });
  await assert.rejects(handlers.listBreaks({ actorId: OWNER, sessionId: SESSION, operation: 'listBreaks', body: null }), /DEPENDENCY_UNAVAILABLE/);
});

test('getAnalyticsSummary returns owner-bound current totals with explicit freshness', async () => {
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql) => {
    if (sql.includes('from df_private.focus_sessions')) return { rows: [{ verified_focus_ms: '1500000', completed_session_count: '1' }] };
    if (sql.includes('from df_private.tasks')) return { rows: [{ completed_task_count: '2' }] };
    if (sql.includes('from df_private.sync_changes')) return { rows: [{ source_sequence: '7' }] };
    return { rows: [] };
  }), analyticsMaxRangeMs: 86400000, now: () => '2026-10-11T00:00:00.000Z' });
  const result = await handlers.getAnalyticsSummary({ actorId: OWNER, sessionId: SESSION, operation: 'getAnalyticsSummary', query: { start: '2026-10-10T00:00:00.000Z', end: '2026-10-11T00:00:00.000Z', timeZone: 'Asia/Colombo' }, body: null });
  assert.deepEqual(result.body.data.summary, { verifiedFocusMs: 1500000, completedSessionCount: 1, completedTaskCount: 2 });
  assert.deepEqual(result.body.data.meta, { asOf: '2026-10-11T00:00:00.000Z', sourceSequence: '7', ruleVersion: 'analytics-summary-v1', status: 'current' });
});

test('getAnalyticsSummary remains unavailable when no reviewed range policy is configured', async () => {
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [] })) });
  await assert.rejects(handlers.getAnalyticsSummary({ actorId: OWNER, sessionId: SESSION, operation: 'getAnalyticsSummary', query: { start: '2026-10-10T00:00:00.000Z', end: '2026-10-11T00:00:00.000Z', timeZone: 'Asia/Colombo' }, body: null }), /DEPENDENCY_UNAVAILABLE/);
});

test('getAiProposal returns only an owner-bound reviewable proposal and hides expired proposals', async () => {
  const row = { owner_id: OWNER, id: PROPOSAL, contract_version: 1, version: 2, generation_request_id: REQUEST, action_type: 'break_down_task', expires_at: '2026-10-12T00:00:00.000Z', review_digest: HASH, state: 'ready', input_versions: [], operations: [{ id: OPERATION }], selected_operation_ids: null, applied_at: null };
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql) => sql.includes('ai_proposals') ? { rows: [row] } : { rows: [] }), now: () => '2026-10-11T00:00:00.000Z' });
  const result = await handlers.getAiProposal({ actorId: OWNER, sessionId: SESSION, operation: 'getAiProposal', resourceId: PROPOSAL, body: null });
  assert.deepEqual(result.body.data, { contractVersion: 1, id: PROPOSAL, version: 2, generationRequestId: REQUEST, actionType: 'break_down_task', expiresAt: row.expires_at, reviewDigest: HASH, state: 'ready', inputVersions: [], operations: [{ id: OPERATION }] });
  const expired = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [{ ...row, expires_at: '2026-10-10T00:00:00.000Z' }] })), now: () => '2026-10-11T00:00:00.000Z' });
  await assert.rejects(expired.getAiProposal({ actorId: OWNER, sessionId: SESSION, operation: 'getAiProposal', resourceId: PROPOSAL, body: null }), /AI_PROPOSAL_EXPIRED/);
});

test('getPrivacyJob returns only a coarse owner-bound status and never exposes private artifact fields', async () => {
  let received;
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql, params) => {
    received = { sql, params };
    return { rows: [{ job_id: PRIVACY_JOB, owner_id: OWNER, kind: 'export', state: 'succeeded', updated_at: '2026-10-11T00:00:00.000Z', safe_error_code: null, artifact_locator: 'private://must-not-leak' }] };
  }) });
  const result = await handlers.getPrivacyJob({ actorId: OWNER, sessionId: SESSION, operation: 'getPrivacyJob', resourceId: PRIVACY_JOB, body: null });
  assert.deepEqual(result.body, { data: { id: PRIVACY_JOB, kind: 'export', state: 'succeeded', updatedAt: '2026-10-11T00:00:00.000Z', safeErrorCode: null } });
  assert.deepEqual(received.params, [OWNER, PRIVACY_JOB]);
  assert.doesNotMatch(JSON.stringify(result.body), /artifact_locator|private:\/\//);
});

test('getPrivacyJob hides foreign or missing jobs and fails closed on malformed rows', async () => {
  const missing = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [] })) });
  await assert.rejects(missing.getPrivacyJob({ actorId: OWNER, sessionId: SESSION, operation: 'getPrivacyJob', resourceId: PRIVACY_JOB, body: null }), /NOT_FOUND/);
  const foreign = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [{ job_id: PRIVACY_JOB, owner_id: OTHER, kind: 'export', state: 'succeeded', updated_at: '2026-10-11T00:00:00.000Z', safe_error_code: null }] })) });
  await assert.rejects(foreign.getPrivacyJob({ actorId: OWNER, sessionId: SESSION, operation: 'getPrivacyJob', resourceId: PRIVACY_JOB, body: null }), /DEPENDENCY_UNAVAILABLE/);
  const malformed = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [{ job_id: PRIVACY_JOB, owner_id: OWNER, kind: 'export', state: 'running', updated_at: 'bad', safe_error_code: 'LEAKED_DETAIL' }] })) });
  await assert.rejects(malformed.getPrivacyJob({ actorId: OWNER, sessionId: SESSION, operation: 'getPrivacyJob', resourceId: PRIVACY_JOB, body: null }), /DEPENDENCY_UNAVAILABLE/);
});

test('listReminders is owner-scoped, excludes tombstones, orders the schedule, and maps a safe DTO', async () => {
  let received;
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql, params) => {
    received = { sql, params };
    return { rows: [{ id: REMINDER, owner_id: OWNER, task_id: TASK, scheduled_for: '2026-10-12T01:00:00.000Z', time_zone: 'Asia/Colombo', enabled: true, delivery: 'local_device', version: 2, updated_at: '2026-10-11T00:00:00.000Z' }] };
  }) });
  const result = await handlers.listReminders({ actorId: OWNER, sessionId: SESSION, operation: 'listReminders', body: null });
  assert.deepEqual(result.body, { data: [{ id: REMINDER, taskId: TASK, scheduledFor: '2026-10-12T01:00:00.000Z', timeZone: 'Asia/Colombo', enabled: true, delivery: 'local_device', version: 2, updatedAt: '2026-10-11T00:00:00.000Z' }], meta: { nextCursor: null } });
  assert.match(received.sql, /deleted_at is null/i);
  assert.match(received.sql, /order by scheduled_for asc, id asc/i);
  assert.match(received.sql, /limit 51/i);
  assert.deepEqual(received.params, [OWNER]);
});

test('listReminders fails closed for malformed reminder rows', async () => {
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [{ id: REMINDER, task_id: TASK, scheduled_for: 'bad', time_zone: 'Asia/Colombo', enabled: true, delivery: 'local_device', version: 1, updated_at: '2026-10-11T00:00:00.000Z' }] })) });
  await assert.rejects(handlers.listReminders({ actorId: OWNER, sessionId: SESSION, operation: 'listReminders', body: null }), /DEPENDENCY_UNAVAILABLE/);
});

test('listReminders signs the next page and binds a verified cursor to owner and limit', async () => {
  let received;
  const rows = [1, 2, 3].map((index) => ({ id: `88888888-8888-4888-8888-88888888888${index}`, owner_id: OWNER, task_id: TASK, scheduled_for: `2026-10-12T0${index}:00:00.000Z`, time_zone: 'Asia/Colombo', enabled: true, delivery: 'local_device', version: 1, updated_at: '2026-10-11T00:00:00.000Z' }));
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql, params) => { received = { sql, params }; return { rows }; }), listCursorSecret: 'x'.repeat(32), now: () => '2026-10-11T00:00:00.000Z' });
  const result = await handlers.listReminders({ actorId: OWNER, sessionId: SESSION, operation: 'listReminders', query: { limit: 2 }, body: null });
  assert.equal(result.body.data.length, 2);
  assert.match(result.body.meta.nextCursor, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.match(received.sql, /limit 3/i);
  assert.deepEqual(received.params, [OWNER]);
  const next = await handlers.listReminders({ actorId: OWNER, sessionId: SESSION, operation: 'listReminders', query: { limit: 2, cursor: result.body.meta.nextCursor }, body: null });
  assert.equal(next.body.data.length, 2);
  assert.deepEqual(received.params.slice(0, 1), [OWNER]);
  assert.match(received.sql, /scheduled_for, id\) >/i);
});

test('getSettings binds the verified owner and returns only the canonical settings DTO', async () => {
  let received;
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql, params) => {
    received = { sql, params };
    return { rows: [{ id: SETTINGS, owner_id: OWNER, theme: 'system', ui_locale: 'si', default_focus_duration_minutes: 25, default_break_duration_minutes: 5, ai_features_enabled: false, version: 1, updated_at: '2026-10-11T00:00:00.000Z' }] };
  }) });
  const result = await handlers.getSettings({ actorId: OWNER, sessionId: SESSION, operation: 'getSettings', body: null });
  assert.deepEqual(result.body, { data: { id: SETTINGS, version: 1, theme: 'system', uiLocale: 'si', defaultFocusDurationMinutes: 25, defaultBreakDurationMinutes: 5, aiFeaturesEnabled: false, updatedAt: '2026-10-11T00:00:00.000Z' } });
  assert.deepEqual(received.params, [OWNER]);
});

test('getSettings fails closed for malformed or foreign rows', async () => {
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [{ id: SETTINGS, owner_id: OTHER, theme: 'system', ui_locale: 'en', default_focus_duration_minutes: 25, default_break_duration_minutes: 5, ai_features_enabled: false, version: 1, updated_at: '2026-10-11T00:00:00.000Z' }] })) });
  await assert.rejects(handlers.getSettings({ actorId: OWNER, sessionId: SESSION, operation: 'getSettings', body: null }), /DEPENDENCY_UNAVAILABLE/);
});

test('missing owned reads fail with privacy-preserving not found', async () => {
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [] })) });
  await assert.rejects(handlers.getMe({ actorId: OWNER, sessionId: SESSION, operation: 'getMe', body: null }), /NOT_FOUND/);
  await assert.rejects(handlers.getGoal({ actorId: OWNER, sessionId: SESSION, operation: 'getGoal', resourceId: TASK, body: null }), /NOT_FOUND/);
});

test('singleton profile and settings reads fail closed on ambiguous or malformed result containers', async () => {
  const duplicateProfile = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [
    { owner_id: OWNER, display_name: 'A', account_state: 'active', version: 1 },
    { owner_id: OWNER, display_name: 'B', account_state: 'active', version: 1 },
  ] })) });
  await assert.rejects(duplicateProfile.getMe({ actorId: OWNER, sessionId: SESSION, operation: 'getMe', body: null }), /DEPENDENCY_UNAVAILABLE/);
  const malformedSettings = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: null })) });
  await assert.rejects(malformedSettings.getSettings({ actorId: OWNER, sessionId: SESSION, operation: 'getSettings', body: null }), /DEPENDENCY_UNAVAILABLE/);
});

test('read handlers fail closed when storage returns a foreign-shaped resource row', async () => {
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [{ id: OTHER, workspace_id: OTHER, goal_id: null, title: 'Foreign', description: null, status: 'pending', priority: null, due_kind: 'none', due_date: null, due_at: null, version: 1 }] })) });
  await assert.rejects(handlers.getTask({ actorId: OWNER, sessionId: SESSION, operation: 'getTask', resourceId: TASK, body: null }), /DEPENDENCY_UNAVAILABLE/);
});

test('read handlers fail closed when a correctly shaped row carries a foreign owner', async () => {
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [{ id: TASK, owner_id: OTHER, workspace_id: OTHER, goal_id: null, title: 'Foreign', description: null, status: 'pending', priority: null, due_kind: 'none', due_date: null, due_at: null, version: 1 }] })) });
  await assert.rejects(handlers.getTask({ actorId: OWNER, sessionId: SESSION, operation: 'getTask', resourceId: TASK, body: null }), /DEPENDENCY_UNAVAILABLE/);
});

test('profile read fails closed when storage returns a foreign owner row', async () => {
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [{ owner_id: OTHER, display_name: 'Foreign', account_state: 'active', version: 1 }] })) });
  await assert.rejects(handlers.getMe({ actorId: OWNER, sessionId: SESSION, operation: 'getMe', body: null }), /DEPENDENCY_UNAVAILABLE/);
});

test('authenticated read rechecks the active app session inside its transaction', async () => {
  const calls = [];
  const handlers = createPostgresGatewayReadHandlers({ runner: { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push(sql);
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    return { rows: [{ id: TASK, owner_id: OWNER, workspace_id: OTHER, goal_id: null, title: 'Read', description: null, status: 'pending', priority: null, due_kind: 'none', due_date: null, due_at: null, version: 1 }] };
  } }) } });
  const result = await handlers.getTask({ actorId: OWNER, sessionId: SESSION, operation: 'getTask', resourceId: TASK, body: null });
  assert.equal(result.status, 200);
  assert.equal(calls[0].includes('app_sessions'), true);
});

test('read handlers reject a missing session before protected data access', async () => {
  let protectedQuery = false;
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql) => {
    if (!sql.includes('app_sessions')) protectedQuery = true;
    return { rows: [] };
  }) });
  await assert.rejects(handlers.listTasks({ actorId: OWNER, operation: 'listTasks', body: null }), /AUTH_REQUIRED/);
  assert.equal(protectedQuery, false);
});

test('revoked read session fails before the protected query', async () => {
  const calls = [];
  const handlers = createPostgresGatewayReadHandlers({ runner: { withTransaction: async (run) => run({ query: async (sql) => {
    calls.push(sql);
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'revoked', revoked_at: '2026-10-10T00:00:00.000Z' }] };
    throw new Error('protected query must not run');
  } }) } });
  await assert.rejects(handlers.listTasks({ actorId: OWNER, sessionId: SESSION, operation: 'listTasks', body: null }), /AUTH_REQUIRED/);
  assert.equal(calls.length, 1);
});
