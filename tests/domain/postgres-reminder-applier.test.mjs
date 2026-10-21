import assert from 'node:assert/strict';
import test from 'node:test';

const { applyCreateReminder } = await import('../../supabase/functions/_shared/postgres-reminder-applier.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const TASK = '22222222-2222-4222-8222-222222222222';
const REMINDER = '33333333-3333-4333-8333-333333333333';
const MUTATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);

test('reminder creation fails closed on sparse task rows before reminder writes', async () => {
  const sparse = [];
  sparse[1] = { owner_id: OWNER, id: TASK, deleted_at: null };
  let writes = 0;
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.tasks')) return { rows: sparse };
    writes += 1;
    return { rows: [] };
  } };

  await assert.rejects(() => applyCreateReminder(client, {
    operation: 'createReminder',
    actorId: OWNER,
    resourceId: null,
    mutationId: MUTATION,
    requestSha256: HASH,
    body: {
      id: REMINDER,
      taskId: TASK,
      scheduledFor: '2026-10-11T00:00:00.000Z',
      timeZone: 'Asia/Colombo',
      delivery: 'local_device',
    },
  }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(writes, 0);
});
