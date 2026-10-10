// Keep this adapter free of network and database side effects. It prepares
// only server-contract-shaped create payloads once verified workspace context
// is available; local legacy records are deliberately rejected.
import type { Goal } from '../goals/goal-types.ts';
import type { Task } from '../tasks/task-types.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requireUuid(value: string, code: string): string {
  if (!UUID.test(value)) throw new RangeError(code);
  return value;
}

function requireTitle(value: string): string {
  const title = value.trim();
  if (!title || title.length > 240) throw new RangeError('SYNC_TITLE_INVALID');
  return title;
}

function optionalDescription(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const description = value.trim();
  if (description.length > 4000) throw new RangeError('SYNC_DESCRIPTION_INVALID');
  return description || null;
}

export type TaskCreatePayload = {
  id: string;
  workspaceId: string;
  title: string;
  description?: string | null;
  priority?: Task['priority'] | null;
  goalId?: string | null;
  due?: { kind: 'none' } | { kind: 'date'; date: string };
};

export function buildTaskCreatePayload(task: Task, workspaceId: string): TaskCreatePayload {
  const id = requireUuid(task.id, 'SYNC_TASK_ID_INVALID');
  const workspace = requireUuid(workspaceId, 'SYNC_WORKSPACE_ID_INVALID');
  const payload: TaskCreatePayload = { id, workspaceId: workspace, title: requireTitle(task.title) };
  const description = optionalDescription(task.description);
  if (description !== undefined) payload.description = description;
  if (task.priority !== undefined) payload.priority = task.priority;
  if (task.goalId !== undefined) payload.goalId = task.goalId === null ? null : requireUuid(task.goalId, 'SYNC_GOAL_ID_INVALID');
  if (task.dueAt === undefined) payload.due = { kind: 'none' };
  else {
    const date = task.dueAt.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T00:00:00.000Z`))) throw new RangeError('SYNC_DUE_INVALID');
    payload.due = { kind: 'date', date };
  }
  return payload;
}

export type GoalCreatePayload = {
  id: string;
  workspaceId: string;
  title: string;
  description?: string | null;
  type: Goal['type'];
  period: Goal['period'];
  startsAt: string;
  endsAt: string;
  timeZone: string;
  targetValue: number;
  targetUnit: 'ms' | 'count';
};

export function buildGoalCreatePayload(goal: Goal, workspaceId: string): GoalCreatePayload {
  const id = requireUuid(goal.id, 'SYNC_GOAL_ID_INVALID');
  const workspace = requireUuid(workspaceId, 'SYNC_WORKSPACE_ID_INVALID');
  if (goal.legacyOpenPeriod || !goal.endsAt || !goal.periodTimeZone) throw new RangeError('SYNC_GOAL_PERIOD_INVALID');
  if (!Number.isSafeInteger(goal.targetValue) || goal.targetValue <= 0) throw new RangeError('SYNC_GOAL_TARGET_INVALID');
  const payload: GoalCreatePayload = {
    id,
    workspaceId: workspace,
    title: requireTitle(goal.title),
    type: goal.type,
    period: goal.period,
    startsAt: goal.startsAt,
    endsAt: goal.endsAt,
    timeZone: goal.periodTimeZone,
    targetValue: goal.type === 'focus_time' ? goal.targetValue * 1000 : goal.targetValue,
    targetUnit: goal.type === 'focus_time' ? 'ms' : 'count',
  };
  const description = optionalDescription(goal.description);
  if (description !== undefined) payload.description = description;
  if (!Number.isSafeInteger(payload.targetValue)) throw new RangeError('SYNC_GOAL_TARGET_INVALID');
  return payload;
}

export type SyncMutation<TPayload> = {
  mutationId: string;
  actorUserId: string;
  workspaceId: string;
  operation: 'task.create' | 'goal.create';
  payload: TPayload;
};

function buildMutationId(value: string | undefined): string {
  if (value === undefined) return globalThis.crypto?.randomUUID?.() ?? `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0').slice(-12)}`;
  return requireUuid(value, 'SYNC_MUTATION_ID_INVALID');
}

function buildActorUserId(actorUserId: string): string {
  return requireUuid(actorUserId, 'SYNC_ACTOR_ID_INVALID');
}

/**
 * Wraps a validated create payload with the verified actor and an idempotency
 * key. This is intentionally a pure draft; queueing/network delivery remains
 * gated until the server contract and authorization review are complete.
 */
export function buildTaskCreateMutation(
  task: Task,
  workspaceId: string,
  actorUserId: string,
  mutationId?: string,
): SyncMutation<TaskCreatePayload> {
  const workspace = requireUuid(workspaceId, 'SYNC_WORKSPACE_ID_INVALID');
  return {
    mutationId: buildMutationId(mutationId),
    actorUserId: buildActorUserId(actorUserId),
    workspaceId: workspace,
    operation: 'task.create',
    payload: buildTaskCreatePayload(task, workspace),
  };
}

export function buildGoalCreateMutation(
  goal: Goal,
  workspaceId: string,
  actorUserId: string,
  mutationId?: string,
): SyncMutation<GoalCreatePayload> {
  const workspace = requireUuid(workspaceId, 'SYNC_WORKSPACE_ID_INVALID');
  return {
    mutationId: buildMutationId(mutationId),
    actorUserId: buildActorUserId(actorUserId),
    workspaceId: workspace,
    operation: 'goal.create',
    payload: buildGoalCreatePayload(goal, workspace),
  };
}
