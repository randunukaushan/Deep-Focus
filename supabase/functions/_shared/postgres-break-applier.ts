/** Local PostgreSQL candidate for the owner-bound recordBreak operation. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresMutationApplyInput, PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const FIELDS = new Set(['id', 'focusSessionId', 'startedAt', 'endedAt', 'plannedMs', 'outcome']);
const OUTCOMES = new Set(['completed', 'ended_early']);
const MAX_BREAK_MS = 86400000;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function queryRows<T = Record<string, unknown>>(result: unknown): T[] {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) unavailable();
  return result.rows as T[];
}
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function validateBreakBoundary(client: unknown, input: unknown): asserts input is PostgresMutationApplyInput {
  if (!isRecord(client) || typeof client.query !== 'function') unavailable();
  if (!isRecord(input) || input.operation !== 'recordBreak' || !isUuid(input.actorId) || !isRecord(input.body)) invalid();
}
function uuid(value: unknown): string { if (typeof value !== 'string' || !UUID.test(value)) invalid(); return value; }
function instant(value: unknown): string { if (typeof value !== 'string' || !INSTANT.test(value) || Number.isNaN(Date.parse(value))) invalid(); return value; }
function planned(value: unknown): number { if (!Number.isSafeInteger(value) || (value as number) < 1 || (value as number) > MAX_BREAK_MS) invalid(); return value as number; }
function storedMs(value: unknown): number | null {
  if (Number.isSafeInteger(value) && (value as number) >= 0 && (value as number) <= MAX_BREAK_MS) return value as number;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= MAX_BREAK_MS ? parsed : null;
}

export async function applyRecordBreak(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 201 }> {
  validateBreakBoundary(client, input);
  if (input.operation !== 'recordBreak' || !input.body || Array.isArray(input.body)) invalid();
  const body = input.body as Record<string, unknown>;
  if (Object.keys(body).some((key) => !FIELDS.has(key)) || [...FIELDS].some((key) => body[key] === undefined)) invalid();
  const id = uuid(body.id);
  const focusSessionId = uuid(body.focusSessionId);
  const startedAt = instant(body.startedAt);
  const endedAt = instant(body.endedAt);
  const plannedMs = planned(body.plannedMs);
  const outcome = typeof body.outcome === 'string' && OUTCOMES.has(body.outcome) ? body.outcome : invalid();
  const actualMs = Date.parse(endedAt) - Date.parse(startedAt);
  if (!Number.isSafeInteger(actualMs) || actualMs < 0 || actualMs > MAX_BREAK_MS
    || (outcome === 'completed' && actualMs < plannedMs)
    || (outcome === 'ended_early' && actualMs >= plannedMs)) invalid();

  const sessionResult = await client.query<{ owner_id: string; id: string; status: string; ended_at: string | null }>(
    `select owner_id, id, status, ended_at from df_private.focus_sessions
     where owner_id = $1 and id = $2 for update`, [input.actorId, focusSessionId],
  );
  const sessionRows = queryRows<{ owner_id: string; id: string; status: string; ended_at: string | null }>(sessionResult);
  if (sessionRows.length > 1) unavailable();
  const session = sessionRows[0];
  if (!session || session.owner_id !== input.actorId || session.id !== focusSessionId) throw new SafeBoundaryError(404, 'NOT_FOUND');
  if (!['completed', 'cancelled'].includes(session.status) || !session.ended_at || Date.parse(startedAt) < Date.parse(session.ended_at)) {
    throw new SafeBoundaryError(409, 'BREAK_SESSION_INVALID');
  }
  const existing = await client.query<{ id: string }>(
    `select id from df_private.break_records where owner_id = $1 and id = $2`, [input.actorId, id],
  );
  const existingRows = queryRows<{ id: string }>(existing);
  if (existingRows.length > 1) unavailable();
  if (existingRows.length > 0) throw new SafeBoundaryError(409, 'ALREADY_EXISTS');
  const result = await client.query<{
    id: string; owner_id: string; focus_session_id: string; started_at: string; ended_at: string;
    planned_ms: number | string; actual_ms: number | string; outcome: string; version: number; verification_state: string;
  }>(
    `insert into df_private.break_records
     (id, owner_id, focus_session_id, started_at, ended_at, planned_ms, actual_ms, outcome)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning id, owner_id, focus_session_id, started_at, ended_at, planned_ms, actual_ms, outcome, version, verification_state`,
    [id, input.actorId, focusSessionId, startedAt, endedAt, plannedMs, actualMs, outcome],
  );
  const resultRows = queryRows<{
    id: string; owner_id: string; focus_session_id: string; started_at: string; ended_at: string;
    planned_ms: number | string; actual_ms: number | string; outcome: string; version: number; verification_state: string;
  }>(result);
  if (resultRows.length > 1) unavailable();
  const row = resultRows[0];
  const storedPlannedMs = row ? storedMs(row.planned_ms) : null;
  const storedActualMs = row ? storedMs(row.actual_ms) : null;
  if (!row || row.id !== id || row.owner_id !== input.actorId || row.focus_session_id !== focusSessionId || row.started_at !== startedAt || row.ended_at !== endedAt
    || storedPlannedMs !== plannedMs || storedActualMs !== actualMs || row.outcome !== outcome
    || !Number.isInteger(row.version) || row.version < 1 || !['pending', 'verified', 'needs_review'].includes(row.verification_state)) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  return {
    responseBody: { id: row.id, focusSessionId: row.focus_session_id, startedAt: row.started_at, endedAt: row.ended_at,
      plannedMs: storedPlannedMs, actualMs: storedActualMs, outcome: row.outcome, version: row.version, verificationState: row.verification_state },
    responseStatus: 201,
  };
}
