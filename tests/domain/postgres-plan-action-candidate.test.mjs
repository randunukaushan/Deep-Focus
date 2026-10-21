import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresPlanActionCandidate } = await import('../../supabase/functions/_shared/postgres-plan-lifecycle-adapter.ts');
const OWNER = '11111111-1111-4111-8111-111111111111';
const PLAN = '22222222-2222-4222-8222-222222222222';
const REMINDER = '33333333-3333-4333-8333-333333333333';
const MUTATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);
const NOW = '2026-10-11T00:00:00.000Z';

function harness() {
  const receipts = new Map(); const calls = [];
  const client = { query: async (sql, params) => {
    const q = sql.replace(/\s+/g, ' ').trim(); calls.push(q);
    if (q.includes('from df_private.profiles')) return { rows: [{ owner_id: OWNER, account_state: 'active' }] };
    if (q.includes('from df_private.sync_heads')) return { rows: [{ owner_id: OWNER }] };
    if (q.includes('from df_private.mutation_receipts')) { const key = `${params[0]}:${params[1]}:${params[2]}`; return { rows: receipts.has(key) ? [receipts.get(key)] : [] }; }
    if (q.startsWith('insert into df_private.mutation_receipts')) { const row = { owner_id: params[0], operation: params[1], mutation_id: params[2], request_sha256: params[3], response_body: JSON.parse(params[4]), response_status: params[5] }; receipts.set(`${params[0]}:${params[1]}:${params[2]}`, row); return { rows: [row] }; }
    if (q.includes('from df_private.ai_plans')) return { rows: [{ id: PLAN, owner_id: OWNER, state: 'active', version: 2, deleted_at: null }] };
    if (q.startsWith('select r.id')) return { rows: [{ id: REMINDER, version: 4 }] };
    if (q.startsWith('update df_private.task_reminders')) return { rows: [{ id: REMINDER, version: 5 }] };
    if (q.startsWith('update df_private.ai_plans')) return { rows: [{ id: PLAN, version: 3, state: 'archived', deleted_at: null }] };
    return { rows: [] };
  } };
  return { receipts, calls, runner: { withTransaction: async (run) => run(client) } };
}

const command = { action: 'archive', expectedVersion: 2, reminderVersions: [{ id: REMINDER, expectedVersion: 4 }] };

test('plan action candidate stores one receipt and exact replay is read-only', async () => {
  const h = harness(); const candidate = createPostgresPlanActionCandidate({ runner: h.runner, now: NOW });
  const first = await candidate.execute({ actorId: OWNER, planId: PLAN, mutationId: MUTATION, requestSha256: HASH, command });
  const beforeWrites = h.calls.filter((call) => call.startsWith('update df_private.') || call.startsWith('insert into df_private.')).length;
  const replay = await candidate.execute({ actorId: OWNER, planId: PLAN, mutationId: MUTATION, requestSha256: HASH, command });
  const afterWrites = h.calls.filter((call) => call.startsWith('update df_private.') || call.startsWith('insert into df_private.')).length;
  assert.equal(first.action, 'applied'); assert.equal(replay.action, 'replayed'); assert.equal(afterWrites, beforeWrites);
});

test('changed intent with the same mutation ID is rejected', async () => {
  const h = harness(); const candidate = createPostgresPlanActionCandidate({ runner: h.runner, now: NOW });
  await candidate.execute({ actorId: OWNER, planId: PLAN, mutationId: MUTATION, requestSha256: HASH, command });
  await assert.rejects(() => candidate.execute({ actorId: OWNER, planId: PLAN, mutationId: MUTATION, requestSha256: 'b'.repeat(64), command }), /IDEMPOTENCY_CONFLICT/);
});
