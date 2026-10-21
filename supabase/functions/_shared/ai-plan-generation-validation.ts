/** Strict server boundary for the canonical Plan My Day generation input. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const MAX_TASKS = 100;
const MAX_WINDOW_MS = 48 * 60 * 60 * 1000;

export type PlanGenerationInput = {
  requestId: string;
  taskIds: string[];
  availableStart: string;
  availableEnd: string;
  timeZone: string;
  preferences: {
    defaultFocusMinutes: number;
    defaultBreakMinutes: number;
    reminderLeadMinutes: number | null;
  };
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}
function uuid(value: unknown): string {
  if (typeof value !== 'string' || value.length > 36 || !UUID.test(value)) invalid();
  return value;
}
function instant(value: unknown): string {
  if (typeof value !== 'string' || !INSTANT.test(value) || !Number.isFinite(Date.parse(value))) invalid();
  return value;
}
function safeNonNegativeInteger(value: unknown, positive: boolean): number {
  if (!Number.isSafeInteger(value) || (value as number) < (positive ? 1 : 0)) invalid();
  return value as number;
}
function validTimeZone(value: unknown): string {
  if (typeof value !== 'string' || value.length < 1 || value.length > 100 || /[\u0000-\u001f\u007f]/.test(value)) invalid();
  try { new Intl.DateTimeFormat('en-US', { timeZone: value }).format(); } catch { invalid(); }
  return value;
}

export function validatePlanGenerationInput(value: unknown): PlanGenerationInput {
  const body = object(value);
  if (Object.keys(body).sort().join(',') !== 'availableEnd,availableStart,preferences,requestId,taskIds,timeZone') invalid();
  const requestId = uuid(body.requestId);
  if (!Array.isArray(body.taskIds) || !isPlainJsonValueForBoundary(body.taskIds) || body.taskIds.length < 1 || body.taskIds.length > MAX_TASKS) invalid();
  const taskIds = body.taskIds.map(uuid);
  if (new Set(taskIds).size !== taskIds.length) invalid();
  const availableStart = instant(body.availableStart);
  const availableEnd = instant(body.availableEnd);
  const startMs = Date.parse(availableStart);
  const endMs = Date.parse(availableEnd);
  if (endMs <= startMs || endMs - startMs > MAX_WINDOW_MS) invalid();
  const timeZone = validTimeZone(body.timeZone);
  const preferences = object(body.preferences);
  if (Object.keys(preferences).sort().join(',') !== 'defaultBreakMinutes,defaultFocusMinutes,reminderLeadMinutes') invalid();
  const defaultFocusMinutes = safeNonNegativeInteger(preferences.defaultFocusMinutes, true);
  const defaultBreakMinutes = safeNonNegativeInteger(preferences.defaultBreakMinutes, false);
  const reminderLeadMinutes = preferences.reminderLeadMinutes === null ? null : safeNonNegativeInteger(preferences.reminderLeadMinutes, false);
  return { requestId, taskIds, availableStart, availableEnd, timeZone, preferences: { defaultFocusMinutes, defaultBreakMinutes, reminderLeadMinutes } };
}
