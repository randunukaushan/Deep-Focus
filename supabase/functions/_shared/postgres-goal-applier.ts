/** Local PostgreSQL candidate for the owner-bound createGoal operation. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresMutationApplyInput, PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const TYPES = new Set(['focus_time', 'session_count', 'task_completion']);
const PERIODS = new Set(['daily', 'weekly', 'monthly', 'custom']);
const UNITS = new Set(['ms', 'count']);
const ALLOWED_FIELDS = new Set(['id', 'workspaceId', 'title', 'description', 'type', 'period', 'startsAt', 'endsAt', 'timeZone', 'targetValue', 'targetUnit']);
const STATUSES = new Set(['active', 'completed', 'cancelled', 'expired']);

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function uuid(value: unknown): string { if (typeof value !== 'string' || !UUID.test(value)) invalid(); return value; }
function boundedText(value: unknown, max: number, required = false): string | null {
  if (value === null || value === undefined) { if (required) invalid(); return null; }
  if (typeof value !== 'string' || value.length > max || (required && (!value.length || !/\S/.test(value)))) invalid();
  return value;
}
function instant(value: unknown): string {
  if (typeof value !== 'string' || !INSTANT.test(value) || Number.isNaN(Date.parse(value))) invalid();
  return value;
}
function safeInteger(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 1 || (value as number) > Number.MAX_SAFE_INTEGER) invalid();
  return value as number;
}

export async function applyCreateGoal(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 201 }> {
  if (input.operation !== 'createGoal' || !input.body || Array.isArray(input.body)) invalid();
  const body = input.body as Record<string, unknown>;
  if (Object.keys(body).some((key) => !ALLOWED_FIELDS.has(key))) invalid();
  const id = uuid(body.id);
  const workspaceId = uuid(body.workspaceId);
  const title = boundedText(body.title, 240, true) as string;
  const description = boundedText(body.description, 4000);
  const type = boundedText(body.type, 20, true) as string;
  const period = boundedText(body.period, 20, true) as string;
  const startsAt = instant(body.startsAt);
  const endsAt = instant(body.endsAt);
  const timeZone = boundedText(body.timeZone, 100, true) as string;
  const targetValue = safeInteger(body.targetValue);
  const targetUnit = boundedText(body.targetUnit, 5, true) as string;
  if (!TYPES.has(type) || !PERIODS.has(period) || !UNITS.has(targetUnit) || (type === 'focus_time' ? targetUnit !== 'ms' : targetUnit !== 'count') || Date.parse(endsAt) <= Date.parse(startsAt)) invalid();
  const workspace = await client.query<{ owner_id: string; id: string }>(
    `select owner_id, id from df_private.workspaces where id = $1 and owner_id = $2`,
    [workspaceId, input.actorId],
  );
  if (workspace.rows.length !== 1 || workspace.rows[0]?.owner_id !== input.actorId || workspace.rows[0]?.id !== workspaceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
  const result = await client.query<{ id: string; owner_id: string; workspace_id: string; version: number; status: string }>(
    `insert into df_private.goals
     (id, owner_id, workspace_id, title, description, type, period, target_value, target_unit, starts_at, ends_at, time_zone)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     returning id, owner_id, workspace_id, version, status`,
    [id, input.actorId, workspaceId, title, description, type, period, targetValue, targetUnit, startsAt, endsAt, timeZone],
  );
  const row = result.rows[0];
  if (!row || row.id !== id || row.owner_id !== input.actorId || row.workspace_id !== workspaceId || !Number.isInteger(row.version) || row.version < 1 || typeof row.status !== 'string' || !STATUSES.has(row.status)) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  return { responseBody: { id: row.id, version: row.version, status: row.status }, responseStatus: 201 };
}

export async function applyPatchGoal(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 200 }> {
  if (input.operation !== 'patchGoal' || !input.body || Array.isArray(input.body) || !input.resourceId) invalid();
  const body = input.body as Record<string, unknown>;
  const allowed = new Set(['expectedVersion', 'title', 'description']);
  if (Object.keys(body).some((key) => !allowed.has(key)) || !Object.prototype.hasOwnProperty.call(body, 'expectedVersion')) invalid();
  const expectedVersion = safeInteger(body.expectedVersion);
  const params: unknown[] = [uuid(input.resourceId), input.actorId, expectedVersion];
  const updates: string[] = [];
  const add = (column: string, value: unknown) => { params.push(value); updates.push(`${column} = $${params.length}`); };
  if (Object.prototype.hasOwnProperty.call(body, 'title')) add('title', boundedText(body.title, 240, true));
  if (Object.prototype.hasOwnProperty.call(body, 'description')) add('description', boundedText(body.description, 4000));
  if (updates.length === 0) invalid();
  updates.push('version = version + 1', 'updated_at = now()');
  const result = await client.query<{ id: string; owner_id: string; version: number; status: string }>(
    `update df_private.goals set ${updates.join(', ')}
     where id = $1 and owner_id = $2 and version = $3 and deleted_at is null
     returning id, owner_id, version, status`,
    params,
  );
  const row = result.rows[0];
  if (!row) throw new SafeBoundaryError(409, 'VERSION_CONFLICT');
  if (row.id !== input.resourceId || row.owner_id !== input.actorId || !Number.isInteger(row.version) || row.version < 1 || typeof row.status !== 'string' || !STATUSES.has(row.status)) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  return { responseBody: { id: row.id, version: row.version, status: row.status }, responseStatus: 200 };
}

export async function applyDeleteGoal(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 200; finalizeResponse: (committedThrough: string) => Record<string, unknown> }> {
  if (input.operation !== 'deleteGoal' || !input.body || Array.isArray(input.body) || !input.resourceId) invalid();
  const body = input.body as Record<string, unknown>;
  if (Object.keys(body).length !== 1 || !Object.prototype.hasOwnProperty.call(body, 'expectedVersion')) invalid();
  const expectedVersion = safeInteger(body.expectedVersion);
  const result = await client.query<{ id: string; owner_id: string; version: number; status: string; deleted_at: string }>(
    `update df_private.goals set deleted_at = now(), version = version + 1, updated_at = now()
     where id = $1 and owner_id = $2 and version = $3 and deleted_at is null
     returning id, owner_id, version, status, deleted_at`,
    [uuid(input.resourceId), input.actorId, expectedVersion],
  );
  const row = result.rows[0];
  if (!row) throw new SafeBoundaryError(409, 'VERSION_CONFLICT');
  if (row.id !== input.resourceId || row.owner_id !== input.actorId || !Number.isInteger(row.version) || row.version < 1 || typeof row.status !== 'string' || !STATUSES.has(row.status)
    || typeof row.deleted_at !== 'string' || !INSTANT.test(row.deleted_at) || Number.isNaN(Date.parse(row.deleted_at))) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  return {
    responseBody: {},
    responseStatus: 200,
    finalizeResponse: (committedThrough) => ({
      data: {
        tombstone: { id: row.id, entity: 'goal', version: row.version, deletedAt: row.deleted_at },
        receipt: { receiptId: input.mutationId, mutationId: input.mutationId, command: 'goal.delete', targetId: row.id, entityVersion: row.version, committedThrough },
      },
    }),
  };
}
