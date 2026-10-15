/** Local, review-gated Plan My Day lifecycle command boundary. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PlanLifecycleAction = 'archive' | 'restore' | 'delete';
export type PlanLifecycleInput = {
  action: PlanLifecycleAction;
  expectedVersion: number;
  reminderVersions: { id: string; expectedVersion: number }[];
};
export type PlanLifecycleState = 'active' | 'archived' | 'deleted';
export type PlanLifecyclePlan = { id: string; ownerId: string; state: PlanLifecycleState; version: number };
export type PlanLifecycleResult = {
  action: PlanLifecycleAction;
  planId: string;
  previousVersion: number;
  nextVersion: number | null;
  nextState: PlanLifecycleState;
  remindersToDisable: { id: string; expectedVersion: number }[];
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function conflict(code: 'VERSION_CONFLICT' | 'INVALID_TRANSITION' | 'ENTITY_DELETED' = 'INVALID_TRANSITION'): never { throw new SafeBoundaryError(409, code); }

function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length && Object.keys(value).every((key) => keys.includes(key));
}

export function normalizePlanLifecycleInput(value: unknown): PlanLifecycleInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
  const body = value as Record<string, unknown>;
  if (!exactKeys(body, ['action', 'expectedVersion', 'reminderVersions']) || !['archive', 'restore', 'delete'].includes(String(body.action))
    || !Number.isSafeInteger(body.expectedVersion) || (body.expectedVersion as number) < 1 || !Array.isArray(body.reminderVersions)
    || body.reminderVersions.length > 100) invalid();
  const seen = new Set<string>();
  const reminderVersions = body.reminderVersions.map((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
    const row = value as Record<string, unknown>;
    if (!exactKeys(row, ['id', 'expectedVersion']) || typeof row.id !== 'string' || !UUID.test(row.id)
      || !Number.isSafeInteger(row.expectedVersion) || (row.expectedVersion as number) < 1 || seen.has(row.id)) invalid();
    seen.add(row.id);
    return { id: row.id, expectedVersion: row.expectedVersion as number };
  });
  if (body.action === 'restore' && reminderVersions.length !== 0) invalid();
  return { action: body.action as PlanLifecycleAction, expectedVersion: body.expectedVersion as number, reminderVersions };
}

export function decidePlanLifecycle(input: { plan: PlanLifecyclePlan; command: unknown; boundReminderVersions: { id: string; version: number }[] }): PlanLifecycleResult {
  const command = normalizePlanLifecycleInput(input.command);
  const plan = input.plan;
  if (!UUID.test(plan.id) || !UUID.test(plan.ownerId) || !['active', 'archived', 'deleted'].includes(plan.state) || !Number.isSafeInteger(plan.version) || plan.version < 1) invalid();
  if (plan.state === 'deleted') conflict('ENTITY_DELETED');
  if (command.expectedVersion !== plan.version) conflict('VERSION_CONFLICT');
  const bound = [...input.boundReminderVersions].sort((a, b) => a.id.localeCompare(b.id));
  if (bound.some((row) => !UUID.test(row.id) || !Number.isSafeInteger(row.version) || row.version < 1)) invalid();
  const submitted = [...command.reminderVersions].sort((a, b) => a.id.localeCompare(b.id));
  const exactReminderSet = bound.length === submitted.length && bound.every((row, index) => row.id === submitted[index]?.id && row.version === submitted[index]?.expectedVersion);
  if ((command.action === 'archive' || command.action === 'delete') && !exactReminderSet) invalid();
  if (command.action === 'restore' && submitted.length !== 0) invalid();
  if (command.action === 'archive' && plan.state !== 'active') conflict();
  if (command.action === 'restore' && plan.state !== 'archived') conflict();
  if (command.action === 'delete' && !['active', 'archived'].includes(plan.state)) conflict();
  return {
    action: command.action,
    planId: plan.id,
    previousVersion: plan.version,
    nextVersion: command.action === 'delete' ? null : plan.version + 1,
    nextState: command.action === 'delete' ? 'deleted' : command.action === 'archive' ? 'archived' : 'active',
    remindersToDisable: command.action === 'restore' ? [] : submitted,
  };
}
