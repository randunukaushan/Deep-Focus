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
import { applyCreateReminder, applyPatchReminder, applyDeleteReminder } from './postgres-reminder-applier.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { applyPatchMe } from './postgres-profile-applier.ts';
import type { GatewayHandler, GatewayHandlerContext } from './gateway-execution.ts';
import type { GatewayOperation } from './gateway-router.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresGatewayReadHandlers } from './postgres-gateway-read-handlers.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresPrivacyJobStore } from './postgres-privacy-job-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresSyncGatewayHandlers } from './postgres-sync-gateway-handlers.ts';
import type { ServerSyncChange } from './sync-transaction.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresSnapshotReadHandlers } from './postgres-snapshot-read-handlers.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresSnapshotCursorHandlers } from './postgres-snapshot-cursor-handlers.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresSyncSnapshotJobStore } from './postgres-sync-snapshot-job-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { applyAiProposalAtomically } from './ai-proposal-apply-transaction.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresAiProposalApplyStore } from './postgres-ai-proposal-apply-adapter.ts';
import type { AiProposalApplyTransaction } from './ai-proposal-apply-transaction.ts';
import type { AiProposalRecord } from './postgres-ai-proposal-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { executePostgresAiProposalOperations } from './postgres-ai-domain-operation-executor.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { unavailableAiUsage } from './ai-usage-projection.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { unavailableEntitlements } from './entitlement-response-validation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { unavailableCatalog } from './catalog-response-validation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresAccountSessionRevocationHandler } from './postgres-account-session-revocation-handler.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresAiGenerationCancellationStore } from './postgres-ai-generation-cancellation-adapter.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }

type SupportedMutation = 'patchMe' | 'createTask' | 'patchTask' | 'deleteTask' | 'applyTaskAction' | 'createGoal' | 'patchGoal' | 'deleteGoal' | 'patchSettings' | 'startSession' | 'applySessionEvent' | 'recordBreak' | 'createReminder' | 'patchReminder' | 'deleteReminder';
type GatewayHandlerFactoryInput = Pick<Parameters<typeof createPostgresDomainMutationStore>[0], 'runner'> & {
  listCursorSecret?: string;
  now?: () => string;
  cursorTtlMs?: number;
  analyticsMaxRangeMs?: number;
  createPrivacyJobId?: () => string;
  syncCursorSecret?: string;
  syncCursorTtlMs?: number;
  snapshotCursorSecret?: string;
  createSyncSnapshotJobId?: () => string;
  createSyncSnapshotId?: () => string;
  applyAiProposalOperations?: (input: { transaction: AiProposalApplyTransaction; actorId: string; proposal: AiProposalRecord; selectedOperationIds: string[] }) => Promise<{ responseBody: Record<string, unknown>; responseStatus: number; committedThrough: string }>;
  verifyRecentAuth?: (input: { actorId: string; sessionId: string; now: string }) => Promise<boolean>;
  createRevocationId?: () => string;
  revokeAccountSessions?: (input: { actorId: string; currentSessionId: string; requestId: string; body: Record<string, unknown>; requestSha256: string }) => Promise<{ responseBody: Record<string, unknown>; responseStatus: 200 }>;
  signOutSession?: (input: { actorId: string; currentSessionId: string; requestId: string; body: Record<string, unknown>; requestSha256: string }) => Promise<{ responseBody: Record<string, unknown>; responseStatus: 200 }>;
  applyPlanAction?: (input: { actorId: string; sessionId: string; planId: string; mutationId: string; requestSha256: string; command: Record<string, unknown> }) => Promise<{ responseBody: Record<string, unknown>; responseStatus: 200 }>;
  patchPlan?: (input: { actorId: string; sessionId: string; planId: string; mutationId: string; requestSha256: string; command: Record<string, unknown> }) => Promise<{ responseBody: Record<string, unknown>; responseStatus: 200 }>;
};

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
    case 'createReminder': return applyCreateReminder(client, input);
    case 'patchReminder': return applyPatchReminder(client, input);
    case 'deleteReminder': return applyDeleteReminder(client, input);
    default: throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
}

function validateRevocationResponse(value: { responseBody: Record<string, unknown>; responseStatus: 200 }): void {
  const data = value.responseBody?.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  const body = data as Record<string, unknown>;
  if (!Number.isSafeInteger(body.revokedCount) || (body.revokedCount as number) < 0
    || typeof body.currentSessionRevoked !== 'boolean'
    || !['pending', 'confirmed', 'needs_retry'].includes(String(body.providerRevocationStatus))) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
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

export function createPostgresGatewayHandlers(input: GatewayHandlerFactoryInput): Partial<Record<GatewayOperation, GatewayHandler>> {
  const store = createPostgresDomainMutationStore({
    runner: input.runner,
    applyMutation: (client, mutation) => applyFor(mutation.operation as SupportedMutation, client, mutation),
    writeSyncChange: appendOwnedSyncChange,
  });
  const revokeAccountSessionsDependency = input.revokeAccountSessions ?? (input.now
    ? createPostgresAccountSessionRevocationHandler({ runner: input.runner, now: input.now, createRevocationId: input.createRevocationId })
    : undefined);
  const signOutSessionDependency = input.signOutSession ?? revokeAccountSessionsDependency;
  const createPrivacyExport: GatewayHandler = async (context) => {
    if (context.operation !== 'createPrivacyExport' || !context.idempotencyKey || !context.sessionId || !context.body
      || context.body.format !== 'json' || context.body.scope !== 'own_account_data') throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
    const now = input.now?.() ?? new Date().toISOString();
    const jobId = input.createPrivacyJobId?.() ?? crypto.randomUUID();
    if (!isUuid(jobId)) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    const job = await input.runner.withTransaction(async (client) => {
      await recheckPostgresAppSession(client, context.actorId, context.sessionId as string);
      return createPostgresPrivacyJobStore({ runner: { withTransaction: async (run) => run(client) } }).enqueueExport({ ownerId: context.actorId, jobId, operationId: context.idempotencyKey as string, now });
    });
    return { status: 202, body: { data: { id: job.jobId, kind: job.kind, state: job.state, updatedAt: now, safeErrorCode: job.safeErrorCode } } };
  };
  const sync = input.syncCursorSecret && input.now
    ? createPostgresSyncGatewayHandlers({
      runner: input.runner,
      cursorSecret: input.syncCursorSecret,
      now: () => input.now!(),
      expiresAt: () => new Date(Date.parse(input.now!()) + (input.syncCursorTtlMs ?? 900000)).toISOString(),
    })
    : null;
  const pullSync: GatewayHandler = async (context) => {
    if (!sync || context.operation !== 'pullSync' || !context.sessionId) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    const result = await sync.pull({ actorId: context.actorId, sessionId: context.sessionId, cursor: context.query?.cursor ?? null, limit: context.query?.limit ?? 50 });
    return { status: 200, body: { data: result } };
  };
  const pushSync: GatewayHandler = async (context) => {
    if (!sync || context.operation !== 'pushSync' || !context.sessionId || !context.idempotencyKey || !context.body) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    const body = context.body;
    const result = await sync.commit({ actorId: context.actorId, sessionId: context.sessionId, cursorLastSequence: body.cursorLastSequence as string, nextCursor: body.nextCursor as string, changes: body.changes as ServerSyncChange[] });
    return { status: 200, body: { data: result } };
  };
  const snapshots = input.now && input.snapshotCursorSecret
    ? { read: createPostgresSnapshotReadHandlers({ runner: input.runner }), cursor: createPostgresSnapshotCursorHandlers({ runner: input.runner, secret: input.snapshotCursorSecret }) }
    : null;
  const getSyncSnapshot: GatewayHandler = async (context) => {
    if (!snapshots || context.operation !== 'getSyncSnapshot' || !context.sessionId || !context.resourceId) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    return snapshots.read.readMetadata({ actorId: context.actorId, sessionId: context.sessionId, snapshotId: context.resourceId, now: input.now?.() ?? new Date().toISOString() });
  };
  const getSyncSnapshotPage: GatewayHandler = async (context) => {
    if (!snapshots || context.operation !== 'getSyncSnapshotPage' || !context.sessionId || !context.resourceId || !context.query?.cursor) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    return snapshots.cursor.readPageByCursor({ actorId: context.actorId, sessionId: context.sessionId, snapshotId: context.resourceId, cursor: context.query.cursor, now: input.now?.() ?? new Date().toISOString() });
  };
  const createSyncSnapshot: GatewayHandler = async (context) => {
    if (context.operation !== 'createSyncSnapshot' || !context.sessionId || !context.idempotencyKey || !context.body || Object.keys(context.body).length !== 0) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
    const now = input.now?.() ?? new Date().toISOString();
    const jobId = input.createSyncSnapshotJobId?.() ?? crypto.randomUUID();
    const snapshotId = input.createSyncSnapshotId?.() ?? crypto.randomUUID();
    if (!isUuid(jobId) || !isUuid(snapshotId)) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    const job = await input.runner.withTransaction(async (client) => {
      await recheckPostgresAppSession(client, context.actorId, context.sessionId as string);
      return createPostgresSyncSnapshotJobStore({ runner: { withTransaction: async (run) => run(client) } }).enqueue({ ownerId: context.actorId, jobId, snapshotId, operationId: context.idempotencyKey as string, now });
    });
    return { status: 202, body: { data: { id: job.jobId, snapshotId: job.snapshotId, kind: 'snapshot', state: job.state, updatedAt: job.updatedAt, safeErrorCode: job.safeErrorCode } } };
  };
  const applyAiProposal: GatewayHandler = async (context) => {
    if (context.operation !== 'applyAiProposal' || !context.sessionId || !context.resourceId || !context.idempotencyKey || !context.body
      || typeof context.body.expectedProposalVersion !== 'number' || typeof context.body.reviewDigest !== 'string'
      || !Array.isArray(context.body.selectedOperationIds)) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    const now = input.now?.() ?? new Date().toISOString();
    const body = context.body;
    return input.runner.withTransaction(async (client) => {
      await recheckPostgresAppSession(client, context.actorId, context.sessionId as string);
      const store = createPostgresAiProposalApplyStore({ runner: { withTransaction: async (run) => run(client) } });
      const result = await applyAiProposalAtomically({
        intent: {
          ownerId: context.actorId,
          proposalId: context.resourceId as string,
          proposalVersion: body.expectedProposalVersion as number,
          reviewDigest: body.reviewDigest as string,
          mutationId: context.idempotencyKey as string,
          requestSha256: context.requestSha256,
        },
        selectedOperationIds: body.selectedOperationIds as string[],
        now,
        store,
        applySelectedOperations: async (transaction, proposal, selectedOperationIds) => input.applyAiProposalOperations
          ? input.applyAiProposalOperations({ transaction, actorId: context.actorId, proposal, selectedOperationIds })
          : executePostgresAiProposalOperations({ transaction, ownerId: context.actorId, proposal, selectedOperationIds }),
      });
      return { status: 200, body: { data: { action: result.action, proposalId: result.receipt.proposalId, proposalVersion: result.receipt.proposalVersion, selectedOperationIds: result.selectedOperationIds, appliedAt: result.receipt.appliedAt, committedThrough: result.receipt.committedThrough, result: result.receipt.responseBody } } };
    });
  };
  const applyPlanAction: GatewayHandler = async (context) => {
    if (context.operation !== 'applyPlanAction' || !context.sessionId || !context.resourceId || !context.idempotencyKey || !context.body || !input.applyPlanAction) {
      throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    }
    const result = await input.applyPlanAction({ actorId: context.actorId, sessionId: context.sessionId, planId: context.resourceId, mutationId: context.idempotencyKey, requestSha256: context.requestSha256, command: context.body });
    if (result.responseStatus !== 200 || !result.responseBody || typeof result.responseBody !== 'object' || Array.isArray(result.responseBody)) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    return { status: 200, body: result.responseBody };
  };
  const patchPlan: GatewayHandler = async (context) => {
    if (context.operation !== 'patchPlan' || !context.sessionId || !context.resourceId || !context.idempotencyKey || !context.body || !input.patchPlan) {
      throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    }
    const result = await input.patchPlan({ actorId: context.actorId, sessionId: context.sessionId, planId: context.resourceId, mutationId: context.idempotencyKey, requestSha256: context.requestSha256, command: context.body });
    if (result.responseStatus !== 200 || !result.responseBody || typeof result.responseBody !== 'object' || Array.isArray(result.responseBody)) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    return { status: 200, body: result.responseBody };
  };
  const createAiGeneration: GatewayHandler = async (context) => {
    if (context.operation !== 'createAiGeneration' || !context.sessionId || !context.idempotencyKey || !context.body) {
      throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
    }
    await input.runner.withTransaction((client) => recheckPostgresAppSession(client, context.actorId, context.sessionId as string));
    // Reservation, request/job creation and provider readiness must be one
    // reviewed transaction. Until that composition and policy are configured,
    // do not create a request or claim a charge.
    throw new SafeBoundaryError(503, 'POLICY_UNCONFIGURED');
  };
  const getAiUsage: GatewayHandler = async (context) => {
    if (context.operation !== 'getAiUsage' || !context.sessionId) throw new SafeBoundaryError(401, 'AUTH_REQUIRED');
    return input.runner.withTransaction(async (client) => {
      await recheckPostgresAppSession(client, context.actorId, context.sessionId as string);
      // The current allowance schema intentionally has no source allocation
      // policy. Do not fabricate free/paid/rewarded buckets or client grants.
      return { status: 200, body: { data: unavailableAiUsage('unconfigured') } };
    });
  };
  const cancelAiGeneration: GatewayHandler = async (context) => {
    if (context.operation !== 'cancelAiGeneration' || !context.sessionId || !context.resourceId || !context.idempotencyKey || context.body === null) {
      throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
    }
    const result = await input.runner.withTransaction(async (client) => {
      await recheckPostgresAppSession(client, context.actorId, context.sessionId as string);
      return createPostgresAiGenerationCancellationStore({ runner: { withTransaction: async (run) => run(client) } }).cancel({
        ownerId: context.actorId,
        requestId: context.resourceId as string,
        mutationId: context.idempotencyKey as string,
        requestSha256: context.requestSha256,
        now: input.now?.() ?? new Date().toISOString(),
      });
    });
    return { status: 200, body: { data: { outcome: result.outcome, request: result.request } } };
  };
  const getBillingEntitlements: GatewayHandler = async (context) => {
    if (context.operation !== 'getBillingEntitlements' || !context.sessionId) throw new SafeBoundaryError(401, 'AUTH_REQUIRED');
    return input.runner.withTransaction(async (client) => {
      await recheckPostgresAppSession(client, context.actorId, context.sessionId as string);
      // Provider verification and entitlement projection are not configured here.
      return { status: 200, body: unavailableEntitlements() as unknown as Record<string, unknown> };
    });
  };
  const getBillingCatalog: GatewayHandler = async (context) => {
    if (context.operation !== 'getBillingCatalog' || !context.sessionId) throw new SafeBoundaryError(401, 'AUTH_REQUIRED');
    return input.runner.withTransaction(async (client) => {
      await recheckPostgresAppSession(client, context.actorId, context.sessionId as string);
      // Never invent a provider, price, currency or offer while policy is open.
      return { status: 200, body: unavailableCatalog() as unknown as Record<string, unknown> };
    });
  };
  const revokeAccountSessions: GatewayHandler = async (context) => {
    if (context.operation !== 'revokeAccountSessions' || !context.sessionId || !context.idempotencyKey || !context.body
      || !input.verifyRecentAuth || !revokeAccountSessionsDependency) {
      throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    }
    const recentAuth = await input.verifyRecentAuth({ actorId: context.actorId, sessionId: context.sessionId, now: input.now?.() ?? new Date().toISOString() });
    if (recentAuth !== true) throw new SafeBoundaryError(401, 'AUTH_REQUIRED');
    const result = await revokeAccountSessionsDependency({ actorId: context.actorId, currentSessionId: context.sessionId, requestId: context.idempotencyKey, body: context.body, requestSha256: context.requestSha256 });
    validateRevocationResponse(result);
    return { status: result.responseStatus, body: result.responseBody };
  };
  const signOut: GatewayHandler = async (context) => {
    if (context.operation !== 'signOut' || !context.sessionId || !context.idempotencyKey || !signOutSessionDependency) {
      throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    }
    const result = await signOutSessionDependency({
      actorId: context.actorId,
      currentSessionId: context.sessionId,
      requestId: context.idempotencyKey,
      body: { scope: 'one', sessionId: context.sessionId },
      requestSha256: context.requestSha256,
    });
    validateRevocationResponse(result);
    const data = result.responseBody.data as Record<string, unknown>;
    if (data.revokedCount !== 1 || data.currentSessionRevoked !== true) {
      throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    }
    return { status: 200, body: result.responseBody };
  };
  return {
    ...createPostgresGatewayReadHandlers({ runner: input.runner, listCursorSecret: input.listCursorSecret, now: input.now, cursorTtlMs: input.cursorTtlMs, analyticsMaxRangeMs: input.analyticsMaxRangeMs }),
    createPrivacyExport,
    pullSync,
    pushSync,
    getSyncSnapshot,
    getSyncSnapshotPage,
    createSyncSnapshot,
    applyAiProposal,
    applyPlanAction,
    patchPlan,
    createAiGeneration,
    getAiUsage,
    cancelAiGeneration,
    getBillingEntitlements,
    getBillingCatalog,
    revokeAccountSessions,
    signOut,
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
    createReminder: transactionalHandler('createReminder', store),
    patchReminder: transactionalHandler('patchReminder', store),
    deleteReminder: transactionalHandler('deleteReminder', store),
  };
}
