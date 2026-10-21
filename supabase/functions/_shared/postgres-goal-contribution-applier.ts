/** Local PostgreSQL candidate for immutable focus-session goal attribution. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RULE_VERSION = 'goal-attribution-v1';
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

type GoalRow = { owner_id: string; id: string; type: string; status: string; deleted_at: string | null; starts_at: string; ends_at: string };
type SessionRow = { owner_id: string; id: string; status: string; focused_ms: number | string; ended_at: string | null; version: number };
type GoalContributionInput = { ownerId: string; goalId: string; sessionId: string; now: string; contributionId: string };
export type GoalContributionResult = { action: 'created' | 'existing'; id: string; ownerId: string; goalId: string; sourceId: string; value: number; valueUnit: 'ms' | 'count'; sourceVersion: number; ruleVersion: string };

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function queryRows<T = Record<string, unknown>>(result: unknown): T[] {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) dependencyFailure();
  return result.rows as T[];
}
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }

function validInstant(value: unknown): value is string { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }

function validateContributionInput(value: unknown): asserts value is GoalContributionInput {
  if (!isRecord(value) || !isUuid(value.ownerId) || !isUuid(value.goalId) || !isUuid(value.sessionId)
    || !isUuid(value.contributionId) || !validInstant(value.now)) invalid();
}

function safeBigint(value: unknown): number | null {
  if (Number.isSafeInteger(value) && (value as number) >= 0) return value as number;
  if (typeof value !== 'string' || !DECIMAL.test(value)) return null;
  const parsed = BigInt(value);
  return parsed <= MAX_SAFE_BIGINT ? Number(parsed) : null;
}

function goal(value: unknown, ownerId: string, goalId: string): GoalRow {
  if (!value || typeof value !== 'object' || Array.isArray(value)) dependencyFailure();
  const row = value as GoalRow;
  if (row.owner_id !== ownerId || row.id !== goalId || !UUID.test(row.owner_id) || !UUID.test(row.id)
    || !['focus_time', 'session_count'].includes(row.type) || !['active', 'completed'].includes(row.status)
    || row.deleted_at !== null || !validInstant(row.starts_at) || !validInstant(row.ends_at)
    || Date.parse(row.starts_at) >= Date.parse(row.ends_at)) dependencyFailure();
  return row;
}

function session(value: unknown, ownerId: string, sessionId: string): SessionRow {
  if (!value || typeof value !== 'object' || Array.isArray(value)) dependencyFailure();
  const row = value as SessionRow;
  const focusedMs = safeBigint(row.focused_ms);
  if (row.owner_id !== ownerId || row.id !== sessionId || !UUID.test(row.owner_id) || !UUID.test(row.id)
    || !['completed', 'cancelled'].includes(row.status) || focusedMs === null
    || !Number.isInteger(row.version) || row.version < 1 || !validInstant(row.ended_at)) dependencyFailure();
  return { ...row, focused_ms: focusedMs };
}

export function createPostgresGoalContributionStore(input: { runner: PostgresTransactionRunner }) {
  if (!isRecord(input) || !isRecord(input.runner) || typeof input.runner.withTransaction !== 'function') invalid();
  return {
    attributeFocusSession: async (value: unknown) => {
      validateContributionInput(value);
      return input.runner.withTransaction(async (client) => {
      const goalResult = await client.query<GoalRow>(
        `select owner_id, id, type, status, deleted_at, starts_at, ends_at
         from df_private.goals where owner_id = $1 and id = $2 for update`, [value.ownerId, value.goalId]);
      const goalRows = queryRows<GoalRow>(goalResult);
      if (goalRows.length !== 1) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const selectedGoal = goal(goalRows[0], value.ownerId, value.goalId);
      const sessionResult = await client.query<SessionRow>(
        `select owner_id, id, status, focused_ms, ended_at, version
         from df_private.focus_sessions where owner_id = $1 and id = $2`, [value.ownerId, value.sessionId]);
      const sessionRows = queryRows<SessionRow>(sessionResult);
      if (sessionRows.length !== 1) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const selectedSession = session(sessionRows[0], value.ownerId, value.sessionId);
      const endedAt = Date.parse(selectedSession.ended_at as string);
      if (endedAt < Date.parse(selectedGoal.starts_at) || endedAt >= Date.parse(selectedGoal.ends_at) || endedAt > Date.parse(value.now)
        || (selectedGoal.type === 'session_count' && selectedSession.status !== 'completed')) invalid();
      const valueUnit = selectedGoal.type === 'focus_time' ? 'ms' as const : 'count' as const;
      const contributionValue = selectedGoal.type === 'focus_time' ? selectedSession.focused_ms : 1;
      const inserted = await client.query<{ id: string; owner_id: string; goal_id: string; source_id: string; value: number | string; value_unit: string; source_version: number; rule_version: string }>(
        `insert into df_private.goal_contributions
           (id, owner_id, goal_id, source_kind, source_id, value_unit, value, rule_version, source_version, attributed_at)
         values ($1, $2, $3, 'focus_session', $4, $5, $6, $7, $8, $9)
         on conflict (owner_id, goal_id, source_kind, source_id) do nothing
         returning id, owner_id, goal_id, source_id, value, value_unit, source_version, rule_version`,
        [value.contributionId, value.ownerId, value.goalId, value.sessionId, valueUnit, contributionValue, RULE_VERSION, selectedSession.version, selectedSession.ended_at]);
      const insertedRows = queryRows<{ id: string; owner_id: string; goal_id: string; source_id: string; value: number | string; value_unit: string; source_version: number; rule_version: string }>(inserted);
      if (insertedRows.length > 1) dependencyFailure();
      if (insertedRows.length === 1) {
        const row = insertedRows[0];
        const storedValue = safeBigint(row.value);
        if (!isUuid(row.id) || row.owner_id !== value.ownerId || row.goal_id !== value.goalId || row.source_id !== value.sessionId || row.value_unit !== valueUnit || storedValue !== contributionValue || row.rule_version !== RULE_VERSION || !Number.isSafeInteger(row.source_version) || row.source_version < 1) dependencyFailure();
        return { action: 'created', id: row.id, ownerId: row.owner_id, goalId: row.goal_id, sourceId: row.source_id, value: storedValue, valueUnit, sourceVersion: row.source_version, ruleVersion: row.rule_version } satisfies GoalContributionResult;
      }
      const existing = await client.query<{ id: string; owner_id: string; goal_id: string; source_id: string; value: number | string; value_unit: string; source_version: number; rule_version: string }>(
        `select id, owner_id, goal_id, source_id, value, value_unit, source_version, rule_version
         from df_private.goal_contributions where owner_id = $1 and goal_id = $2 and source_kind = 'focus_session' and source_id = $3`, [value.ownerId, value.goalId, value.sessionId]);
      const existingRows = queryRows<{ id: string; owner_id: string; goal_id: string; source_id: string; value: number | string; value_unit: string; source_version: number; rule_version: string }>(existing);
      if (existingRows.length > 1) dependencyFailure();
      const row = existingRows[0];
      const storedValue = row ? safeBigint(row.value) : null;
      if (!row || !isUuid(row.id) || row.owner_id !== value.ownerId || row.goal_id !== value.goalId || row.source_id !== value.sessionId || row.value_unit !== valueUnit || storedValue !== contributionValue || row.source_version !== selectedSession.version || row.rule_version !== RULE_VERSION) throw new SafeBoundaryError(409, 'IDEMPOTENCY_CONFLICT');
      return { action: 'existing', id: row.id, ownerId: row.owner_id, goalId: row.goal_id, sourceId: row.source_id, value: storedValue, valueUnit, sourceVersion: row.source_version, ruleVersion: row.rule_version } satisfies GoalContributionResult;
      });
    },
  };
}
