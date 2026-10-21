/** Owner-bound, read-only source reader for the personal sync snapshot. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';
import type { SnapshotEntity } from '../../../src/features/sync/snapshot-mirror.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;

type Row = Record<string, unknown>;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function requireClient(value: unknown): asserts value is PostgresTransactionClient {
  if (!value || typeof value !== 'object' || typeof (value as { query?: unknown }).query !== 'function') unavailable();
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function safeBigint(value: unknown): number | null {
  if (Number.isSafeInteger(value) && (value as number) >= 0) return value as number;
  if (typeof value !== 'string' || !DECIMAL.test(value)) return null;
  try {
    const parsed = BigInt(value);
    return parsed <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(parsed) : null;
  } catch { return null; }
}

function payloadFor(entity: SnapshotEntity['entity'], row: Row): Record<string, unknown> {
  const payload = { ...row };
  const bigintFields: Record<SnapshotEntity['entity'], string[]> = {
    goal: ['target_value'],
    task: [],
    session: ['planned_ms', 'focused_ms', 'paused_ms', 'last_event_sequence'],
    break: ['planned_ms', 'actual_ms'],
    settings: [],
    reminder: [],
  };
  for (const field of bigintFields[entity]) {
    if (!(field in payload)) continue;
    const normalized = safeBigint(payload[field]);
    if (normalized === null) unavailable();
    payload[field] = normalized;
  }
  return payload;
}

function readRows<T extends Row>(rows: T[], entity: SnapshotEntity['entity'], idKey: string): SnapshotEntity[] {
  return rows.map((row) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) unavailable();
    const entityId = row[idKey];
    const version = row.version;
    if (typeof entityId !== 'string' || !UUID.test(entityId) || !Number.isSafeInteger(version) || (version as number) < 1) unavailable();
    return { entity, entityId, version: version as number, operation: row.deleted_at ? 'delete' : 'upsert', payload: row.deleted_at ? null : payloadFor(entity, row) };
  });
}

async function queryRows(client: PostgresTransactionClient, sql: string, ownerId: string): Promise<Row[]> {
  const result = await client.query(sql, [ownerId]);
  if (!result || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) unavailable();
  return result.rows;
}

/** Reads one owner snapshot from the same transaction used by the builder. */
export function createPostgresSyncSnapshotSourceReader() {
  return {
    read: async (client: PostgresTransactionClient, ownerId: string): Promise<{ highWater: string; records: SnapshotEntity[] }> => {
      if (!isUuid(ownerId)) invalid();
      requireClient(client);
      const head = await client.query<{ last_sequence: unknown }>(
        'select last_sequence from df_private.sync_heads where owner_id = $1', [ownerId],
      );
      if (!head || !Array.isArray(head.rows) || !isPlainJsonValueForBoundary(head.rows) || head.rows.length !== 1 || !head.rows[0] || typeof head.rows[0] !== 'object'
        || !DECIMAL.test(String(head.rows[0].last_sequence))) unavailable();

      const [goals, tasks, sessions, breaks, settings, reminders] = await Promise.all([
        queryRows(client, `select id, title, description, type, period, target_value, target_unit, starts_at, ends_at, time_zone, status, completed_at, deleted_at, version, created_at, updated_at from df_private.goals where owner_id = $1 order by id`, ownerId),
        queryRows(client, `select id, workspace_id, goal_id, title, description, status, priority, due_kind, due_date, due_at, completed_at, archived_at, deleted_at, version, created_at, updated_at from df_private.tasks where owner_id = $1 order by id`, ownerId),
        queryRows(client, `select id, workspace_id, task_id, task_title_snapshot, status, contract_version, planned_ms, focused_ms, paused_ms, started_at, ended_at, recorded_at, last_event_sequence, verification_state, version, created_at, updated_at from df_private.focus_sessions where owner_id = $1 order by id`, ownerId),
        queryRows(client, `select id, focus_session_id, started_at, ended_at, planned_ms, actual_ms, outcome, version, verification_state, created_at, updated_at from df_private.break_records where owner_id = $1 order by id`, ownerId),
        queryRows(client, `select id, theme, ui_locale, default_focus_duration_minutes, default_break_duration_minutes, ai_features_enabled, version, created_at, updated_at from df_private.user_settings where owner_id = $1`, ownerId),
        queryRows(client, `select id, task_id, scheduled_for, time_zone, enabled, delivery, version, deleted_at, created_at, updated_at from df_private.task_reminders where owner_id = $1 order by id`, ownerId),
      ]);
      const records = [
        ...readRows(goals, 'goal', 'id'),
        ...readRows(tasks, 'task', 'id'),
        ...readRows(sessions, 'session', 'id'),
        ...readRows(breaks, 'break', 'id'),
        ...readRows(settings, 'settings', 'id'),
        ...readRows(reminders, 'reminder', 'id'),
      ];
      return { highWater: String(head.rows[0].last_sequence), records };
    },
  };
}
