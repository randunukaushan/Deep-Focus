/** Local PostgreSQL candidate for the owner-bound createTask operation. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresMutationApplyInput, PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRIORITIES = new Set([null, 'low', 'medium', 'high']);
const ALLOWED_FIELDS = new Set(['id', 'workspaceId', 'title', 'description', 'priority', 'goalId', 'due']);
const STATUSES = new Set(['pending', 'in_progress', 'completed', 'cancelled']);
const PATCH_FIELDS = new Set(['expectedVersion', 'title', 'description', 'priority', 'goalId', 'due']);
const ACTIONS = new Set(['begin', 'complete', 'cancel', 'archive']);
const ACTION_FIELDS = new Set(['id', 'expectedVersion', 'action', 'occurredAt']);

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function text(value: unknown, max: number, required = false): string | null {
  if (value === null || value === undefined) { if (required) invalid(); return null; }
  if (typeof value !== 'string' || value.length > max || (required && (!value.length || !/\S/.test(value)))) invalid();
  return value;
}
function uuid(value: unknown): string {
  if (typeof value !== 'string' || !UUID.test(value)) invalid();
  return value;
}

function version(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 1 || (value as number) > 2147483647) invalid();
  return value as number;
}

function due(value: unknown): { kind: 'none' | 'date' | 'instant'; date: string | null; at: string | null } {
  if (value === undefined || value === null || (typeof value === 'object' && !Array.isArray(value) && (value as { kind?: unknown }).kind === 'none' && Object.keys(value).length === 1)) {
    return { kind: 'none', date: null, at: null };
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
  const entry = value as Record<string, unknown>;
  if (entry.kind === 'date' && typeof entry.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && Object.keys(entry).length === 2) {
    return { kind: 'date', date: entry.date, at: null };
  }
  if (entry.kind === 'instant' && typeof entry.at === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(entry.at) && Object.keys(entry).length === 2) {
    return { kind: 'instant', date: null, at: entry.at };
  }
  invalid();
}

export async function applyCreateTask(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 201 }> {
  if (input.operation !== 'createTask' || !input.body || Array.isArray(input.body)) invalid();
  const body = input.body as Record<string, unknown>;
  if (Object.keys(body).some((key) => !ALLOWED_FIELDS.has(key))) invalid();
  const id = uuid(body.id);
  const workspaceId = uuid(body.workspaceId);
  const title = text(body.title, 240, true) as string;
  const description = text(body.description, 4000);
  const goalId = body.goalId === undefined ? null : (body.goalId === null ? null : uuid(body.goalId));
  const priority = body.priority === undefined ? null : body.priority;
  if (!PRIORITIES.has(priority as null | string)) invalid();
  const deadline = due(body.due);
  const workspace = await client.query<{ owner_id: string; id: string }>(
    `select owner_id, id from df_private.workspaces where id = $1 and owner_id = $2`,
    [workspaceId, input.actorId],
  );
  if (workspace.rows.length !== 1 || workspace.rows[0]?.owner_id !== input.actorId || workspace.rows[0]?.id !== workspaceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
  if (goalId !== null) {
    const goal = await client.query<{ owner_id: string; workspace_id: string; id: string }>(
      `select owner_id, workspace_id, id from df_private.goals
       where id = $1 and owner_id = $2 and workspace_id = $3 and deleted_at is null`,
      [goalId, input.actorId, workspaceId],
    );
    if (goal.rows.length !== 1 || goal.rows[0]?.owner_id !== input.actorId || goal.rows[0]?.workspace_id !== workspaceId || goal.rows[0]?.id !== goalId) throw new SafeBoundaryError(404, 'NOT_FOUND');
  }
  const result = await client.query<{ id: string; owner_id: string; workspace_id: string; version: number; status: string }>(
    `insert into df_private.tasks
     (id, owner_id, workspace_id, goal_id, title, description, priority, due_kind, due_date, due_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     returning id, owner_id, workspace_id, version, status`,
    [id, input.actorId, workspaceId, goalId, title, description, priority, deadline.kind, deadline.date, deadline.at],
  );
  const row = result.rows[0];
  if (!row || row.id !== id || row.owner_id !== input.actorId || row.workspace_id !== workspaceId || !Number.isInteger(row.version) || row.version < 1 || typeof row.status !== 'string' || !STATUSES.has(row.status)) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  return { responseBody: { id: row.id, version: row.version, status: row.status }, responseStatus: 201 };
}

export async function applyPatchTask(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 200 }> {
  if (input.operation !== 'patchTask' || !input.body || Array.isArray(input.body)) invalid();
  const body = input.body as Record<string, unknown>;
  if (Object.keys(body).some((key) => !PATCH_FIELDS.has(key)) || !Object.prototype.hasOwnProperty.call(body, 'expectedVersion')) invalid();
  const expectedVersion = version(body.expectedVersion);
  const params: unknown[] = [uuid(input.resourceId), input.actorId, expectedVersion];
  const updates: string[] = [];
  let requestedGoalId: string | null | undefined;
  const add = (sql: string, value: unknown) => { params.push(value); updates.push(`${sql} = $${params.length}`); };
  if (Object.prototype.hasOwnProperty.call(body, 'title')) add('title', text(body.title, 240, true));
  if (Object.prototype.hasOwnProperty.call(body, 'description')) add('description', text(body.description, 4000));
  if (Object.prototype.hasOwnProperty.call(body, 'priority')) {
    if (!PRIORITIES.has(body.priority as null | string)) invalid();
    add('priority', body.priority);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'goalId')) {
    requestedGoalId = body.goalId === null ? null : uuid(body.goalId);
    add('goal_id', requestedGoalId);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'due')) {
    const deadline = due(body.due);
    add('due_kind', deadline.kind); add('due_date', deadline.date); add('due_at', deadline.at);
  }
  if (updates.length === 0) invalid();
  if (requestedGoalId !== undefined && requestedGoalId !== null) {
    const linked = await client.query<{
      task_id: string;
      owner_id: string;
      workspace_id: string;
      goal_owner_id: string | null;
      goal_workspace_id: string | null;
      goal_id: string | null;
    }>(
      `select tasks.id as task_id, tasks.owner_id, tasks.workspace_id,
              goals.owner_id as goal_owner_id, goals.workspace_id as goal_workspace_id,
              goals.id as goal_id
       from df_private.tasks
       left join df_private.goals on goals.id = $3 and goals.owner_id = $2
         and goals.workspace_id = tasks.workspace_id and goals.deleted_at is null
       where tasks.id = $1 and tasks.owner_id = $2 and tasks.deleted_at is null
       for update`,
      [params[0], params[1], requestedGoalId],
    );
    const linkedRow = linked.rows[0];
    if (
      linked.rows.length !== 1
      || linkedRow?.task_id !== params[0]
      || linkedRow?.owner_id !== input.actorId
      || linkedRow?.goal_owner_id !== input.actorId
      || linkedRow?.goal_workspace_id !== linkedRow.workspace_id
      || linkedRow?.goal_id !== requestedGoalId
    ) throw new SafeBoundaryError(404, 'NOT_FOUND');
  }
  updates.push('version = version + 1', 'updated_at = now()');
  const result = await client.query<{ id: string; owner_id: string; version: number; status: string }>(
    `update df_private.tasks set ${updates.join(', ')}
     where id = $1 and owner_id = $2 and version = $3 and deleted_at is null
     returning id, owner_id, version, status`,
    params,
  );
  const row = result.rows[0];
  if (!row) throw new SafeBoundaryError(409, 'VERSION_CONFLICT');
  if (row.id !== params[0] || row.owner_id !== input.actorId || !Number.isInteger(row.version) || row.version < 1 || typeof row.status !== 'string' || !STATUSES.has(row.status)) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  return { responseBody: { id: row.id, version: row.version, status: row.status }, responseStatus: 200 };
}

export async function applyDeleteTask(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 200; finalizeResponse: (committedThrough: string) => Record<string, unknown> }> {
  if (input.operation !== 'deleteTask' || !input.body || Array.isArray(input.body) || !input.resourceId) invalid();
  const body = input.body as Record<string, unknown>;
  if (Object.keys(body).length !== 1 || !Object.prototype.hasOwnProperty.call(body, 'expectedVersion')) invalid();
  const expectedVersion = version(body.expectedVersion);
  const result = await client.query<{ id: string; owner_id: string; version: number; status: string; deleted_at: string }>(
    `update df_private.tasks set deleted_at = now(), version = version + 1, updated_at = now()
     where id = $1 and owner_id = $2 and version = $3 and deleted_at is null
     returning id, owner_id, version, status, deleted_at`,
    [uuid(input.resourceId), input.actorId, expectedVersion],
  );
  const row = result.rows[0];
  if (!row) throw new SafeBoundaryError(409, 'VERSION_CONFLICT');
  if (row.id !== input.resourceId || row.owner_id !== input.actorId || !Number.isInteger(row.version) || row.version < 1 || typeof row.status !== 'string' || !STATUSES.has(row.status)
    || typeof row.deleted_at !== 'string' || Number.isNaN(Date.parse(row.deleted_at))) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  return {
    responseBody: {},
    responseStatus: 200,
    finalizeResponse: (committedThrough) => ({
      data: {
        tombstone: { id: row.id, entity: 'task', version: row.version, deletedAt: row.deleted_at },
        receipt: { receiptId: input.mutationId, mutationId: input.mutationId, command: 'task.delete', targetId: row.id, entityVersion: row.version, committedThrough },
      },
    }),
  };
}

export async function applyTaskAction(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 200 }> {
  if (input.operation !== 'applyTaskAction' || !input.body || Array.isArray(input.body) || !input.resourceId) invalid();
  const body = input.body as Record<string, unknown>;
  if (Object.keys(body).some((key) => !ACTION_FIELDS.has(key)) || body.id !== input.resourceId) invalid();
  const expectedVersion = version(body.expectedVersion);
  const action = text(body.action, 20, true) as string;
  const occurredAt = text(body.occurredAt, 24, true) as string;
  if (!ACTIONS.has(action) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(occurredAt) || Number.isNaN(Date.parse(occurredAt))) invalid();
  const current = await client.query<{ id: string; owner_id: string; status: string; version: number; deleted_at: string | null }>(
    `select id, owner_id, status, version, deleted_at from df_private.tasks
     where id = $1 and owner_id = $2 for update`,
    [input.resourceId, input.actorId],
  );
  const task = current.rows[0];
  if (!task || task.id !== input.resourceId || task.owner_id !== input.actorId || task.deleted_at !== null) throw new SafeBoundaryError(404, 'NOT_FOUND');
  if (task.version !== expectedVersion) throw new SafeBoundaryError(409, 'VERSION_CONFLICT');
  if (!STATUSES.has(task.status) || (action === 'begin' && task.status !== 'pending') || (['complete', 'cancel'].includes(action) && !['pending', 'in_progress'].includes(task.status))) {
    throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
  }
  const status = action === 'begin' ? 'in_progress' : action === 'complete' ? 'completed' : action === 'cancel' ? 'cancelled' : task.status;
  const completedAt = action === 'complete' ? occurredAt : null;
  const update = action === 'archive'
    ? { sql: 'archived_at = $4', params: [input.resourceId, input.actorId, expectedVersion, occurredAt] }
    : { sql: `status = $4, completed_at = $5`, params: [input.resourceId, input.actorId, expectedVersion, status, completedAt] };
  const result = await client.query<{ id: string; owner_id: string; version: number; status: string }>(
    `update df_private.tasks set ${update.sql}, version = version + 1, updated_at = now()
     where id = $1 and owner_id = $2 and version = $3 and deleted_at is null
     returning id, owner_id, version, status`,
    update.params,
  );
  const row = result.rows[0];
  if (!row || row.id !== input.resourceId || row.owner_id !== input.actorId || !Number.isInteger(row.version) || row.version < 1 || !STATUSES.has(row.status)) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  return { responseBody: { id: row.id, version: row.version, status: row.status }, responseStatus: 200 };
}
