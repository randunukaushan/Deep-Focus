/** Local PostgreSQL candidate for the owner-bound startSession operation. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';
import type { PostgresMutationApplyInput, PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const ALLOWED_FIELDS = new Set(['id', 'workspaceId', 'taskId', 'plannedMs', 'startedAt']);
const STATUSES = new Set(['active', 'paused', 'completed', 'cancelled']);
const EVENT_FIELDS = new Set(['id', 'expectedVersion', 'type', 'occurredAt', 'clientSequence']);
const EVENT_TYPES = new Set(['pause', 'resume', 'complete', 'cancel']);
const MAX_SAFE = Number.MAX_SAFE_INTEGER;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function queryRows<T = Record<string, unknown>>(result: unknown): T[] {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) unavailable();
  return result.rows as T[];
}
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function validateSessionBoundary(client: unknown, input: unknown, operation: string, requiresResource = false): asserts input is PostgresMutationApplyInput {
  if (!isRecord(client) || typeof client.query !== 'function') unavailable();
  if (!isRecord(input) || input.operation !== operation || !isUuid(input.actorId) || !isRecord(input.body)
    || (requiresResource && !isUuid(input.resourceId))) invalid();
}
function uuid(value: unknown): string { if (typeof value !== 'string' || !UUID.test(value)) invalid(); return value; }
function instant(value: unknown): string { if (typeof value !== 'string' || !INSTANT.test(value) || Number.isNaN(Date.parse(value))) invalid(); return value; }
function positiveMs(value: unknown): number { if (!Number.isSafeInteger(value) || (value as number) < 1 || (value as number) > Number.MAX_SAFE_INTEGER) invalid(); return value as number; }
function storedInteger(value: unknown, minimum = 0): number | null {
  if (Number.isSafeInteger(value) && (value as number) >= minimum) return value as number;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= MAX_SAFE ? parsed : null;
}

export async function applyStartSession(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 201 }> {
  validateSessionBoundary(client, input, 'startSession');
  if (input.operation !== 'startSession' || !input.body || Array.isArray(input.body)) invalid();
  const body = input.body as Record<string, unknown>;
  if (Object.keys(body).some((key) => !ALLOWED_FIELDS.has(key))) invalid();
  const id = uuid(body.id);
  const workspaceId = uuid(body.workspaceId);
  const taskId = body.taskId === undefined || body.taskId === null ? null : uuid(body.taskId);
  const plannedMs = positiveMs(body.plannedMs);
  const startedAt = instant(body.startedAt);
  let taskTitleSnapshot: string | null = null;
  if (taskId !== null) {
    const taskResult = await client.query<{ owner_id: string; workspace_id: string; id: string; title: string }>(
      `select owner_id, workspace_id, id, title from df_private.tasks
       where id = $1 and owner_id = $2 and workspace_id = $3 and deleted_at is null`,
      [taskId, input.actorId, workspaceId],
    );
    const taskRows = queryRows<{ owner_id: string; workspace_id: string; id: string; title: string }>(taskResult);
    if (taskRows.length > 1) unavailable();
    const task = taskRows[0];
    if (!task || task.owner_id !== input.actorId || task.workspace_id !== workspaceId || task.id !== taskId || typeof task.title !== 'string' || task.title.length > 240) {
      throw new SafeBoundaryError(404, 'NOT_FOUND');
    }
    taskTitleSnapshot = task.title;
  } else {
    const workspace = await client.query<{ owner_id: string; id: string }>(
      `select owner_id, id from df_private.workspaces where id = $1 and owner_id = $2`,
      [workspaceId, input.actorId],
    );
    const workspaceRows = queryRows<{ owner_id: string; id: string }>(workspace);
    if (workspaceRows.length > 1) unavailable();
    if (workspaceRows.length !== 1 || workspaceRows[0]?.owner_id !== input.actorId || workspaceRows[0]?.id !== workspaceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
  }
  const result = await client.query<{ id: string; owner_id: string; workspace_id: string; version: number; status: string }>(
    `insert into df_private.focus_sessions
     (id, owner_id, workspace_id, task_id, task_title_snapshot, status, contract_version, planned_ms, focused_ms, paused_ms, started_at)
     values ($1, $2, $3, $4, $5, 'active', 2, $6, 0, 0, $7)
     returning id, owner_id, workspace_id, version, status`,
    [id, input.actorId, workspaceId, taskId, taskTitleSnapshot, plannedMs, startedAt],
  );
  const resultRows = queryRows<{ id: string; owner_id: string; workspace_id: string; version: number; status: string }>(result);
  if (resultRows.length > 1) unavailable();
  const row = resultRows[0];
  if (!row || row.id !== id || row.owner_id !== input.actorId || row.workspace_id !== workspaceId || !Number.isInteger(row.version) || row.version < 1 || typeof row.status !== 'string' || !STATUSES.has(row.status)) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  return { responseBody: { id: row.id, version: row.version, status: row.status }, responseStatus: 201 };
}

export async function applySessionEvent(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 200 }> {
  validateSessionBoundary(client, input, 'applySessionEvent', true);
  if (input.operation !== 'applySessionEvent' || !input.body || Array.isArray(input.body) || !input.resourceId) invalid();
  const body = input.body as Record<string, unknown>;
  if (Object.keys(body).some((key) => !EVENT_FIELDS.has(key)) || body.id !== input.resourceId) invalid();
  const expectedVersion = positiveMs(body.expectedVersion);
  const type = typeof body.type === 'string' && EVENT_TYPES.has(body.type) ? body.type : invalid();
  const occurredAt = instant(body.occurredAt);
  const clientSequence = positiveMs(body.clientSequence);
  const sessionResult = await client.query<{
    owner_id: string; id: string; status: string; version: number; planned_ms: number | string; focused_ms: number | string; paused_ms: number | string; started_at: string; last_event_sequence: number | string;
  }>(
    `select owner_id, id, status, version, planned_ms, focused_ms, paused_ms, started_at, last_event_sequence
     from df_private.focus_sessions where id = $1 and owner_id = $2 for update`,
    [input.resourceId, input.actorId],
  );
  const sessionRows = queryRows<{ owner_id: string; id: string; status: string; version: number; planned_ms: number | string; focused_ms: number | string; paused_ms: number | string; started_at: string; last_event_sequence: number | string }>(sessionResult);
  if (sessionRows.length > 1) unavailable();
  const session = sessionRows[0];
  if (!session || session.owner_id !== input.actorId || session.id !== input.resourceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
  const plannedMs = storedInteger(session.planned_ms, 1);
  const focusedMsStored = storedInteger(session.focused_ms);
  const pausedMsStored = storedInteger(session.paused_ms);
  const lastEventSequence = storedInteger(session.last_event_sequence);
  if (plannedMs === null || focusedMsStored === null || pausedMsStored === null || lastEventSequence === null) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  if (!STATUSES.has(session.status) || session.version !== expectedVersion) throw new SafeBoundaryError(409, 'VERSION_CONFLICT');
  if (!['active', 'paused'].includes(session.status)) throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
  if (clientSequence !== lastEventSequence + 1) throw new SafeBoundaryError(409, 'SEQUENCE_CONFLICT');
  const latest = await client.query<{ type: string; occurred_at: string }>(
    `select type, occurred_at from df_private.focus_events where owner_id = $1 and session_id = $2 order by sequence desc limit 1`,
    [input.actorId, input.resourceId],
  );
  const latestRows = queryRows<{ type: string; occurred_at: string }>(latest);
  if (latestRows.length > 1) unavailable();
  const previousAt = latestRows[0]?.occurred_at ?? session.started_at;
  const elapsed = Date.parse(occurredAt) - Date.parse(previousAt);
  if (!Number.isFinite(elapsed) || elapsed < 0) throw new SafeBoundaryError(422, 'EVENT_ORDER_INVALID');
  if (type === 'pause' && session.status !== 'active') throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
  if (type === 'resume' && session.status !== 'paused') throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
  const focusedMs = focusedMsStored + (session.status === 'active' ? elapsed : 0);
  const pausedMs = pausedMsStored + (session.status === 'paused' ? elapsed : 0);
  if (!Number.isSafeInteger(focusedMs) || !Number.isSafeInteger(pausedMs) || focusedMs > plannedMs || pausedMs < 0) throw new SafeBoundaryError(422, 'SESSION_TOTAL_INVALID');
  if (type === 'complete' && focusedMs !== plannedMs) throw new SafeBoundaryError(409, 'SESSION_NOT_COMPLETE');
  const status = type === 'pause' ? 'paused' : type === 'resume' ? 'active' : type === 'complete' ? 'completed' : 'cancelled';
  const insertedEvent = await client.query<{ owner_id: string; session_id: string; sequence: number | string; type: string }>(
    `insert into df_private.focus_events (id, owner_id, session_id, sequence, type, occurred_at)
     values (gen_random_uuid(), $1, $2, $3, $4, $5)
     returning owner_id, session_id, sequence, type`,
    [input.actorId, input.resourceId, clientSequence, type, occurredAt],
  );
  const insertedRows = queryRows<{ owner_id: string; session_id: string; sequence: number | string; type: string }>(insertedEvent);
  const insertedRow = insertedRows[0];
  const insertedSequence = insertedRow ? storedInteger(insertedRow.sequence, 1) : null;
  if (
    insertedRows.length !== 1
    || insertedRow?.owner_id !== input.actorId
    || insertedRow?.session_id !== input.resourceId
    || insertedSequence !== clientSequence
    || insertedRow?.type !== type
  ) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  const updated = await client.query<{ id: string; owner_id: string; version: number; status: string }>(
    `update df_private.focus_sessions
     set status = $4, focused_ms = $5, paused_ms = $6, last_event_sequence = $7,
         ended_at = case when $4 in ('completed', 'cancelled') then $8::timestamptz else ended_at end,
         recorded_at = case when $4 in ('completed', 'cancelled') then $8::timestamptz else recorded_at end,
         version = version + 1, updated_at = now()
     where id = $1 and owner_id = $2 and version = $3
     returning id, owner_id, version, status`,
    [input.resourceId, input.actorId, expectedVersion, status, focusedMs, pausedMs, clientSequence, occurredAt],
  );
  const updatedRows = queryRows<{ id: string; owner_id: string; version: number; status: string }>(updated);
  if (updatedRows.length > 1) unavailable();
  const row = updatedRows[0];
  if (!row || row.id !== input.resourceId || row.owner_id !== input.actorId || !Number.isInteger(row.version) || row.version < 1 || !STATUSES.has(row.status)) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  return { responseBody: { id: row.id, version: row.version, status: row.status }, responseStatus: 200 };
}
