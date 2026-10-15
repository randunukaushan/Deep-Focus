/** Local PostgreSQL candidate for atomic mutation-to-sync_changes writes. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresMutationApplyInput, PostgresMutationApplyResult, PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { hashSyncChange } from './sync-transaction.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const MAX_SYNC_PAYLOAD_BYTES = 65536;

function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function requireClient(value: unknown): asserts value is PostgresTransactionClient {
  if (!isRecord(value) || typeof value.query !== 'function') dependencyFailure();
}
function oneRow(result: unknown): Record<string, unknown> {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows) || result.rows.length !== 1 || !isRecord(result.rows[0])) dependencyFailure();
  return result.rows[0];
}
function rowArray(result: unknown): unknown[] {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) dependencyFailure();
  return result.rows;
}

function safeBigint(value: unknown, minimum: bigint, maximum = BigInt(Number.MAX_SAFE_INTEGER)): number | null {
  if (Number.isSafeInteger(value) && BigInt(value as number) >= minimum && BigInt(value as number) <= maximum) return value as number;
  if (typeof value !== 'string' || !DECIMAL.test(value)) return null;
  try {
    const parsed = BigInt(value);
    return parsed >= minimum && parsed <= maximum ? Number(parsed) : null;
  } catch { return null; }
}

function idFor(input: PostgresMutationApplyInput): string {
  const bodyId = input.body && typeof input.body.id === 'string' ? input.body.id : undefined;
  const id = input.resourceId ?? bodyId;
  if (!isUuid(id)) dependencyFailure();
  return id;
}

function profilePayload(row: Record<string, unknown>): Record<string, unknown> {
  if (typeof row.owner_id !== 'string' || typeof row.display_name !== 'string' || typeof row.account_state !== 'string' || !Number.isInteger(row.version)) dependencyFailure();
  return { id: row.owner_id, displayName: row.display_name, accountState: row.account_state, version: row.version };
}

function taskPayload(row: Record<string, unknown>): Record<string, unknown> {
  if (typeof row.id !== 'string' || typeof row.workspace_id !== 'string' || typeof row.title !== 'string' || typeof row.status !== 'string' || !Number.isInteger(row.version)) dependencyFailure();
  return {
    id: row.id, workspaceId: row.workspace_id, goalId: row.goal_id ?? null, title: row.title, description: row.description ?? null,
    status: row.status, priority: row.priority ?? null,
    due: row.due_kind === 'date' ? { kind: 'date', date: row.due_date } : row.due_kind === 'instant' ? { kind: 'instant', at: row.due_at } : { kind: 'none' },
    version: row.version,
  };
}

function goalPayload(row: Record<string, unknown>): Record<string, unknown> {
  if (typeof row.id !== 'string' || typeof row.workspace_id !== 'string' || typeof row.title !== 'string' || !Number.isInteger(row.version)) dependencyFailure();
  const targetValue = safeBigint(row.target_value, 1n);
  if (targetValue === null) dependencyFailure();
  return { id: row.id, workspaceId: row.workspace_id, title: row.title, description: row.description ?? null, type: row.type, period: row.period, targetValue, targetUnit: row.target_unit, startsAt: row.starts_at, endsAt: row.ends_at, timeZone: row.time_zone, status: row.status, version: row.version };
}

function sessionPayload(row: Record<string, unknown>): Record<string, unknown> {
  if (typeof row.id !== 'string' || typeof row.workspace_id !== 'string' || typeof row.status !== 'string' || !Number.isInteger(row.version)) dependencyFailure();
  const plannedMs = safeBigint(row.planned_ms, 1n);
  const focusedMs = safeBigint(row.focused_ms, 0n);
  const pausedMs = safeBigint(row.paused_ms, 0n);
  if (plannedMs === null || focusedMs === null || pausedMs === null || focusedMs > plannedMs) dependencyFailure();
  return { id: row.id, workspaceId: row.workspace_id, taskId: row.task_id ?? null, taskTitleSnapshot: row.task_title_snapshot ?? null, status: row.status, plannedMs, focusedMs, pausedMs, startedAt: row.started_at, endedAt: row.ended_at ?? null, version: row.version };
}

function breakPayload(row: Record<string, unknown>): Record<string, unknown> {
  const plannedMs = safeBigint(row.planned_ms, 1n, 86400000n);
  const actualMs = safeBigint(row.actual_ms, 0n, 86400000n);
  if (typeof row.id !== 'string' || typeof row.focus_session_id !== 'string' || typeof row.started_at !== 'string'
    || typeof row.ended_at !== 'string' || plannedMs === null || actualMs === null
    || typeof row.outcome !== 'string' || !Number.isInteger(row.version) || typeof row.verification_state !== 'string') dependencyFailure();
  return { id: row.id, focusSessionId: row.focus_session_id, startedAt: row.started_at, endedAt: row.ended_at,
    plannedMs, actualMs, outcome: row.outcome, version: row.version, verificationState: row.verification_state };
}

function reminderPayload(row: Record<string, unknown>): Record<string, unknown> {
  if (typeof row.id !== 'string' || typeof row.task_id !== 'string' || typeof row.scheduled_for !== 'string'
    || typeof row.time_zone !== 'string' || typeof row.enabled !== 'boolean' || row.delivery !== 'local_device'
    || !Number.isInteger(row.version) || typeof row.updated_at !== 'string') dependencyFailure();
  return { id: row.id, taskId: row.task_id, scheduledFor: row.scheduled_for, timeZone: row.time_zone, enabled: row.enabled, delivery: row.delivery, version: row.version, updatedAt: row.updated_at };
}

function settingsPayload(row: Record<string, unknown>): Record<string, unknown> {
  if (typeof row.id !== 'string' || typeof row.theme !== 'string' || typeof row.ui_locale !== 'string' || !Number.isSafeInteger(row.default_focus_duration_minutes)
    || !Number.isSafeInteger(row.default_break_duration_minutes) || typeof row.ai_features_enabled !== 'boolean' || !Number.isInteger(row.version) || typeof row.updated_at !== 'string') dependencyFailure();
  return { id: row.id, theme: row.theme, uiLocale: row.ui_locale, defaultFocusDurationMinutes: row.default_focus_duration_minutes, defaultBreakDurationMinutes: row.default_break_duration_minutes, aiFeaturesEnabled: row.ai_features_enabled, version: row.version, updatedAt: row.updated_at };
}

function assertOwnedEntityRow(row: Record<string, unknown>, ownerId: string, entityId: string): void {
  if (row.owner_id !== ownerId || row.id !== entityId) dependencyFailure();
}

async function readPayload(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ entityKind: 'profile' | 'goal' | 'task' | 'focus_session' | 'settings' | 'break' | 'reminder'; entityId: string; operation: 'upsert' | 'delete'; payload: Record<string, unknown> | null }> {
  const entityId = input.operation === 'patchMe' ? input.actorId : idFor(input);
  if (input.operation === 'patchMe') {
    const result = await client.query(`select owner_id, display_name, account_state, version from df_private.profiles where owner_id = $1 and account_state = 'active'`, [input.actorId]);
    const row = oneRow(result);
    if (!row) dependencyFailure();
    if (row.owner_id !== input.actorId) dependencyFailure();
    return { entityKind: 'profile', entityId, operation: 'upsert', payload: profilePayload(row) };
  }
  if (input.operation === 'patchSettings') {
    const result = await client.query<{ id: string; owner_id: string; theme: string; ui_locale: string; default_focus_duration_minutes: number; default_break_duration_minutes: number; ai_features_enabled: boolean; version: number; updated_at: string }>(`select id, owner_id, theme, ui_locale, default_focus_duration_minutes, default_break_duration_minutes, ai_features_enabled, version, updated_at from df_private.user_settings where owner_id = $1`, [input.actorId]);
    const row = oneRow(result);
    if (row.owner_id !== input.actorId || typeof row.id !== 'string') dependencyFailure();
    return { entityKind: 'settings', entityId: row.id, operation: 'upsert', payload: settingsPayload(row) };
  }
  if (input.operation === 'createGoal' || input.operation === 'patchGoal') {
    const result = await client.query(`select owner_id, id, workspace_id, title, description, type, period, target_value, target_unit, starts_at, ends_at, time_zone, status, version from df_private.goals where id = $1 and owner_id = $2 and deleted_at is null`, [entityId, input.actorId]);
    const row = oneRow(result);
    if (!row) dependencyFailure();
    assertOwnedEntityRow(row, input.actorId, entityId);
    return { entityKind: 'goal', entityId, operation: 'upsert', payload: goalPayload(row) };
  }
  if (input.operation === 'deleteGoal' || input.operation === 'deleteTask') {
    const table = input.operation === 'deleteGoal' ? 'goals' : 'tasks';
    const result = await client.query(`select owner_id, id, version, deleted_at from df_private.${table} where id = $1 and owner_id = $2`, [entityId, input.actorId]);
    const row = oneRow(result);
    if (!row || row.owner_id !== input.actorId || row.id !== entityId || typeof row.version !== 'number' || !Number.isInteger(row.version) || row.version < 1
      || typeof row.deleted_at !== 'string' || Number.isNaN(Date.parse(row.deleted_at))) dependencyFailure();
    return { entityKind: input.operation === 'deleteGoal' ? 'goal' : 'task', entityId, operation: 'delete', payload: null };
  }
  if (input.operation === 'createTask' || input.operation === 'patchTask' || input.operation === 'applyTaskAction') {
    const result = await client.query(`select owner_id, id, workspace_id, goal_id, title, description, status, priority, due_kind, due_date, due_at, version from df_private.tasks where id = $1 and owner_id = $2 and deleted_at is null`, [entityId, input.actorId]);
    const row = oneRow(result);
    if (!row) dependencyFailure();
    assertOwnedEntityRow(row, input.actorId, entityId);
    return { entityKind: 'task', entityId, operation: 'upsert', payload: taskPayload(row) };
  }
  if (input.operation === 'startSession' || input.operation === 'applySessionEvent') {
    const result = await client.query(`select owner_id, id, workspace_id, task_id, task_title_snapshot, status, planned_ms, focused_ms, paused_ms, started_at, ended_at, version from df_private.focus_sessions where id = $1 and owner_id = $2`, [entityId, input.actorId]);
    const row = oneRow(result);
    if (!row) dependencyFailure();
    assertOwnedEntityRow(row, input.actorId, entityId);
    return { entityKind: 'focus_session', entityId, operation: 'upsert', payload: sessionPayload(row) };
  }
  if (input.operation === 'recordBreak') {
    const result = await client.query(`select owner_id, id, focus_session_id, started_at, ended_at, planned_ms, actual_ms, outcome, version, verification_state from df_private.break_records where id = $1 and owner_id = $2`, [entityId, input.actorId]);
    const row = oneRow(result);
    if (!row) dependencyFailure();
    assertOwnedEntityRow(row, input.actorId, entityId);
    return { entityKind: 'break', entityId, operation: 'upsert', payload: breakPayload(row) };
  }
  if (input.operation === 'createReminder' || input.operation === 'patchReminder') {
    const result = await client.query(`select owner_id, id, task_id, scheduled_for, time_zone, enabled, delivery, version, updated_at from df_private.task_reminders where id = $1 and owner_id = $2 and deleted_at is null`, [entityId, input.actorId]);
    const row = oneRow(result);
    if (!row) dependencyFailure();
    assertOwnedEntityRow(row, input.actorId, entityId);
    return { entityKind: 'reminder', entityId, operation: 'upsert', payload: reminderPayload(row) };
  }
  if (input.operation === 'deleteReminder') {
    const result = await client.query(`select owner_id, id, version, deleted_at from df_private.task_reminders where id = $1 and owner_id = $2`, [entityId, input.actorId]);
    const row = oneRow(result);
    if (!row || row.owner_id !== input.actorId || row.id !== entityId || !Number.isInteger(row.version) || typeof row.deleted_at !== 'string') dependencyFailure();
    return { entityKind: 'reminder', entityId, operation: 'delete', payload: null };
  }
  dependencyFailure();
}

export async function appendOwnedSyncChange(client: PostgresTransactionClient, input: PostgresMutationApplyInput, applied: PostgresMutationApplyResult): Promise<string> {
  requireClient(client);
  if (!isRecord(input) || typeof input.actorId !== 'string' || !UUID.test(input.actorId)
    || !isRecord(applied) || !Number.isSafeInteger(applied.responseStatus) || applied.responseStatus < 200 || applied.responseStatus > 299) dependencyFailure();
  const change = await readPayload(client, input);
  let serializedPayload: string | null = null;
  if (change.operation === 'upsert') {
    try {
      serializedPayload = JSON.stringify(change.payload, (_key, child) => {
        if (typeof child === 'number' && !Number.isFinite(child)) throw new TypeError('SYNC_UNHASHABLE_PAYLOAD');
        return child;
      });
      if (typeof serializedPayload !== 'string' || new TextEncoder().encode(serializedPayload).byteLength > MAX_SYNC_PAYLOAD_BYTES) dependencyFailure();
    } catch { dependencyFailure(); }
  }
  const head = await client.query<{ last_sequence: string }>(`select last_sequence::text as last_sequence from df_private.sync_heads where owner_id = $1 for update`, [input.actorId]);
  const headRows = rowArray(head);
  if (headRows.length !== 1 || !isRecord(headRows[0])) dependencyFailure();
  const last = headRows[0].last_sequence;
  if (typeof last !== 'string' || !/^\d+$/.test(last)) dependencyFailure();
  const next = (BigInt(last) + 1n).toString();
  let changeHash: string;
  try { changeHash = await hashSyncChange({ sequence: next, entityKind: change.entityKind, entityId: change.entityId, operation: change.operation, payload: change.payload }); }
  catch { dependencyFailure(); }
  const inserted = await client.query(
    `insert into df_private.sync_changes (owner_id, sequence, entity_kind, entity_id, operation, payload, change_hash)
     values ($1, $2::bigint, $3, $4, $5, $6::jsonb, $7)
     returning owner_id, sequence::text as sequence, entity_kind, entity_id, operation, change_hash`,
    [input.actorId, next, change.entityKind, change.entityId, change.operation, change.payload === null ? null : serializedPayload, changeHash],
  );
  const insertedRows = rowArray(inserted);
  if (insertedRows.length !== 1 || !isRecord(insertedRows[0]) || insertedRows[0].owner_id !== input.actorId
    || insertedRows[0].sequence !== next || insertedRows[0].entity_kind !== change.entityKind
    || insertedRows[0].entity_id !== change.entityId || insertedRows[0].operation !== change.operation
    || insertedRows[0].change_hash !== changeHash) dependencyFailure();
  const advanced = await client.query<{ owner_id: string; last_sequence: string }>(
    `update df_private.sync_heads set last_sequence = $2::bigint where owner_id = $1 returning owner_id, last_sequence::text as last_sequence`,
    [input.actorId, next],
  );
  const advancedRows = rowArray(advanced);
  if (advancedRows.length !== 1 || !isRecord(advancedRows[0]) || advancedRows[0].owner_id !== input.actorId || advancedRows[0].last_sequence !== next) dependencyFailure();
  return next;
}
