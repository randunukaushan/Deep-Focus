import assert from 'node:assert/strict';
import test from 'node:test';

const { executePostgresAiProposalOperations } = await import('../../supabase/functions/_shared/postgres-ai-domain-operation-executor.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const OP = '22222222-2222-4222-8222-222222222222';
const TASK = '33333333-3333-4333-8333-333333333333';
const WORKSPACE = '44444444-4444-4444-8444-444444444444';
const PROPOSAL = '55555555-5555-4555-8555-555555555555';
const SHA = 'a'.repeat(64);

function proposal(operation) {
  return { ownerId: OWNER, id: PROPOSAL, contractVersion: 1, version: 1, generationRequestId: '66666666-6666-4666-8666-666666666666', actionType: 'plan_my_day', expiresAt: '2026-10-12T00:00:00.000Z', reviewDigest: SHA, state: 'ready', inputVersions: [], operations: [operation], selectedOperationIds: null, appliedAt: null };
}

test('AI executor maps the reviewed task.create command to the existing owner-bound applier and sync writer', async () => {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.workspaces')) return { rows: [{ owner_id: OWNER, id: WORKSPACE }] };
    if (sql.includes('insert into df_private.tasks')) return { rows: [{ id: TASK, owner_id: OWNER, workspace_id: WORKSPACE, version: 1, status: 'pending' }] };
    if (sql.includes('from df_private.tasks')) return { rows: [{ owner_id: OWNER, id: TASK, workspace_id: WORKSPACE, goal_id: null, title: 'Read', description: 'Read notes', status: 'pending', priority: 'medium', due_kind: 'none', due_date: null, due_at: null, version: 1 }] };
    if (sql.includes('select last_sequence')) return { rows: [{ last_sequence: '7' }] };
    if (sql.includes('insert into df_private.sync_changes')) return { rows: [{ owner_id: params[0], sequence: params[1], entity_kind: params[2], entity_id: params[3], operation: params[4], change_hash: params[6] }] };
    if (sql.includes('update df_private.sync_heads')) return { rows: [{ owner_id: OWNER, last_sequence: '8' }] };
    throw new Error(`unexpected SQL: ${sql}`);
  } };
  const result = await executePostgresAiProposalOperations({
    transaction: { client }, ownerId: OWNER, proposal: proposal({ id: OP, command: 'task.create', targetId: TASK, dependsOn: [], payload: { id: TASK, workspaceId: WORKSPACE, title: 'Read', description: 'Read notes', priority: 'medium', goalId: null, due: { kind: 'none' } } }), selectedOperationIds: [OP],
  });
  assert.equal(result.committedThrough, '8');
  assert.equal(result.responseBody.data.applied[0].command, 'task.create');
  assert.equal(calls.some((call) => call.sql.includes('insert into df_private.tasks')), true);
  assert.equal(calls.some((call) => call.sql.includes('insert into df_private.sync_changes')), true);
});

test('AI executor fails closed for commands outside the canonical first-slice catalog', async () => {
  let writes = 0;
  const client = { query: async () => { writes += 1; return { rows: [] }; } };
  await assert.rejects(() => executePostgresAiProposalOperations({
    transaction: { client }, ownerId: OWNER, proposal: proposal({ id: OP, command: 'goal.delete', targetId: TASK, dependsOn: [], payload: {} }), selectedOperationIds: [OP],
  }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(writes, 0);
});

test('AI executor does not accept a task-create target that differs from its payload identity', async () => {
  const client = { query: async () => { throw new Error('must not run'); } };
  await assert.rejects(() => executePostgresAiProposalOperations({
    transaction: { client }, ownerId: OWNER, proposal: proposal({ id: OP, command: 'task.create', targetId: TASK, dependsOn: [], payload: { id: WORKSPACE, workspaceId: WORKSPACE, title: 'Read', description: '', priority: null, goalId: null, due: { kind: 'none' } } }), selectedOperationIds: [OP],
  }), /VALIDATION_FAILED/);
});

test('AI executor rejects foreign proposals and malformed selections before database writes', async () => {
  let writes = 0;
  const client = { query: async () => { writes += 1; throw new Error('must not run'); } };
  const foreign = { ...proposal({ id: OP, command: 'task.create', targetId: TASK, dependsOn: [], payload: { id: TASK } }), ownerId: WORKSPACE };
  await assert.rejects(() => executePostgresAiProposalOperations({ transaction: { client }, ownerId: OWNER, proposal: foreign, selectedOperationIds: [OP] }), /VALIDATION_FAILED/);
  await assert.rejects(() => executePostgresAiProposalOperations({ transaction: { client }, ownerId: OWNER, proposal: proposal(null), selectedOperationIds: [Symbol('operation')] }), /VALIDATION_FAILED/);
  assert.equal(writes, 0);
});

test('AI executor rejects malformed transaction containers before proposal access', async () => {
  await assert.rejects(() => executePostgresAiProposalOperations(null), /VALIDATION_FAILED/);
  await assert.rejects(() => executePostgresAiProposalOperations({ transaction: null }), /VALIDATION_FAILED/);
  await assert.rejects(() => executePostgresAiProposalOperations({ transaction: { client: Symbol('client') }, ownerId: OWNER, proposal: proposal(null), selectedOperationIds: [] }), /VALIDATION_FAILED|DEPENDENCY_UNAVAILABLE/);
});
