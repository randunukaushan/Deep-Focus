import assert from 'node:assert/strict';
import test from 'node:test';

const { applyRecordBreak } = await import('../../supabase/functions/_shared/postgres-break-applier.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const BREAK = '33333333-3333-4333-8333-333333333333';
const MUTATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);
const body = { id: BREAK, focusSessionId: SESSION, startedAt: '2026-10-10T01:25:00.000Z', endedAt: '2026-10-10T01:30:00.000Z', plannedMs: 300000, outcome: 'completed' };
const input = { actorId: OWNER, operation: 'recordBreak', mutationId: MUTATION, requestSha256: HASH, body };

test('recordBreak derives actualMs and binds the record to an owned terminal session', async () => {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.focus_sessions')) return { rows: [{ owner_id: OWNER, id: SESSION, status: 'completed', ended_at: '2026-10-10T01:25:00.000Z' }] };
    if (sql.includes('select id from df_private.break_records')) return { rows: [] };
    return { rows: [{ id: BREAK, owner_id: OWNER, focus_session_id: SESSION, started_at: body.startedAt, ended_at: body.endedAt, planned_ms: 300000, actual_ms: 300000, outcome: 'completed', version: 1, verification_state: 'pending' }] };
  } };
  const result = await applyRecordBreak(client, input);
  assert.deepEqual(result, { responseBody: { id: BREAK, focusSessionId: SESSION, startedAt: body.startedAt, endedAt: body.endedAt, plannedMs: 300000, actualMs: 300000, outcome: 'completed', version: 1, verificationState: 'pending' }, responseStatus: 201 });
  assert.deepEqual(calls[0].params, [OWNER, SESSION]);
  assert.deepEqual(calls[2].params, [BREAK, OWNER, SESSION, body.startedAt, body.endedAt, 300000, 300000, 'completed']);
});

test('recordBreak rejects foreign, active and duplicate records before insert', async () => {
  let insertCalled = false;
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.focus_sessions')) return { rows: [{ owner_id: '55555555-5555-4555-8555-555555555555', id: SESSION, status: 'completed', ended_at: body.startedAt }] };
    insertCalled = true;
    return { rows: [{ id: BREAK }] };
  } };
  await assert.rejects(applyRecordBreak(client, input), /NOT_FOUND/);
  assert.equal(insertCalled, false);
  const activeClient = { query: async (sql) => sql.includes('from df_private.focus_sessions') ? { rows: [{ owner_id: OWNER, id: SESSION, status: 'active', ended_at: null }] } : { rows: [] } };
  await assert.rejects(applyRecordBreak(activeClient, input), /BREAK_SESSION_INVALID/);
  const duplicateClient = { query: async (sql) => {
    if (sql.includes('from df_private.focus_sessions')) return { rows: [{ owner_id: OWNER, id: SESSION, status: 'completed', ended_at: body.startedAt }] };
    return { rows: [{ id: BREAK }] };
  } };
  await assert.rejects(applyRecordBreak(duplicateClient, input), /ALREADY_EXISTS/);
});

test('recordBreak rejects reversed, inconsistent and unsafe input without SQL', async () => {
  let calls = 0;
  const client = { query: async () => { calls += 1; return { rows: [] }; } };
  await assert.rejects(applyRecordBreak(client, { ...input, body: { ...body, endedAt: body.startedAt } }), /VALIDATION_FAILED/);
  await assert.rejects(applyRecordBreak(client, { ...input, body: { ...body, outcome: 'ended_early' } }), /VALIDATION_FAILED/);
  await assert.rejects(applyRecordBreak(client, { ...input, body: { ...body, ownerId: OWNER } }), /VALIDATION_FAILED/);
  assert.equal(calls, 0);
});
