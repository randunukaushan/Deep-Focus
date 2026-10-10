/** Server-only semantic validation for the approved personal-core DTOs. */

import type { GatewayOperation } from './gateway-router.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const PRIORITIES = new Set([null, 'low', 'medium', 'high']);
const TYPES = new Set(['focus_time', 'session_count', 'task_completion']);
const PERIODS = new Set(['daily', 'weekly', 'monthly', 'custom']);
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
    default: return;
  }
}
