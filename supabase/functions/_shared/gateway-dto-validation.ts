/** Server-only semantic validation for the approved personal-core DTOs. */

import type { GatewayOperation } from './gateway-router.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { validatePlanGenerationInput } from './ai-plan-generation-validation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { normalizePlanLifecycleInput } from './plan-lifecycle-validation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { validatePlanEditInput } from './plan-replication-wire.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const PRIORITIES = new Set([null, 'low', 'medium', 'high']);
const TYPES = new Set(['focus_time', 'session_count', 'task_completion']);
const PERIODS = new Set(['daily', 'weekly', 'monthly', 'custom']);
const SHA256 = /^[a-f0-9]{64}$/;
const ACTIONS = new Set(['begin', 'complete', 'cancel', 'archive']);
const EVENT_TYPES = new Set(['pause', 'resume', 'complete', 'cancel']);

type Body = Record<string, unknown>;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function object(value: unknown): Body { if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(); return value as Body; }
function string(value: unknown, max: number, nonBlank = false): string {
  if (typeof value !== 'string' || value.length > max || (nonBlank && (value.length === 0 || !/\S/.test(value)))) invalid();
  return value;
}
function uuid(value: unknown): string { const result = string(value, 36); if (!UUID.test(result)) invalid(); return result; }
function version(value: unknown): void { if (!Number.isSafeInteger(value) || (value as number) < 1 || (value as number) > 2147483647) invalid(); }
function positiveMs(value: unknown): void { if (!Number.isSafeInteger(value) || (value as number) < 1 || (value as number) > Number.MAX_SAFE_INTEGER) invalid(); }
function instant(value: unknown): void { const result = string(value, 24); if (!INSTANT.test(result) || Number.isNaN(Date.parse(result))) invalid(); }
function nullableUuid(value: unknown): void { if (value !== null) uuid(value); }
function optionalText(value: unknown): void { if (value !== null) string(value, 4000); }
function priority(value: unknown): void { if (value !== null && (typeof value !== 'string' || !PRIORITIES.has(value))) invalid(); }

function decimal(value: unknown, max = 80): void { if (typeof value !== 'string' || value.length < 1 || value.length > max || !/^(?:0|[1-9][0-9]*)$/.test(value)) invalid(); }

function syncChange(value: unknown): void {
  const entry = object(value);
  if (Object.keys(entry).sort().join(',') !== 'entityId,entityKind,operation,payload,sequence') invalid();
  uuid(entry.entityId); decimal(entry.sequence);
  if (typeof entry.entityKind !== 'string' || !['profile', 'goal', 'task', 'session', 'focus_session', 'settings', 'break', 'reminder'].includes(entry.entityKind)) invalid();
  if (entry.operation !== 'upsert' && entry.operation !== 'delete') invalid();
  if (entry.operation === 'delete') { if (entry.payload !== null) invalid(); }
  else if (!entry.payload || typeof entry.payload !== 'object' || Array.isArray(entry.payload)) invalid();
}

function due(value: unknown): void {
  const entry = object(value);
  if (entry.kind === 'none' && Object.keys(entry).length === 1) return;
  if (entry.kind === 'date' && Object.keys(entry).length === 2) { const date = string(entry.date, 10); if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) invalid(); return; }
  if (entry.kind === 'instant' && Object.keys(entry).length === 2) { instant(entry.at); return; }
  invalid();
}

function commonTaskFields(body: Body, patch: boolean): void {
  if (patch && Object.keys(body).length < 2) invalid();
  if ('title' in body) string(body.title, 240, true);
  if ('description' in body) optionalText(body.description);
  if ('priority' in body) priority(body.priority);
  if ('goalId' in body) nullableUuid(body.goalId);
  if ('due' in body) due(body.due);
}

export function validateGatewayOperationDto(operation: GatewayOperation, value: unknown): void {
  const body = object(value);
  switch (operation) {
    case 'revokeAccountSessions':
      if (body.scope === 'one') { if (Object.keys(body).length !== 2 || typeof body.sessionId !== 'string' || !UUID.test(body.sessionId)) invalid(); return; }
      if ((body.scope === 'others' || body.scope === 'all') && Object.keys(body).length === 1) return;
      invalid();
    case 'cancelAiGeneration':
      if (Object.keys(body).length !== 0) invalid();
      return;
    case 'applyAiProposal':
      if (Object.keys(body).length !== 3 || !Number.isSafeInteger(body.expectedProposalVersion) || (body.expectedProposalVersion as number) < 1
        || typeof body.reviewDigest !== 'string' || !SHA256.test(body.reviewDigest)
        || !Array.isArray(body.selectedOperationIds) || !isPlainJsonValueForBoundary(body.selectedOperationIds) || body.selectedOperationIds.length < 1 || body.selectedOperationIds.length > 25
        || body.selectedOperationIds.some((id) => typeof id !== 'string' || !UUID.test(id))
        || new Set(body.selectedOperationIds as string[]).size !== (body.selectedOperationIds as string[]).length) invalid();
      return;
    case 'createAiGeneration':
      validatePlanGenerationInput(body);
      return;
    case 'applyPlanAction':
      normalizePlanLifecycleInput(body);
      return;
    case 'patchPlan':
      validatePlanEditInput(body);
      return;
    case 'createPrivacyExport':
      if (Object.keys(body).length !== 2 || body.format !== 'json' || body.scope !== 'own_account_data') invalid();
      return;
    case 'createSyncSnapshot':
      if (Object.keys(body).length !== 0) invalid();
      return;
    case 'pushSync':
      if (Object.keys(body).length !== 3) invalid();
      decimal(body.cursorLastSequence); string(body.nextCursor, 4096, true);
      if (!Array.isArray(body.changes) || !isPlainJsonValueForBoundary(body.changes) || body.changes.length > 100) invalid();
      body.changes.forEach(syncChange);
      return;
    case 'patchMe':
      version(body.expectedVersion); string(body.displayName, 100, true); return;
    case 'createTask':
      uuid(body.id); uuid(body.workspaceId); string(body.title, 240, true); commonTaskFields(body, false); return;
    case 'patchTask':
      version(body.expectedVersion); commonTaskFields(body, true); return;
    case 'deleteTask':
      version(body.expectedVersion);
      if (Object.keys(body).length !== 1) invalid();
      return;
    case 'patchSettings':
      version(body.expectedVersion);
      if (Object.keys(body).length < 2) invalid();
      if ('theme' in body && (typeof body.theme !== 'string' || !['system', 'light', 'dark'].includes(body.theme))) invalid();
      if ('uiLocale' in body && (typeof body.uiLocale !== 'string' || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(body.uiLocale))) invalid();
      if ('defaultFocusDurationMinutes' in body && (!Number.isSafeInteger(body.defaultFocusDurationMinutes) || (body.defaultFocusDurationMinutes as number) < 1 || (body.defaultFocusDurationMinutes as number) > 1440)) invalid();
      if ('defaultBreakDurationMinutes' in body && ![5, 10, 15].includes(body.defaultBreakDurationMinutes as number)) invalid();
      if ('aiFeaturesEnabled' in body && typeof body.aiFeaturesEnabled !== 'boolean') invalid();
      return;
    case 'patchGoal':
      version(body.expectedVersion);
      if (Object.keys(body).length < 2) invalid();
      if ('title' in body) string(body.title, 240, true);
      if ('description' in body) optionalText(body.description);
      return;
    case 'deleteGoal':
      version(body.expectedVersion);
      if (Object.keys(body).length !== 1) invalid();
      return;
    case 'applyTaskAction':
      uuid(body.id); version(body.expectedVersion); const action = string(body.action, 20); if (!ACTIONS.has(action)) invalid(); instant(body.occurredAt); return;
    case 'createGoal':
      uuid(body.id); uuid(body.workspaceId); string(body.title, 240, true); const goalType = string(body.type, 20); const period = string(body.period, 20); if (!TYPES.has(goalType) || !PERIODS.has(period)) invalid();
      if (body.description !== undefined) optionalText(body.description); instant(body.startsAt); instant(body.endsAt); string(body.timeZone, 100, true); positiveMs(body.targetValue);
      const targetUnit = string(body.targetUnit, 5); if ((goalType === 'focus_time' && targetUnit !== 'ms') || (goalType !== 'focus_time' && targetUnit !== 'count')) invalid(); return;
    case 'startSession':
      uuid(body.id); uuid(body.workspaceId); if (body.taskId !== undefined) nullableUuid(body.taskId); positiveMs(body.plannedMs); instant(body.startedAt); return;
    case 'applySessionEvent':
      uuid(body.id); version(body.expectedVersion); const eventType = string(body.type, 20); if (!EVENT_TYPES.has(eventType)) invalid(); instant(body.occurredAt); version(body.clientSequence); return;
    case 'recordBreak':
      uuid(body.id); uuid(body.focusSessionId); instant(body.startedAt); instant(body.endedAt); positiveMs(body.plannedMs);
      if ((body.plannedMs as number) > 86400000 || typeof body.outcome !== 'string' || !['completed', 'ended_early'].includes(body.outcome)) invalid();
      return;
    case 'createReminder':
      uuid(body.id); uuid(body.taskId); instant(body.scheduledFor); string(body.timeZone, 100, true); if (body.delivery !== 'local_device') invalid(); return;
    case 'patchReminder':
      version(body.expectedVersion); if (Object.keys(body).length < 2) invalid();
      if ('scheduledFor' in body) instant(body.scheduledFor);
      if ('timeZone' in body) string(body.timeZone, 100, true);
      if ('enabled' in body && typeof body.enabled !== 'boolean') invalid();
      return;
    case 'deleteReminder':
      version(body.expectedVersion); if (Object.keys(body).length !== 1) invalid(); return;
    default: return;
  }
}
