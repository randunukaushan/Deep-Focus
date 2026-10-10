import assert from 'node:assert/strict';
import test from 'node:test';

const { applySessionEvent } = await import('../../supabase/functions/_shared/postgres-session-applier.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const MUTATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);

function input(overrides = {}) {
  return { actorId: OWNER, operation: 'applySessionEvent', mutationId: MUTATION, resourceId: SESSION, requestSha256: HASH, body: {
    id: SESSION, expectedVersion: 1, type: 'pause', occurredAt: '2026-10-10T01:05:00.000Z', clientSequence: 1, ...overrides,
  } };
}

test('session event locks, inserts an ordered event, and updates focused time atomically', async () => {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.focus_sessions')) return { rows: [{ owner_id: OWNER, id: SESSION, status: 'active', version: 1, planned_ms: 1500000, focused_ms: 300000, paused_ms: 0, started_at: '2026-10-10T01:00:00.000Z', last_event_sequence: 0 }] };
    if (sql.includes('from df_private.focus_events')) return { rows: [] };
    if (sql.trimStart().startsWith('insert')) return { rows: [{ owner_id: OWNER, session_id: SESSION, sequence: 1, type: 'pause' }] };
    return { rows: [{ id: SESSION, owner_id: OWNER, version: 2, status: 'paused' }] };
  } };
  const result = await applySessionEvent(client, input());
  assert.deepEqual(result, { responseBody: { id: SESSION, version: 2, status: 'paused' }, responseStatus: 200 });
  assert.equal(calls.length, 4);
  assert.deepEqual(calls[1].params, [OWNER, SESSION]);
  assert.deepEqual(calls[2].params, [OWNER, SESSION, 1, 'pause', '2026-10-10T01:05:00.000Z']);
  assert.equal(calls[3].params[4], 600000);
});

test('session event fails closed when event insert is not acknowledged', async () => {
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.focus_sessions')) return { rows: [{ owner_id: OWNER, id: SESSION, status: 'active', version: 1, planned_ms: 1500000, focused_ms: 300000, paused_ms: 0, started_at: '2026-10-10T01:00:00.000Z', last_event_sequence: 0 }] };
    if (sql.includes('from df_private.focus_events')) return { rows: [] };
    if (sql.trimStart().startsWith('insert')) return { rows: [] };
    return { rows: [{ id: SESSION, owner_id: OWNER, version: 2, status: 'paused' }] };
  } };
  await assert.rejects(applySessionEvent(client, input()), (error) => error?.code === 'DEPENDENCY_UNAVAILABLE');
});

test('session event rejects foreign returned event metadata before updating', async () => {
  let sessionUpdateCalled = false;
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.focus_sessions')) return { rows: [{ owner_id: OWNER, id: SESSION, status: 'active', version: 1, planned_ms: 1500000, focused_ms: 300000, paused_ms: 0, started_at: '2026-10-10T01:00:00.000Z', last_event_sequence: 0 }] };
    if (sql.includes('from df_private.focus_events')) return { rows: [] };
    if (sql.trimStart().startsWith('insert')) return { rows: [{ owner_id: '99999999-9999-4999-8999-999999999999', session_id: SESSION, sequence: 1, type: 'pause' }] };
    sessionUpdateCalled = true;
    return { rows: [{ id: SESSION, version: 2, status: 'paused' }] };
  } };
  await assert.rejects(applySessionEvent(client, input()), (error) => error?.code === 'DEPENDENCY_UNAVAILABLE');
  assert.equal(sessionUpdateCalled, false);
});

test('session event rejects foreign returned session update metadata', async () => {
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.focus_sessions')) return { rows: [{ owner_id: OWNER, id: SESSION, status: 'active', version: 1, planned_ms: 1500000, focused_ms: 300000, paused_ms: 0, started_at: '2026-10-10T01:00:00.000Z', last_event_sequence: 0 }] };
    if (sql.includes('from df_private.focus_events')) return { rows: [] };
    if (sql.trimStart().startsWith('insert')) return { rows: [{ owner_id: OWNER, session_id: SESSION, sequence: 1, type: 'pause' }] };
    return { rows: [{ id: SESSION, owner_id: '99999999-9999-4999-8999-999999999999', version: 2, status: 'paused' }] };
  } };
  await assert.rejects(applySessionEvent(client, input()), (error) => error?.code === 'DEPENDENCY_UNAVAILABLE');
});

test('session event rejects stale sequence, wrong state and out-of-order clocks', async () => {
  const session = { owner_id: OWNER, id: SESSION, status: 'paused', version: 2, planned_ms: 1500000, focused_ms: 300000, paused_ms: 0, started_at: '2026-10-10T01:00:00.000Z', last_event_sequence: 2 };
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.focus_sessions')) return { rows: [session] };
    if (sql.includes('from df_private.focus_events')) return { rows: [{ type: 'pause', occurred_at: '2026-10-10T01:05:00.000Z' }] };
    return { rows: [] };
  } };
  await assert.rejects(applySessionEvent(client, input({ expectedVersion: 2, clientSequence: 1, type: 'resume' })), /SEQUENCE_CONFLICT/);
  await assert.rejects(applySessionEvent(client, input({ expectedVersion: 2, clientSequence: 3, type: 'pause' })), /INVALID_TRANSITION/);
  await assert.rejects(applySessionEvent(client, input({ expectedVersion: 2, clientSequence: 3, type: 'resume', occurredAt: '2026-10-10T01:04:00.000Z' })), /EVENT_ORDER_INVALID/);
});

test('session completion requires the planned focused total and rejects ownership injection', async () => {
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.focus_sessions')) return { rows: [{ owner_id: OWNER, id: SESSION, status: 'active', version: 1, planned_ms: 1500000, focused_ms: 300000, paused_ms: 0, started_at: '2026-10-10T01:00:00.000Z', last_event_sequence: 0 }] };
    if (sql.includes('from df_private.focus_events')) return { rows: [] };
    return { rows: [] };
  } };
  await assert.rejects(applySessionEvent(client, input({ type: 'complete' })), /SESSION_NOT_COMPLETE/);
  await assert.rejects(applySessionEvent(client, { ...input(), body: { ...input().body, ownerId: OWNER } }), /VALIDATION_FAILED/);
});

test('session event fails closed when the locked session row returns another owner', async () => {
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.focus_sessions')) return { rows: [{ owner_id: '33333333-3333-4333-8333-333333333333', id: SESSION, status: 'active', version: 1, planned_ms: 1500000, focused_ms: 300000, paused_ms: 0, started_at: '2026-10-10T01:00:00.000Z', last_event_sequence: 0 }] };
    return { rows: [] };
  } };
  await assert.rejects(() => applySessionEvent(client, input()), /NOT_FOUND/);
});
