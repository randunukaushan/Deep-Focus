/** Local composition candidate: gateway handler context to domain SQL appliers. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { executeDomainMutation } from './domain-mutation-transaction.ts';
import type { DomainMutationStore } from './domain-mutation-transaction.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresDomainMutationStore } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { appendOwnedSyncChange } from './postgres-sync-change-writer.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { applyCreateTask, applyPatchTask, applyDeleteTask, applyTaskAction } from './postgres-task-applier.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { applyCreateGoal, applyPatchGoal, applyDeleteGoal } from './postgres-goal-applier.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { applyStartSession, applySessionEvent } from './postgres-session-applier.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { applyPatchSettings } from './postgres-settings-applier.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { applyRecordBreak } from './postgres-break-applier.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { applyPatchMe } from './postgres-profile-applier.ts';
import type { GatewayHandler, GatewayHandlerContext } from './gateway-execution.ts';
import type { GatewayOperation } from './gateway-router.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresGatewayReadHandlers } from './postgres-gateway-read-handlers.ts';

type SupportedMutation = 'patchMe' | 'createTask' | 'patchTask' | 'deleteTask' | 'applyTaskAction' | 'createGoal' | 'patchGoal' | 'deleteGoal' | 'patchSettings' | 'startSession' | 'applySessionEvent' | 'recordBreak';

function applyFor(operation: SupportedMutation, client: Parameters<NonNullable<Parameters<typeof createPostgresDomainMutationStore>[0]['applyMutation']>>[0], input: Parameters<NonNullable<Parameters<typeof createPostgresDomainMutationStore>[0]['applyMutation']>>[1]) {
  switch (operation) {
    case 'patchMe': return applyPatchMe(client, input);
    case 'createTask': return applyCreateTask(client, input);
    case 'patchTask': return applyPatchTask(client, input);
    case 'deleteTask': return applyDeleteTask(client, input);
    case 'applyTaskAction': return applyTaskAction(client, input);
    case 'createGoal': return applyCreateGoal(client, input);
    case 'patchGoal': return applyPatchGoal(client, input);
    case 'deleteGoal': return applyDeleteGoal(client, input);
    case 'patchSettings': return applyPatchSettings(client, input);
    case 'startSession': return applyStartSession(client, input);
    case 'applySessionEvent': return applySessionEvent(client, input);
    case 'recordBreak': return applyRecordBreak(client, input);
    default: throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
}

function transactionalHandler(operation: SupportedMutation, store: DomainMutationStore): GatewayHandler {
  return async (context: GatewayHandlerContext) => {
    if (context.operation !== operation || !context.idempotencyKey) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
    if (!context.sessionId) throw new SafeBoundaryError(401, 'AUTH_REQUIRED');
    const result = await executeDomainMutation({
      actorId: context.actorId,
      operation: context.operation,
      mutationId: context.idempotencyKey,
      requestSha256: context.requestSha256,
      body: context.body,
      sessionId: context.sessionId,
      ...(context.resourceId ? { resourceId: context.resourceId } : {}),
      store,
    });
    const status = result.receipt.responseStatus;
    if (status !== 200 && status !== 201) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    return { status, body: result.receipt.responseBody };
  };
}

export function createPostgresGatewayHandlers(input: Parameters<typeof createPostgresDomainMutationStore>[0]): Partial<Record<GatewayOperation, GatewayHandler>> {
  const store = createPostgresDomainMutationStore({
    runner: input.runner,
    applyMutation: (client, mutation) => applyFor(mutation.operation as SupportedMutation, client, mutation),
    writeSyncChange: appendOwnedSyncChange,
  });
  return {
    ...createPostgresGatewayReadHandlers({ runner: input.runner }),
    patchMe: transactionalHandler('patchMe', store),
    createTask: transactionalHandler('createTask', store),
    patchTask: transactionalHandler('patchTask', store),
    deleteTask: transactionalHandler('deleteTask', store),
    applyTaskAction: transactionalHandler('applyTaskAction', store),
    createGoal: transactionalHandler('createGoal', store),
    patchGoal: transactionalHandler('patchGoal', store),
    deleteGoal: transactionalHandler('deleteGoal', store),
    patchSettings: transactionalHandler('patchSettings', store),
    startSession: transactionalHandler('startSession', store),
    applySessionEvent: transactionalHandler('applySessionEvent', store),
    recordBreak: transactionalHandler('recordBreak', store),
  };
}
