import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresGatewayHandlers } = await import('../../supabase/functions/_shared/postgres-gateway-handlers.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '66666666-6666-4666-8666-666666666666';
const TASK = '22222222-2222-4222-8222-222222222222';
const WORKSPACE = '33333333-3333-4333-8333-333333333333';
const MUTATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);
const EXPORT_JOB = '55555555-5555-4555-8555-555555555555';

function runnerHarness() {
  const calls = [];
  let commits = 0;
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    if (sql.includes('update df_private.sync_heads')) return { rows: [{ owner_id: params[0], last_sequence: params[1] }] };
    if (sql.includes('last_sequence')) return { rows: [{ last_sequence: '0' }] };
    if (sql.includes('sync_heads')) return { rows: [{ owner_id: OWNER }] };
    if (sql.includes('mutation_receipts') && sql.trimStart().startsWith('select')) return { rows: [] };
    if (sql.includes('insert into df_private.mutation_receipts')) return { rows: [{ owner_id: params[0], operation: params[1], mutation_id: params[2], request_sha256: params[3], response_body: JSON.parse(params[4]), response_status: params[5] }] };
    if (sql.includes('insert into df_private.sync_changes')) return { rows: [{ owner_id: params[0], sequence: params[1], entity_kind: params[2], entity_id: params[3], operation: params[4], change_hash: params[6] }] };
    if (sql.includes('from df_private.workspaces')) return { rows: [{ owner_id: OWNER, id: WORKSPACE }] };
    if (sql.includes('insert into df_private.tasks')) return { rows: [{ id: TASK, owner_id: OWNER, workspace_id: WORKSPACE, version: 1, status: 'pending' }] };
    if (sql.includes('update df_private.profiles')) return { rows: [{ owner_id: OWNER, display_name: 'Updated', account_state: 'active', version: 2 }] };
    if (sql.includes('from df_private.tasks')) return { rows: [{ owner_id: OWNER, id: TASK, workspace_id: WORKSPACE, goal_id: null, title: 'Read', description: null, status: 'pending', priority: null, due_kind: 'none', due_date: null, due_at: null, version: 1 }] };
    if (sql.includes('from df_private.profiles')) return { rows: [{ owner_id: OWNER, display_name: 'Updated', account_state: 'active', version: 2 }] };
    return { rows: [] };
  } };
  return { client, calls, get commits() { return commits; }, runner: { withTransaction: async (run) => { const result = await run(client); commits += 1; return result; } } };
}

test('gateway handler registry carries the verified context through transaction and createTask applier', async () => {
  const h = runnerHarness();
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => { throw new Error('must be replaced'); } });
  const result = await handlers.createTask({ actorId: OWNER, sessionId: SESSION, operation: 'createTask', idempotencyKey: MUTATION, requestSha256: HASH, body: { id: TASK, workspaceId: WORKSPACE, title: 'Read' } });
  assert.deepEqual(result, { status: 201, body: { id: TASK, version: 1, status: 'pending' } });
  assert.equal(h.commits, 1);
  assert.equal(h.calls.filter((call) => call.sql.includes('sync_heads')).length, 3);
  assert.equal(h.calls.filter((call) => call.sql.includes('insert into df_private.tasks')).length, 1);
  assert.equal(h.calls.filter((call) => call.sql.startsWith('insert into df_private.mutation_receipts')).length, 1);
});

test('plan action handler keeps route identity and delegates only with an explicit candidate', async () => {
  const h = runnerHarness(); let received;
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }), applyPlanAction: async (input) => { received = input; return { responseStatus: 200, responseBody: { data: { state: 'archived' } } }; } });
  const result = await handlers.applyPlanAction({ actorId: OWNER, sessionId: SESSION, operation: 'applyPlanAction', resourceId: TASK, idempotencyKey: MUTATION, requestSha256: HASH, body: { action: 'archive', expectedVersion: 1, reminderVersions: [] } });
  assert.deepEqual(result, { status: 200, body: { data: { state: 'archived' } } });
  assert.deepEqual(received, { actorId: OWNER, sessionId: SESSION, planId: TASK, mutationId: MUTATION, requestSha256: HASH, command: { action: 'archive', expectedVersion: 1, reminderVersions: [] } });
});

test('plan edit handler keeps route identity and delegates only with an explicit candidate', async () => {
  const h = runnerHarness(); let received;
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }), patchPlan: async (input) => { received = input; return { responseStatus: 200, responseBody: { data: { version: 2 } } }; } });
  const command = { expectedVersion: 1, plan: { id: TASK }, taskVersions: [], reminderActions: [] };
  const result = await handlers.patchPlan({ actorId: OWNER, sessionId: SESSION, operation: 'patchPlan', resourceId: TASK, idempotencyKey: MUTATION, requestSha256: HASH, body: command });
  assert.deepEqual(result, { status: 200, body: { data: { version: 2 } } });
  assert.deepEqual(received, { actorId: OWNER, sessionId: SESSION, planId: TASK, mutationId: MUTATION, requestSha256: HASH, command });
});

test('gateway handler registry exposes only supported write appliers and requires idempotency', async () => {
  const h = runnerHarness();
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 201 }) });
  assert.deepEqual(Object.keys(handlers).sort(), ['applyAiProposal', 'applyPlanAction', 'applySessionEvent', 'applyTaskAction', 'cancelAiGeneration', 'createAiGeneration', 'createGoal', 'createPrivacyExport', 'createReminder', 'createSyncSnapshot', 'createTask', 'deleteGoal', 'deleteReminder', 'deleteTask', 'getAiGenerationRequest', 'getAiProposal', 'getAiUsage', 'getAnalyticsSummary', 'getBillingCatalog', 'getBillingEntitlements', 'getGoal', 'getGoalProgress', 'getMe', 'getPlan', 'getPrivacyJob', 'getSession', 'getSettings', 'getSyncSnapshot', 'getSyncSnapshotPage', 'getTask', 'listAccountSessions', 'listBreaks', 'listGoals', 'listPlans', 'listReminders', 'listSessions', 'listTasks', 'patchGoal', 'patchMe', 'patchPlan', 'patchReminder', 'patchSettings', 'patchTask', 'pullSync', 'pushSync', 'recordBreak', 'revokeAccountSessions', 'signOut', 'startSession']);
  await assert.rejects(handlers.createTask({ actorId: OWNER, operation: 'createTask', requestSha256: HASH, body: { id: TASK, workspaceId: WORKSPACE, title: 'Read' } }), /VALIDATION_FAILED/);
});

test('AI generation route rechecks the session and fails closed while policy is unconfigured', async () => {
  const h = runnerHarness();
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }) });
  await assert.rejects(() => handlers.createAiGeneration({ actorId: OWNER, sessionId: SESSION, operation: 'createAiGeneration', idempotencyKey: MUTATION, requestSha256: HASH, body: { requestId: TASK, taskIds: [TASK], availableStart: '2026-10-11T08:00:00.000Z', availableEnd: '2026-10-11T12:00:00.000Z', timeZone: 'Asia/Colombo', preferences: { defaultFocusMinutes: 25, defaultBreakMinutes: 5, reminderLeadMinutes: null } } }), /POLICY_UNCONFIGURED/);
  assert.equal(h.calls.filter((call) => call.sql.includes('from df_private.app_sessions')).length, 1);
  assert.equal(h.calls.some((call) => call.sql.includes('ai_generation_requests')), false);
});

test('AI apply handler fails closed when the reviewed proposal is missing', async () => {
  const h = runnerHarness();
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }) });
  await assert.rejects(() => handlers.applyAiProposal({ actorId: OWNER, sessionId: SESSION, operation: 'applyAiProposal', resourceId: TASK, idempotencyKey: MUTATION, requestSha256: HASH, body: { expectedProposalVersion: 1, reviewDigest: HASH, selectedOperationIds: [TASK] } }), /AI_PROPOSAL_MISMATCH/);
  assert.equal(h.calls.some((call) => call.sql.includes('from df_private.ai_proposals')), true);
});

test('AI usage handler rechecks the session and reports unconfigured without fabricating allowance buckets', async () => {
  const h = runnerHarness();
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }) });
  const result = await handlers.getAiUsage({ actorId: OWNER, sessionId: SESSION, operation: 'getAiUsage', requestSha256: HASH, body: null });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.status, 'unconfigured');
  assert.equal(result.body.data.availableActions, null);
  assert.equal(h.calls.some((call) => call.sql.includes('from df_private.app_sessions')), true);
});

test('billing visibility handlers recheck the session and return unavailable without fabricated rights or offers', async () => {
  const h = runnerHarness();
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }) });
  const entitlements = await handlers.getBillingEntitlements({ actorId: OWNER, sessionId: SESSION, operation: 'getBillingEntitlements', requestSha256: HASH, body: null });
  const catalog = await handlers.getBillingCatalog({ actorId: OWNER, sessionId: SESSION, operation: 'getBillingCatalog', requestSha256: HASH, body: null });
  assert.equal(entitlements.body.data.status, 'unavailable');
  assert.equal(entitlements.body.data.entitlements, null);
  assert.equal(catalog.body.data.status, 'unavailable');
  assert.equal(catalog.body.data.offers, null);
  assert.equal(h.calls.filter((call) => call.sql.includes('from df_private.app_sessions')).length, 2);
});

test('session revoke handler fails closed until recent-auth and durable replay wiring is supplied', async () => {
  const h = runnerHarness();
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }) });
  await assert.rejects(() => handlers.revokeAccountSessions({ actorId: OWNER, sessionId: SESSION, operation: 'revokeAccountSessions', idempotencyKey: MUTATION, requestSha256: HASH, body: { scope: 'all' } }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(h.calls.length, 0);
});

test('session revoke handler validates the backend response before returning success', async () => {
  const h = runnerHarness();
  const valid = { data: { revokedCount: 2, currentSessionRevoked: false, providerRevocationStatus: 'pending' } };
  const handlers = createPostgresGatewayHandlers({
    runner: h.runner,
    applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }),
    verifyRecentAuth: async () => true,
    revokeAccountSessions: async () => ({ responseBody: valid, responseStatus: 200 }),
  });
  const result = await handlers.revokeAccountSessions({ actorId: OWNER, sessionId: SESSION, operation: 'revokeAccountSessions', idempotencyKey: MUTATION, requestSha256: HASH, body: { scope: 'all' } });
  assert.deepEqual(result, { status: 200, body: valid });

  const malformed = createPostgresGatewayHandlers({
    runner: h.runner,
    applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }),
    verifyRecentAuth: async () => true,
    revokeAccountSessions: async () => ({ responseBody: { data: { revokedCount: -1, currentSessionRevoked: 'no', providerRevocationStatus: 'pending' } }, responseStatus: 200 }),
  });
  await assert.rejects(() => malformed.revokeAccountSessions({ actorId: OWNER, sessionId: SESSION, operation: 'revokeAccountSessions', idempotencyKey: MUTATION, requestSha256: HASH, body: { scope: 'all' } }), /DEPENDENCY_UNAVAILABLE/);
});

test('sign-out handler revokes only the current session and rejects an uncommitted result', async () => {
  const h = runnerHarness();
  const calls = [];
  const handlers = createPostgresGatewayHandlers({
    runner: h.runner,
    applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }),
    signOutSession: async (input) => { calls.push(input); return { responseBody: { data: { revokedCount: 1, currentSessionRevoked: true, providerRevocationStatus: 'pending' } }, responseStatus: 200 }; },
  });
  const result = await handlers.signOut({ actorId: OWNER, sessionId: SESSION, operation: 'signOut', idempotencyKey: MUTATION, requestSha256: HASH, body: {} });
  assert.equal(result.status, 200);
  assert.deepEqual(calls[0].body, { scope: 'one', sessionId: SESSION });
  assert.equal(calls[0].actorId, OWNER);

  const unsafe = createPostgresGatewayHandlers({
    runner: h.runner,
    applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }),
    signOutSession: async () => ({ responseBody: { data: { revokedCount: 0, currentSessionRevoked: false, providerRevocationStatus: 'pending' } }, responseStatus: 200 }),
  });
  await assert.rejects(() => unsafe.signOut({ actorId: OWNER, sessionId: SESSION, operation: 'signOut', idempotencyKey: MUTATION, requestSha256: HASH, body: {} }), /DEPENDENCY_UNAVAILABLE/);
});

test('session revoke handler denies when recent authentication is not verified and never calls the revoke dependency', async () => {
  const h = runnerHarness();
  let revokeCalls = 0;
  const handlers = createPostgresGatewayHandlers({
    runner: h.runner,
    applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }),
    verifyRecentAuth: async () => false,
    revokeAccountSessions: async () => { revokeCalls += 1; return { responseBody: { data: { revokedCount: 0, currentSessionRevoked: false, providerRevocationStatus: 'pending' } }, responseStatus: 200 }; },
  });
  await assert.rejects(() => handlers.revokeAccountSessions({ actorId: OWNER, sessionId: SESSION, operation: 'revokeAccountSessions', idempotencyKey: MUTATION, requestSha256: HASH, body: { scope: 'all' } }), /AUTH_REQUIRED/);
  assert.equal(revokeCalls, 0);
  assert.equal(h.calls.length, 0);
});

test('gateway wires the built-in PostgreSQL revocation handler only after an explicit recent-auth gate', async () => {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push(sql.replace(/\s+/g, ' ').trim());
    if (sql.includes('from df_private.app_session_revocation_receipts')) return { rows: [] };
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: '2026-10-10T00:00:00.000Z', expires_at: '2026-10-12T00:00:00.000Z', revoked_at: null }] };
    if (sql.includes('app_session_revocation_outbox')) return { rows: [{ revocation_id: EXPORT_JOB, owner_id: OWNER, session_id: SESSION }] };
    if (sql.includes('app_session_revocation_receipts')) return { rows: [{ owner_id: params[0], mutation_id: params[1], request_sha256: params[2], session_ids: JSON.parse(params[3]), current_session_revoked: params[4], provider_revocation_status: params[5] }] };
    if (sql.includes('update df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'revoked' }] };
    return { rows: [] };
  } };
  const handlers = createPostgresGatewayHandlers({
    runner: { withTransaction: async (run) => run(client) },
    now: () => '2026-10-11T04:00:00.000Z',
    verifyRecentAuth: async () => true,
    createRevocationId: () => EXPORT_JOB,
    applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }),
  });
  const result = await handlers.revokeAccountSessions({ actorId: OWNER, sessionId: SESSION, operation: 'revokeAccountSessions', idempotencyKey: MUTATION, requestSha256: HASH, body: { scope: 'all' } });
  assert.deepEqual(result, { status: 200, body: { data: { revokedCount: 1, currentSessionRevoked: true, providerRevocationStatus: 'pending' } } });
  assert.equal(calls.some((sql) => sql.includes('app_session_revocation_outbox')), true);
  assert.equal(calls.some((sql) => sql.includes('app_session_revocation_receipts')), true);
});

test('privacy export handler rechecks the session and returns a queued 202 job without exposing storage details', async () => {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    if (sql.includes('insert into df_private.privacy_jobs')) return { rows: [{ job_id: EXPORT_JOB, owner_id: OWNER, operation_id: MUTATION, kind: 'export', state: 'queued', lease_owner: null, fencing_version: 0, lease_expires_at: null, attempt_count: 0, next_attempt_at: '2026-10-11T00:00:00.000Z', safe_error_code: null, artifact_locator: null, artifact_expires_at: null }] };
    return { rows: [] };
  } };
  const handlers = createPostgresGatewayHandlers({ runner: { withTransaction: async (run) => run(client) }, now: () => '2026-10-11T02:00:00.000Z', createPrivacyJobId: () => EXPORT_JOB, applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }) });
  const result = await handlers.createPrivacyExport({ actorId: OWNER, sessionId: SESSION, operation: 'createPrivacyExport', idempotencyKey: MUTATION, requestSha256: HASH, body: { format: 'json', scope: 'own_account_data' } });
  assert.deepEqual(result, { status: 202, body: { data: { id: EXPORT_JOB, kind: 'export', state: 'queued', updatedAt: '2026-10-11T02:00:00.000Z', safeErrorCode: null } } });
  assert.equal(calls[0].sql.includes('from df_private.app_sessions'), true);
  assert.doesNotMatch(JSON.stringify(result), /artifact_locator|private\//, 'queued response must not expose artifact storage metadata');
});

test('snapshot-create handler rechecks the session and returns a queued job with reserved identity only', async () => {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    if (sql.includes('insert into df_private.sync_snapshot_jobs')) return { rows: [{ owner_id: OWNER, job_id: EXPORT_JOB, snapshot_id: TASK, operation_id: MUTATION, state: 'queued', updated_at: '2026-10-11T02:00:00.000Z', safe_error_code: null }] };
    return { rows: [] };
  } };
  const handlers = createPostgresGatewayHandlers({ runner: { withTransaction: async (run) => run(client) }, now: () => '2026-10-11T02:00:00.000Z', createSyncSnapshotJobId: () => EXPORT_JOB, createSyncSnapshotId: () => TASK, applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }) });
  const result = await handlers.createSyncSnapshot({ actorId: OWNER, sessionId: SESSION, operation: 'createSyncSnapshot', idempotencyKey: MUTATION, requestSha256: HASH, body: {} });
  assert.deepEqual(result, { status: 202, body: { data: { id: EXPORT_JOB, snapshotId: TASK, kind: 'snapshot', state: 'queued', updatedAt: '2026-10-11T02:00:00.000Z', safeErrorCode: null } } });
  assert.equal(calls[0].sql.includes('from df_private.app_sessions'), true);
});

test('gateway profile update remains transactional and owner-scoped', async () => {
  const h = runnerHarness();
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }) });
  const result = await handlers.patchMe({ actorId: OWNER, sessionId: SESSION, operation: 'patchMe', idempotencyKey: MUTATION, requestSha256: HASH, body: { expectedVersion: 1, displayName: 'Updated' } });
  assert.deepEqual(result, { status: 200, body: { id: OWNER, displayName: 'Updated', accountState: 'active', version: 2 } });
  assert.equal(h.calls.some((call) => call.sql.includes('update df_private.profiles')), true);
});

test('gateway handler registry keeps a route resource ID server-derived for patchTask', async () => {
  const h = runnerHarness();
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }) });
  await assert.rejects(handlers.patchTask({ actorId: OWNER, sessionId: SESSION, operation: 'patchTask', idempotencyKey: MUTATION, requestSha256: HASH, resourceId: TASK, body: { expectedVersion: 1, title: 'New' } }), /VERSION_CONFLICT|DEPENDENCY_UNAVAILABLE/);
  assert.equal(h.calls.some((call) => call.sql.includes('where id = $1 and owner_id = $2')), true);
});

test('task delete handler returns a committed tombstone receipt through the transaction boundary', async () => {
  const calls = [];
  let receiptBody;
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    if (sql.includes('from df_private.profiles')) return { rows: [{ owner_id: OWNER, display_name: 'Owner', account_state: 'active', version: 1 }] };
    if (sql.includes('mutation_receipts') && sql.trimStart().startsWith('select')) return { rows: [] };
    if (sql.includes('sync_heads') && sql.trimStart().startsWith('select')) return { rows: [{ owner_id: OWNER, last_sequence: '41' }] };
    if (sql.trimStart().startsWith('update df_private.tasks')) return { rows: [{ id: TASK, owner_id: OWNER, version: 2, status: 'pending', deleted_at: '2026-10-11T00:00:00.000Z' }] };
    if (sql.includes('from df_private.tasks')) return { rows: [{ owner_id: OWNER, id: TASK, version: 2, deleted_at: '2026-10-11T00:00:00.000Z' }] };
    if (sql.includes('insert into df_private.sync_changes')) return { rows: [{ owner_id: params[0], sequence: params[1], entity_kind: params[2], entity_id: params[3], operation: params[4], change_hash: params[6] }] };
    if (sql.includes('update df_private.sync_heads')) return { rows: [{ owner_id: OWNER, last_sequence: '42' }] };
    if (sql.includes('insert into df_private.mutation_receipts')) { receiptBody = JSON.parse(params[4]); return { rows: [{ owner_id: OWNER, operation: params[1], mutation_id: params[2], request_sha256: params[3], response_body: receiptBody, response_status: params[5] }] }; }
    return { rows: [] };
  } };
  const runner = { withTransaction: async (run) => run(client) };
  const handlers = createPostgresGatewayHandlers({ runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }) });
  const result = await handlers.deleteTask({ actorId: OWNER, sessionId: SESSION, operation: 'deleteTask', idempotencyKey: MUTATION, requestSha256: HASH, resourceId: TASK, body: { expectedVersion: 1 } });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.tombstone.entity, 'task');
  assert.equal(result.body.data.receipt.committedThrough, '42');
  assert.equal(receiptBody.data.receipt.command, 'task.delete');
  assert.equal(calls.some((call) => call.sql.startsWith('update df_private.tasks')), true);
});

test('authenticated mutation gateway rejects missing session before owner writes', async () => {
  const h = runnerHarness();
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 201 }) });
  await assert.rejects(() => handlers.createTask({ actorId: OWNER, operation: 'createTask', idempotencyKey: MUTATION, requestSha256: HASH, body: { id: TASK, workspaceId: WORKSPACE, title: 'Read' } }), /AUTH_REQUIRED/);
  assert.equal(h.calls.length, 0);
});

test('gateway rejects malformed generated job and snapshot identities before database work', async () => {
  let calls = 0;
  const runner = { withTransaction: async (run) => run({ query: async () => { calls += 1; return { rows: [] }; } }) };
  const privacy = createPostgresGatewayHandlers({ runner, createPrivacyJobId: () => Symbol('job'), applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }) });
  await assert.rejects(() => privacy.createPrivacyExport({ actorId: OWNER, sessionId: SESSION, operation: 'createPrivacyExport', idempotencyKey: MUTATION, requestSha256: HASH, body: { format: 'json', scope: 'own_account_data' } }), /DEPENDENCY_UNAVAILABLE/);
  const snapshot = createPostgresGatewayHandlers({ runner, createSyncSnapshotJobId: () => 'job-id', createSyncSnapshotId: () => Symbol('snapshot'), applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }) });
  await assert.rejects(() => snapshot.createSyncSnapshot({ actorId: OWNER, sessionId: SESSION, operation: 'createSyncSnapshot', idempotencyKey: MUTATION, requestSha256: HASH, body: {} }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(calls, 0);
});
