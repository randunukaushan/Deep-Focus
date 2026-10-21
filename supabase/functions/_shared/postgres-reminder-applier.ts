/** Local PostgreSQL candidate for explicit local-device reminder intent. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';
import type { PostgresMutationApplyInput, PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const FIELDS = new Set(['id', 'taskId', 'scheduledFor', 'timeZone', 'delivery']);
const PATCH_FIELDS = new Set(['expectedVersion', 'scheduledFor', 'timeZone', 'enabled']);

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function queryRows<T = Record<string, unknown>>(result: unknown): T[] {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) unavailable();
  return result.rows as T[];
}
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function validateReminderBoundary(client: unknown, input: unknown, operation: string, requiresResource = false): asserts input is PostgresMutationApplyInput {
  if (!isRecord(client) || typeof client.query !== 'function') unavailable();
  if (!isRecord(input) || input.operation !== operation || !isUuid(input.actorId) || !isRecord(input.body)
    || (requiresResource && !isUuid(input.resourceId))) invalid();
}
function uuid(value: unknown): string { if (typeof value !== 'string' || !UUID.test(value)) invalid(); return value; }
function instant(value: unknown): string { if (typeof value !== 'string' || !INSTANT.test(value) || Number.isNaN(Date.parse(value))) invalid(); return value; }
function version(value: unknown): number { if (!Number.isSafeInteger(value) || (value as number) < 1 || (value as number) > 2147483647) invalid(); return value as number; }
function timeZone(value: unknown): string {
  if (typeof value !== 'string' || value.length < 1 || value.length > 100 || !/^[A-Za-z0-9_+./-]+$/.test(value)) invalid();
  try { new Intl.DateTimeFormat('en-US', { timeZone: value }).format(); } catch { invalid(); }
  return value;
}
function reminderBody(row: Record<string, unknown>, expected?: { ownerId: string; taskId?: string }): Record<string, unknown> {
  if ((expected && row.owner_id !== expected.ownerId) || (expected?.taskId !== undefined && row.task_id !== expected.taskId)
    || !isUuid(row.id) || !isUuid(row.owner_id) || !isUuid(row.task_id)
    || typeof row.scheduled_for !== 'string' || !INSTANT.test(row.scheduled_for) || Number.isNaN(Date.parse(row.scheduled_for))
    || typeof row.time_zone !== 'string'
    || typeof row.enabled !== 'boolean'
    || row.delivery !== 'local_device' || typeof row.version !== 'number' || !Number.isInteger(row.version) || row.version < 1
    || typeof row.updated_at !== 'string' || !INSTANT.test(row.updated_at) || Number.isNaN(Date.parse(row.updated_at))) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  return { id: row.id, taskId: row.task_id, scheduledFor: row.scheduled_for, timeZone: row.time_zone,
    enabled: row.enabled, delivery: row.delivery, version: row.version, updatedAt: row.updated_at };
}

export async function applyCreateReminder(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 201 }> {
  validateReminderBoundary(client, input, 'createReminder');
  if (input.operation !== 'createReminder' || !input.body || Array.isArray(input.body)) invalid();
  const body = input.body as Record<string, unknown>;
  if (Object.keys(body).some((key) => !FIELDS.has(key)) || [...FIELDS].some((key) => body[key] === undefined)
    || body.delivery !== 'local_device') invalid();
  const id = uuid(body.id); const taskId = uuid(body.taskId); const scheduledFor = instant(body.scheduledFor); const zone = timeZone(body.timeZone);
  const task = await client.query<{ owner_id: string; id: string; deleted_at: string | null }>(
    `select owner_id, id, deleted_at from df_private.tasks where owner_id = $1 and id = $2`, [input.actorId, taskId],
  );
  const taskRows = queryRows<{ owner_id: string; id: string; deleted_at: string | null }>(task);
  if (taskRows.length > 1) unavailable();
  if (taskRows.length !== 1 || taskRows[0]?.owner_id !== input.actorId || taskRows[0]?.id !== taskId || taskRows[0]?.deleted_at !== null) throw new SafeBoundaryError(404, 'NOT_FOUND');
  const existing = await client.query(`select id from df_private.task_reminders where owner_id = $1 and id = $2`, [input.actorId, id]);
  const existingRows = queryRows<{ id: string }>(existing);
  if (existingRows.length > 1) unavailable();
  if (existingRows.length > 0) throw new SafeBoundaryError(409, 'ALREADY_EXISTS');
  const result = await client.query(`insert into df_private.task_reminders (id,owner_id,task_id,scheduled_for,time_zone,delivery) values ($1,$2,$3,$4,$5,'local_device') returning id,owner_id,task_id,scheduled_for,time_zone,enabled,delivery,version,updated_at`, [id, input.actorId, taskId, scheduledFor, zone]);
  const resultRows = queryRows(result);
  if (resultRows.length > 1) unavailable();
  const row = resultRows[0];
  if (!row || row.owner_id !== input.actorId || row.id !== id) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  return { responseBody: reminderBody(row, { ownerId: input.actorId, taskId }), responseStatus: 201 };
}

export async function applyPatchReminder(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 200 }> {
  validateReminderBoundary(client, input, 'patchReminder', true);
  if (input.operation !== 'patchReminder' || !input.body || Array.isArray(input.body) || !input.resourceId) invalid();
  const body = input.body as Record<string, unknown>;
  if (Object.keys(body).some((key) => !PATCH_FIELDS.has(key)) || !Object.prototype.hasOwnProperty.call(body, 'expectedVersion')) invalid();
  const expectedVersion = version(body.expectedVersion); const params: unknown[] = [uuid(input.resourceId), input.actorId, expectedVersion]; const updates: string[] = [];
  if (Object.prototype.hasOwnProperty.call(body, 'scheduledFor')) { params.push(instant(body.scheduledFor)); updates.push(`scheduled_for = $${params.length}`); }
  if (Object.prototype.hasOwnProperty.call(body, 'timeZone')) { params.push(timeZone(body.timeZone)); updates.push(`time_zone = $${params.length}`); }
  if (Object.prototype.hasOwnProperty.call(body, 'enabled')) { if (typeof body.enabled !== 'boolean') invalid(); params.push(body.enabled); updates.push(`enabled = $${params.length}`); }
  if (updates.length === 0) invalid(); updates.push('version = version + 1', 'updated_at = now()');
  const result = await client.query(`update df_private.task_reminders set ${updates.join(', ')} where id = $1 and owner_id = $2 and version = $3 and deleted_at is null returning id,owner_id,task_id,scheduled_for,time_zone,enabled,delivery,version,updated_at`, params);
  const resultRows = queryRows(result);
  if (resultRows.length > 1) unavailable();
  const row = resultRows[0]; if (!row) throw new SafeBoundaryError(409, 'VERSION_CONFLICT');
  if (row.id !== input.resourceId || row.owner_id !== input.actorId) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  return { responseBody: reminderBody(row, { ownerId: input.actorId }), responseStatus: 200 };
}

export async function applyDeleteReminder(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 200; finalizeResponse: (committedThrough: string) => Record<string, unknown> }> {
  validateReminderBoundary(client, input, 'deleteReminder', true);
  if (input.operation !== 'deleteReminder' || !input.body || Array.isArray(input.body) || !input.resourceId) invalid();
  const body = input.body as Record<string, unknown>; if (Object.keys(body).length !== 1 || !Object.prototype.hasOwnProperty.call(body, 'expectedVersion')) invalid();
  const expectedVersion = version(body.expectedVersion);
  const result = await client.query(`update df_private.task_reminders set deleted_at = now(), version = version + 1, updated_at = now() where id = $1 and owner_id = $2 and version = $3 and deleted_at is null returning id,owner_id,version,deleted_at`, [uuid(input.resourceId), input.actorId, expectedVersion]);
  const resultRows = queryRows(result);
  if (resultRows.length > 1) unavailable();
  const row = resultRows[0]; if (!row) throw new SafeBoundaryError(409, 'VERSION_CONFLICT');
  if (row.id !== input.resourceId || row.owner_id !== input.actorId || !Number.isInteger(row.version) || typeof row.deleted_at !== 'string') throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  return { responseBody: {}, responseStatus: 200, finalizeResponse: (committedThrough) => ({ data: { tombstone: { id: row.id, entity: 'reminder', version: row.version, deletedAt: row.deleted_at }, receipt: { receiptId: input.mutationId, mutationId: input.mutationId, command: 'reminder.delete', targetId: row.id, entityVersion: row.version, committedThrough } } }) };
}
