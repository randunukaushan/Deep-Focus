/** Server-only owner authorization. The store callback must run inside the caller's transaction. */

import type { AdmittedGatewayOperation } from './gateway-operation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }

export type OwnedResourceKind = 'workspace' | 'task' | 'goal' | 'session' | 'reminder' | 'plan';
export type GatewayAuthorizationStore = {
  loadOwnerId: (kind: OwnedResourceKind, id: string) => Promise<string | null>;
};

const DIRECT_RESOURCE: Partial<Record<string, OwnedResourceKind>> = {
  getTask: 'task', patchTask: 'task', deleteTask: 'task', applyTaskAction: 'task',
  getGoal: 'goal', getGoalProgress: 'goal', patchGoal: 'goal', deleteGoal: 'goal', getSession: 'session', applySessionEvent: 'session',
  patchReminder: 'reminder', deleteReminder: 'reminder',
  getPlan: 'plan', applyPlanAction: 'plan', patchPlan: 'plan',
};

function requireOwner(actorId: string, ownerId: string | null): void {
  if (ownerId !== actorId) throw new SafeBoundaryError(404, 'NOT_FOUND');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

async function requireOwned(store: GatewayAuthorizationStore, actorId: string, kind: OwnedResourceKind, id: unknown): Promise<void> {
  if (typeof id !== 'string') throw new SafeBoundaryError(404, 'NOT_FOUND');
  requireOwner(actorId, await store.loadOwnerId(kind, id));
}

export async function authorizeGatewayOperation(input: {
  admitted: AdmittedGatewayOperation;
  store: GatewayAuthorizationStore;
}): Promise<void> {
  if (!isRecord(input) || !isRecord(input.admitted)
    || !isRecord(input.admitted.request) || !isRecord(input.admitted.route)
    || !isRecord(input.store) || typeof input.store.loadOwnerId !== 'function') {
    throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  }
  const { actorId, body } = input.admitted.request;
  if (!isUuid(actorId) || typeof input.admitted.route.operation !== 'string') {
    throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  }
  const operation = input.admitted.route.operation;
  const routeId = input.admitted.route.resourceId;
  const kind = DIRECT_RESOURCE[operation];
  if (kind) await requireOwned(input.store, actorId, kind, routeId);

  if (operation === 'createTask' || operation === 'createGoal' || operation === 'startSession') {
    await requireOwned(input.store, actorId, 'workspace', body?.workspaceId);
  }
  if (operation === 'createTask' && body?.goalId !== null && body?.goalId !== undefined) {
    await requireOwned(input.store, actorId, 'goal', body.goalId);
  }
  if (operation === 'startSession' && body?.taskId !== null && body?.taskId !== undefined) {
    await requireOwned(input.store, actorId, 'task', body.taskId);
  }
  if (operation === 'recordBreak') {
    await requireOwned(input.store, actorId, 'session', body?.focusSessionId);
  }
  if (operation === 'createReminder' && body?.taskId !== null && body?.taskId !== undefined) {
    await requireOwned(input.store, actorId, 'task', body.taskId);
  }
}
