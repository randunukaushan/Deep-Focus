/** Server-only owner authorization. The store callback must run inside the caller's transaction. */

import type { AdmittedGatewayOperation } from './gateway-operation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

export type OwnedResourceKind = 'workspace' | 'task' | 'goal' | 'session';
export type GatewayAuthorizationStore = {
  loadOwnerId: (kind: OwnedResourceKind, id: string) => Promise<string | null>;
};

const DIRECT_RESOURCE: Partial<Record<string, OwnedResourceKind>> = {
  getTask: 'task', patchTask: 'task', applyTaskAction: 'task',
  getGoal: 'goal', getSession: 'session', applySessionEvent: 'session',
};

function requireOwner(actorId: string, ownerId: string | null): void {
  if (ownerId !== actorId) throw new SafeBoundaryError(404, 'NOT_FOUND');
}

async function requireOwned(store: GatewayAuthorizationStore, actorId: string, kind: OwnedResourceKind, id: unknown): Promise<void> {
  if (typeof id !== 'string') throw new SafeBoundaryError(404, 'NOT_FOUND');
  requireOwner(actorId, await store.loadOwnerId(kind, id));
}

export async function authorizeGatewayOperation(input: {
  admitted: AdmittedGatewayOperation;
  store: GatewayAuthorizationStore;
}): Promise<void> {
  const { actorId, body } = input.admitted.request;
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
}
