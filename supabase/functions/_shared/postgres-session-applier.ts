/** Local PostgreSQL candidate for the owner-bound startSession operation. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresMutationApplyInput, PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const ALLOWED_FIELDS = new Set(['id', 'workspaceId', 'taskId', 'plannedMs', 'startedAt']);
const STATUSES = new Set(['active', 'paused', 'completed', 'cancelled']);
const EVENT_FIELDS = new Set(['id', 'expectedVersion', 'type', 'occurredAt', 'clientSequence']);
const EVENT_TYPES = new Set(['pause', 'resume', 'complete', 'cancel']);

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function uuid(value: unknown): string { if (typeof value !== 'string' || !UUID.test(value)) invalid(); return value; }
function instant(value: unknown): string { if (typeof value !== 'string' || !INSTANT.test(value) || Number.isNaN(Date.parse(value))) invalid(); return value; }
function positiveMs(value: unknown): number { if (!Number.isSafeInteger(value) || (value as number) < 1 || (value as number) > Number.MAX_SAFE_INTEGER) invalid(); return value as number; }

export async function applyStartSession(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 201 }> {
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
    const task = taskResult.rows[0];
    if (!task || task.owner_id !== input.actorId || task.workspace_id !== workspaceId || task.id !== taskId || typeof task.title !== 'string' || task.title.length > 240) {
      throw new SafeBoundaryError(404, 'NOT_FOUND');
    }
    taskTitleSnapshot = task.title;
  } else {
    const workspace = await client.query<{ owner_id: string; id: string }>(
      `select owner_id, id from df_private.workspaces where id = $1 and owner_id = $2`,
      [workspaceId, input.actorId],
    );
    if (workspace.rows.length !== 1 || workspace.rows[0]?.owner_id !== input.actorId || workspace.rows[0]?.id !== workspaceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
  }
  const result = await client.query<{ id: string; owner_id: string; workspace_id: string; version: number; status: string }>(
    `insert into df_private.focus_sessions
     (id, owner_id, workspace_id, task_id, task_title_snapshot, status, contract_version, planned_ms, focused_ms, paused_ms, started_at)
     values ($1, $2, $3, $4, $5, 'active', 2, $6, 0, 0, $7)
     returning id, owner_id, workspace_id, version, status`,
    [id, input.actorId, workspaceId, taskId, taskTitleSnapshot, plannedMs, startedAt],
  );
  const row = result.rows[0];
  if (!row || row.id !== id || row.owner_id !== input.actorId || row.workspace_id !== workspaceId || !Number.isInteger(row.version) || row.version < 1 || typeof row.status !== 'string' || !STATUSES.has(row.status)) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  return { responseBody: { id: row.id, version: row.version, status: row.status }, responseStatus: 201 };
}

export async function applySessionEvent(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 200 }> {
  if (input.operation !== 'applySessionEvent' || !input.body || Array.isArray(input.body) || !input.resourceId) invalid();
  const body = input.body as Record<string, unknown>;
  if (Object.keys(body).some((key) => !EVENT_FIELDS.has(key)) || body.id !== input.resourceId) invalid();
  const expectedVersion = positiveMs(body.expectedVersion);
  const type = typeof body.type === 'string' && EVENT_TYPES.has(body.type) ? body.type : invalid();
  const occurredAt = instant(body.occurredAt);
  const clientSequence = positiveMs(body.clientSequence);
  const sessionResult = await client.query<{
    owner_id: string; id: string; status: string; version: number; planned_ms: number; focused_ms: number; paused_ms: number; started_at: string; last_event_sequence: number;
  }>(
    `select owner_id, id, status, version, planned_ms, focused_ms, paused_ms, started_at, last_event_sequence
     from df_private.focus_sessions where id = $1 and owner_id = $2 for update`,
    [input.resourceId, input.actorId],
  );
  const session = sessionResult.rows[0];
  if (!session || session.owner_id !== input.actorId || session.id !== input.resourceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
  if (!STATUSES.has(session.status) || session.version !== expectedVersion) throw new SafeBoundaryError(409, 'VERSION_CONFLICT');
  if (!['active', 'paused'].includes(session.status)) throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
  if (clientSequence !== session.last_event_sequence + 1) throw new SafeBoundaryError(409, 'SEQUENCE_CONFLICT');
  const latest = await client.query<{ type: string; occurred_at: string }>(
    `select type, occurred_at from df_private.focus_events where owner_id = $1 and session_id = $2 order by sequence desc limit 1`,
    [input.actorId, input.resourceId],
  );
  const previousAt = latest.rows[0]?.occurred_at ?? session.started_at;
  const elapsed = Date.parse(occurredAt) - Date.parse(previousAt);
  if (!Number.isFinite(elapsed) || elapsed < 0) throw new SafeBoundaryError(422, 'EVENT_ORDER_INVALID');
  if (type === 'pause' && session.status !== 'active') throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
  if (type === 'resume' && session.status !== 'paused') throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
  const focusedMs = session.focused_ms + (session.status === 'active' ? elapsed : 0);
  const pausedMs = session.paused_ms + (session.status === 'paused' ? elapsed : 0);
  if (focusedMs > session.planned_ms || pausedMs < 0) throw new SafeBoundaryError(422, 'SESSION_TOTAL_INVALID');
  if (type === 'complete' && focusedMs !== session.planned_ms) throw new SafeBoundaryError(409, 'SESSION_NOT_COMPLETE');
  const status = type === 'pause' ? 'paused' : type === 'resume' ? 'active' : type === 'complete' ? 'completed' : 'cancelled';
  const insertedEvent = await client.query<{ owner_id: string; session_id: string; sequence: number; type: string }>(
    `insert into df_private.focus_events (id, owner_id, session_id, sequence, type, occurred_at)
     values (gen_random_uuid(), $1, $2, $3, $4, $5)
     returning owner_id, session_id, sequence, type`,
    [input.actorId, input.resourceId, clientSequence, type, occurredAt],
  );
  const insertedRow = insertedEvent.rows[0];
  if (
    insertedEvent.rows.length !== 1
    || insertedRow?.owner_id !== input.actorId
    || insertedRow?.session_id !== input.resourceId
    || insertedRow?.sequence !== clientSequence
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
  const row = updated.rows[0];
  if (!row || row.id !== input.resourceId || row.owner_id !== input.actorId || !Number.isInteger(row.version) || row.version < 1 || !STATUSES.has(row.status)) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  return { responseBody: { id: row.id, version: row.version, status: row.status }, responseStatus: 200 };
}
