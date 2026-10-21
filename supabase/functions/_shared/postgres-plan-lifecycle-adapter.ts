/** Local PostgreSQL candidate for one transactional Plan lifecycle command. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresMutationApplyInput, PostgresTransactionRunner, PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { executeDomainMutation, type DomainMutationResult } from './domain-mutation-transaction.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresDomainMutationStore } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { decidePlanLifecycle, normalizePlanLifecycleInput } from './plan-lifecycle-validation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function queryRows<T = Record<string, unknown>>(result: unknown): T[] {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) unavailable();
  return result.rows as T[];
}
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function isInstant(value: unknown): value is string { return typeof value === 'string' && INSTANT.test(value) && Number.isFinite(Date.parse(value)); }
function validRunner(value: unknown): value is PostgresTransactionRunner { return isRecord(value) && typeof value.withTransaction === 'function'; }
function validateLifecycleInput(input: unknown): asserts input is PostgresPlanLifecycleInput {
  if (!isRecord(input) || !isUuid(input.actorId) || !isUuid(input.planId) || !isInstant(input.now)) invalid();
}

export type PostgresPlanLifecycleInput = { actorId: string; planId: string; command: unknown; now: string };

export type PostgresPlanActionCandidate = {
  execute: (input: { actorId: string; sessionId?: string; planId: string; mutationId: string; requestSha256: string; command: unknown }) => Promise<DomainMutationResult>;
};

export async function applyPostgresPlanLifecycle(client: PostgresTransactionClient, input: PostgresPlanLifecycleInput): Promise<Record<string, unknown>> {
  if (!client || typeof client !== 'object' || typeof client.query !== 'function') unavailable();
  validateLifecycleInput(input);
  const command = normalizePlanLifecycleInput(input.command);
  const profile = await client.query<{ owner_id: string; account_state: string }>(
    `select owner_id, account_state from df_private.profiles where owner_id = $1 and account_state = 'active' for update`, [input.actorId],
  );
  const profileRows = queryRows<{ owner_id: string; account_state: string }>(profile);
  if (profileRows.length !== 1 || profileRows[0]?.owner_id !== input.actorId || profileRows[0]?.account_state !== 'active') throw new SafeBoundaryError(403, 'ACCESS_DENIED');
  const head = await client.query<{ owner_id: string }>('select owner_id from df_private.sync_heads where owner_id = $1 for update', [input.actorId]);
  const headRows = queryRows<{ owner_id: string }>(head);
  if (headRows.length !== 1 || headRows[0]?.owner_id !== input.actorId) unavailable();
  const planResult = await client.query<{ id: string; owner_id: string; state: 'active' | 'archived'; version: number; deleted_at: string | null }>(
    `select id, owner_id, state, version, deleted_at from df_private.ai_plans where owner_id = $1 and id = $2 for update`, [input.actorId, input.planId],
  );
  const planRows = queryRows<{ id: string; owner_id: string; state: 'active' | 'archived'; version: number; deleted_at: string | null }>(planResult);
  if (planRows.length === 0) throw new SafeBoundaryError(404, 'NOT_FOUND');
  if (planRows.length !== 1) unavailable();
  const stored = planRows[0];
  const reminders = await client.query<{ id: string; version: number }>(
    `select r.id, r.version from df_private.task_reminders r join df_private.ai_plan_blocks b
     on b.owner_id = r.owner_id and b.reminder_id = r.id
     where b.owner_id = $1 and b.plan_id = $2 and r.deleted_at is null for update`, [input.actorId, input.planId],
  );
  const reminderRows = queryRows<{ id: string; version: number }>(reminders);
  const decision = decidePlanLifecycle({ plan: { id: stored.id, ownerId: stored.owner_id, state: stored.deleted_at === null ? stored.state : 'deleted', version: stored.version }, command, boundReminderVersions: reminderRows });
  for (const reminder of decision.remindersToDisable) {
    const updated = await client.query<{ id: string; version: number }>(
      `update df_private.task_reminders set enabled = false, version = version + 1, updated_at = $4
       where owner_id = $1 and id = $2 and version = $3 and deleted_at is null returning id, version`,
      [input.actorId, reminder.id, reminder.expectedVersion, input.now],
    );
    const updatedRows = queryRows<{ id: string; version: number }>(updated);
    if (updatedRows.length !== 1 || updatedRows[0]?.id !== reminder.id || updatedRows[0]?.version !== reminder.expectedVersion + 1) throw new SafeBoundaryError(409, 'VERSION_CONFLICT');
  }
  const updatedPlan = await client.query<{ id: string; version: number; state: 'active' | 'archived'; deleted_at: string | null }>(
    `update df_private.ai_plans set state = $3, version = version + 1, deleted_at = $4, updated_at = $5
     where owner_id = $1 and id = $2 and version = $6 and deleted_at is null returning id, version, state, deleted_at`,
    [input.actorId, input.planId, decision.nextState === 'deleted' ? stored.state : decision.nextState, decision.nextState === 'deleted' ? input.now : null, input.now, decision.previousVersion],
  );
  const updatedPlanRows = queryRows<{ id: string; version: number; state: 'active' | 'archived'; deleted_at: string | null }>(updatedPlan);
  if (updatedPlanRows.length > 1) unavailable();
  const row = updatedPlanRows[0];
  if (!row || row.id !== input.planId || row.version !== decision.previousVersion + 1 || (decision.nextState === 'deleted' ? row.deleted_at !== input.now : row.deleted_at !== null || row.state !== decision.nextState)) unavailable();
  return { data: { mutation: { command: `plan.${decision.action}`, targetId: row.id, previousVersion: decision.previousVersion, entityVersion: row.version, state: decision.nextState, deletedAt: row.deleted_at } } };
}

export function createPostgresPlanLifecycleAdapter(input: { runner: PostgresTransactionRunner }): { apply: (request: PostgresPlanLifecycleInput) => Promise<Record<string, unknown>> } {
  if (!isRecord(input) || !validRunner(input.runner)) invalid();
  return { apply: async (request) => {
    validateLifecycleInput(request);
    return input.runner.withTransaction((client) => applyPostgresPlanLifecycle(client, request));
  } };
}

export function createPostgresPlanActionCandidate(input: { runner: PostgresTransactionRunner; now: string }): PostgresPlanActionCandidate {
  if (!isRecord(input) || !validRunner(input.runner) || !isInstant(input.now)) invalid();
  const store = createPostgresDomainMutationStore({
    runner: input.runner,
    applyMutation: (client, mutation: PostgresMutationApplyInput) => {
      if (!mutation.resourceId || !mutation.body) invalid();
      return applyPostgresPlanLifecycle(client, { actorId: mutation.actorId, planId: mutation.resourceId, command: mutation.body, now: input.now }).then((responseBody) => ({ responseBody, responseStatus: 200 as const }));
    },
  });
  return {
    execute: (request) => executeDomainMutation({
      actorId: request.actorId, ...(request.sessionId ? { sessionId: request.sessionId } : {}), operation: 'applyPlanAction', mutationId: request.mutationId,
      requestSha256: request.requestSha256, body: request.command as Record<string, unknown>, resourceId: request.planId, store,
    }),
  };
}
