import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresAiPlanReader } = await import('../../supabase/functions/_shared/postgres-ai-plan-read-adapter.ts');
const OWNER = '11111111-1111-4111-8111-111111111111'; const PLAN = '22222222-2222-4222-8222-222222222222'; const REQUEST = '33333333-3333-4333-8333-333333333333'; const PROPOSAL = '44444444-4444-4444-8444-444444444444'; const TASK = '55555555-5555-4555-8555-555555555555'; const BLOCK = '66666666-6666-4666-8666-666666666666'; const NOW = '2026-10-11T00:00:00.000Z';
function harness({ foreign = false, malformed = false, duplicate = false, outsideWindow = false, sparse = false, sparsePlan = false } = {}) {
  const calls = [];
  const runner = {
    withTransaction: async (run) => run({
      query: async (sql, params) => {
        const q = sql.replace(/\s+/g, ' ').trim();
        calls.push({ q, params });
        if (q.includes('from df_private.ai_plans')) {
          const plan = { owner_id: foreign ? '77777777-7777-4777-8777-777777777777' : OWNER, id: PLAN, workspace_id: '88888888-8888-4888-8888-888888888888', generation_request_id: REQUEST, proposal_id: PROPOSAL, contract_version: 2, version: 1, local_date: '2026-10-11', time_zone: 'Asia/Colombo', available_start: NOW, available_end: '2026-10-11T02:00:00.000Z', explanation: malformed ? '' : 'Plan', state: 'active', deleted_at: null, confirmed_at: NOW, created_at: NOW, updated_at: NOW };
          if (sparsePlan) { const rows = []; rows[1] = plan; return { rows }; }
          return { rows: [plan] };
        }
        if (q.includes('from df_private.ai_plan_blocks')) {
          const block = { owner_id: OWNER, plan_id: PLAN, id: BLOCK, kind: 'focus', task_id: TASK, after_block_id: null, starts_at: outsideWindow ? '2026-10-11T02:10:00.000Z' : '2026-10-11T00:10:00.000Z', ends_at: outsideWindow ? '2026-10-11T02:35:00.000Z' : '2026-10-11T00:35:00.000Z', reminder_id: null, version: 1 };
          if (sparse) { const rows = []; rows[1] = block; return { rows }; }
          return { rows: duplicate ? [block, { ...block }] : [block] };
        }
        return { rows: [] };
      },
    }),
  };
  return { runner, calls };
}
test('plan reader returns an owner-bound typed plan and ordered block', async () => { const result = await createPostgresAiPlanReader(harness()).load(OWNER, PLAN); assert.equal(result.ownerId, OWNER); assert.equal(result.blocks[0].taskId, TASK); });
test('missing plan returns null without fabricating a record', async () => { const h = harness(); h.runner.withTransaction = async (run) => run({ query: async () => ({ rows: [] }) }); assert.equal(await createPostgresAiPlanReader(h).load(OWNER, PLAN), null); });
test('foreign and malformed plan rows fail closed', async () => { await assert.rejects(createPostgresAiPlanReader(harness({ foreign: true })).load(OWNER, PLAN), /DEPENDENCY_UNAVAILABLE/); await assert.rejects(createPostgresAiPlanReader(harness({ malformed: true })).load(OWNER, PLAN), /DEPENDENCY_UNAVAILABLE/); });
test('duplicate and out-of-window blocks fail closed', async () => { await assert.rejects(createPostgresAiPlanReader(harness({ duplicate: true })).load(OWNER, PLAN), /DEPENDENCY_UNAVAILABLE/); await assert.rejects(createPostgresAiPlanReader(harness({ outsideWindow: true })).load(OWNER, PLAN), /DEPENDENCY_UNAVAILABLE/); });
test('plan reader fails closed when storage returns sparse block rows', async () => { await assert.rejects(createPostgresAiPlanReader(harness({ sparse: true })).load(OWNER, PLAN), /DEPENDENCY_UNAVAILABLE/); });
test('plan reader fails closed when storage returns sparse plan rows', async () => { await assert.rejects(createPostgresAiPlanReader(harness({ sparsePlan: true })).load(OWNER, PLAN), /DEPENDENCY_UNAVAILABLE/); });
test('invalid identity fails before opening the database transaction', async () => { let calls = 0; const runner = { withTransaction: async () => { calls += 1; return null; } }; await assert.rejects(createPostgresAiPlanReader({ runner }).load('bad', PLAN), /VALIDATION_FAILED/); await assert.rejects(createPostgresAiPlanReader({ runner }).load(Symbol('owner'), PLAN), /VALIDATION_FAILED/); assert.equal(calls, 0); });

test('plan reader rejects coerced UUID fields and malformed rows', async () => {
  const h = harness();
  h.runner.withTransaction = async (run) => run({ query: async (sql) => {
    if (sql.includes('from df_private.ai_plans')) return { rows: [{ owner_id: OWNER, id: PLAN, workspace_id: 888, generation_request_id: REQUEST, proposal_id: PROPOSAL, contract_version: 2, version: 1, local_date: '2026-10-11', time_zone: 'Asia/Colombo', available_start: NOW, available_end: '2026-10-11T02:00:00.000Z', explanation: 'Plan', state: 'active', deleted_at: null, confirmed_at: NOW, created_at: NOW, updated_at: NOW }] };
    return { rows: [null] };
  } });
  await assert.rejects(() => createPostgresAiPlanReader(h).load(OWNER, PLAN), /DEPENDENCY_UNAVAILABLE/);
});

test('plan reader rejects malformed runner and client dependencies before queries', async () => {
  assert.throws(() => createPostgresAiPlanReader(null), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresAiPlanReader({ runner: { withTransaction: 'nope' } }), /VALIDATION_FAILED/);
  const { readPostgresAiPlanWithClient } = await import('../../supabase/functions/_shared/postgres-ai-plan-read-adapter.ts');
  await assert.rejects(() => readPostgresAiPlanWithClient(null, OWNER, PLAN), /DEPENDENCY_UNAVAILABLE/);
});
