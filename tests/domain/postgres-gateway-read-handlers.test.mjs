import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresGatewayReadHandlers } = await import('../../supabase/functions/_shared/postgres-gateway-read-handlers.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const TASK = '22222222-2222-4222-8222-222222222222';
const OTHER = '33333333-3333-4333-8333-333333333333';
const SESSION = '66666666-6666-4666-8666-666666666666';
const SETTINGS = '77777777-7777-4777-8777-777777777777';

function runner(query) {
  return {
    withTransaction: async (run) => run({
      query: async (sql, params) => sql.includes('from df_private.app_sessions')
        ? { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] }
        : query(sql, params),
    }),
  };
}

test('getTask binds both route ID and verified actor and returns a safe DTO', async () => {
  let received;
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql, params) => { received = { sql, params }; return { rows: [{ id: TASK, workspace_id: OTHER, goal_id: null, title: 'Read', description: null, status: 'pending', priority: null, due_kind: 'none', due_date: null, due_at: null, version: 1 }] }; }) });
  const result = await handlers.getTask({ actorId: OWNER, sessionId: SESSION, operation: 'getTask', resourceId: TASK, body: null });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { id: TASK, workspaceId: OTHER, goalId: null, title: 'Read', description: null, status: 'pending', priority: null, due: { kind: 'none' }, version: 1 });
  assert.deepEqual(received.params, [TASK, OWNER]);
});

test('listTasks uses a bounded owner-scoped query and maps typed deadlines', async () => {
  let received;
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async (sql, params) => { received = { sql, params }; return { rows: [{ id: TASK, workspace_id: OTHER, goal_id: null, title: 'Read', description: null, status: 'pending', priority: 'high', due_kind: 'date', due_date: '2026-10-10', due_at: null, version: 2 }] }; }) });
  const result = await handlers.listTasks({ actorId: OWNER, sessionId: SESSION, operation: 'listTasks', body: null });
  assert.deepEqual(result.body.items[0].due, { kind: 'date', date: '2026-10-10' });
  assert.match(received.sql, /limit 100/i);
  assert.deepEqual(received.params, [OWNER]);
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

test('read handlers fail closed when storage returns a foreign-shaped resource row', async () => {
  const handlers = createPostgresGatewayReadHandlers({ runner: runner(async () => ({ rows: [{ id: OTHER, workspace_id: OTHER, goal_id: null, title: 'Foreign', description: null, status: 'pending', priority: null, due_kind: 'none', due_date: null, due_at: null, version: 1 }] })) });
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
    return { rows: [{ id: TASK, workspace_id: OTHER, goal_id: null, title: 'Read', description: null, status: 'pending', priority: null, due_kind: 'none', due_date: null, due_at: null, version: 1 }] };
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
