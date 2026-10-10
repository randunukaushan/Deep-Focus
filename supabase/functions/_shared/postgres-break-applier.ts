/** Local PostgreSQL candidate for the owner-bound recordBreak operation. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresMutationApplyInput, PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const FIELDS = new Set(['id', 'focusSessionId', 'startedAt', 'endedAt', 'plannedMs', 'outcome']);
const OUTCOMES = new Set(['completed', 'ended_early']);

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function uuid(value: unknown): string { if (typeof value !== 'string' || !UUID.test(value)) invalid(); return value; }
function instant(value: unknown): string { if (typeof value !== 'string' || !INSTANT.test(value) || Number.isNaN(Date.parse(value))) invalid(); return value; }
function planned(value: unknown): number { if (!Number.isSafeInteger(value) || (value as number) < 1 || (value as number) > 86400000) invalid(); return value as number; }

export async function applyRecordBreak(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 201 }> {
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
  if (!Number.isSafeInteger(actualMs) || actualMs < 0 || actualMs > 86400000
    || (outcome === 'completed' && actualMs < plannedMs)
    || (outcome === 'ended_early' && actualMs >= plannedMs)) invalid();

  const sessionResult = await client.query<{ owner_id: string; id: string; status: string; ended_at: string | null }>(
    `select owner_id, id, status, ended_at from df_private.focus_sessions
     where owner_id = $1 and id = $2 for update`, [input.actorId, focusSessionId],
  );
  const session = sessionResult.rows[0];
  if (!session || session.owner_id !== input.actorId || session.id !== focusSessionId) throw new SafeBoundaryError(404, 'NOT_FOUND');
  if (!['completed', 'cancelled'].includes(session.status) || !session.ended_at || Date.parse(startedAt) < Date.parse(session.ended_at)) {
    throw new SafeBoundaryError(409, 'BREAK_SESSION_INVALID');
  }
  const existing = await client.query<{ id: string }>(
    `select id from df_private.break_records where owner_id = $1 and id = $2`, [input.actorId, id],
  );
  if (existing.rows.length > 0) throw new SafeBoundaryError(409, 'ALREADY_EXISTS');
  const result = await client.query<{
    id: string; owner_id: string; focus_session_id: string; started_at: string; ended_at: string;
    planned_ms: number; actual_ms: number; outcome: string; version: number; verification_state: string;
  }>(
    `insert into df_private.break_records
     (id, owner_id, focus_session_id, started_at, ended_at, planned_ms, actual_ms, outcome)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning id, owner_id, focus_session_id, started_at, ended_at, planned_ms, actual_ms, outcome, version, verification_state`,
    [id, input.actorId, focusSessionId, startedAt, endedAt, plannedMs, actualMs, outcome],
  );
  const row = result.rows[0];
  if (!row || row.id !== id || row.owner_id !== input.actorId || row.focus_session_id !== focusSessionId
    || !Number.isInteger(row.version) || row.version < 1 || !['pending', 'verified', 'needs_review'].includes(row.verification_state)) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  return {
    responseBody: { id: row.id, focusSessionId: row.focus_session_id, startedAt: row.started_at, endedAt: row.ended_at,
      plannedMs: row.planned_ms, actualMs: row.actual_ms, outcome: row.outcome, version: row.version, verificationState: row.verification_state },
    responseStatus: 201,
  };
}
