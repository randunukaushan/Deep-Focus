/** Server-authoritative EX-31 usage response; it never accepts client grants. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const ACTIONS = new Set(['plan_my_day', 'break_down_task', 'review_my_day_lite']);
const SOURCES = new Set(['free', 'paid', 'rewarded']);

export type AiAction = 'plan_my_day' | 'break_down_task' | 'review_my_day_lite';
export type AiUsageBucket = { source: 'free' | 'paid' | 'rewarded'; availableActions: number; reservedActions: number };
export type AiUsage = {
  status: 'current' | 'unconfigured' | 'unavailable';
  policyVersion: string | null;
  checkedAt: string | null;
  unit: 'action';
  availableActions: number | null;
  reservedActions: number | null;
  buckets: AiUsageBucket[] | null;
  enabledActions: AiAction[] | null;
  nextRefreshAt: string | null;
};

function invalid(message: string): never { throw new RangeError(`INVALID_AI_USAGE: ${message}`); }
function count(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) invalid(`${field} must be a safe nonnegative integer`);
  return value as number;
}
function instant(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 100 || !Number.isFinite(Date.parse(value))) invalid(`${field} must be a valid instant`);
  return value;
}

export function unavailableAiUsage(status: 'unconfigured' | 'unavailable' = 'unavailable'): AiUsage {
  return { status, policyVersion: null, checkedAt: null, unit: 'action', availableActions: null, reservedActions: null, buckets: null, enabledActions: null, nextRefreshAt: null };
}

export function projectAiUsage(input: {
  policyVersion: string;
  checkedAt: string;
  buckets: AiUsageBucket[];
  enabledActions: AiAction[];
  nextRefreshAt: string | null;
}): AiUsage {
  if (typeof input.policyVersion !== 'string' || input.policyVersion.length < 1 || input.policyVersion.length > 100 || !/\S/.test(input.policyVersion)) invalid('policyVersion is invalid');
  const checkedAt = instant(input.checkedAt, 'checkedAt');
  if (!Array.isArray(input.buckets) || !isPlainJsonValueForBoundary(input.buckets) || input.buckets.length > 3) invalid('buckets are invalid');
  const seenSources = new Set<string>();
  const buckets = input.buckets.map((bucket) => {
    if (!bucket || typeof bucket !== 'object' || !SOURCES.has(bucket.source) || seenSources.has(bucket.source)) invalid('bucket sources must be unique and supported');
    seenSources.add(bucket.source);
    return { source: bucket.source, availableActions: count(bucket.availableActions, 'availableActions'), reservedActions: count(bucket.reservedActions, 'reservedActions') };
  });
  if (!Array.isArray(input.enabledActions) || !isPlainJsonValueForBoundary(input.enabledActions) || input.enabledActions.length > 3 || new Set(input.enabledActions).size !== input.enabledActions.length || input.enabledActions.some((action) => !ACTIONS.has(action))) invalid('enabledActions are invalid');
  const nextRefreshAt = input.nextRefreshAt === null ? null : instant(input.nextRefreshAt, 'nextRefreshAt');
  const availableActions = buckets.reduce((total, bucket) => total + bucket.availableActions, 0);
  const reservedActions = buckets.reduce((total, bucket) => total + bucket.reservedActions, 0);
  count(availableActions, 'availableActions'); count(reservedActions, 'reservedActions');
  return { status: 'current', policyVersion: input.policyVersion, checkedAt, unit: 'action', availableActions, reservedActions, buckets, enabledActions: [...input.enabledActions], nextRefreshAt };
}

export function validateAiUsage(value: unknown): AiUsage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('usage must be an object');
  const usage = value as Record<string, unknown>;
  if (usage.status === 'unconfigured' || usage.status === 'unavailable') {
    const expected = unavailableAiUsage(usage.status);
    if (JSON.stringify(usage) !== JSON.stringify(expected)) invalid('unknown usage must not contain claims');
    return expected;
  }
  return projectAiUsage({
    policyVersion: usage.policyVersion as string,
    checkedAt: usage.checkedAt as string,
    buckets: usage.buckets as AiUsageBucket[],
    enabledActions: usage.enabledActions as AiAction[],
    nextRefreshAt: usage.nextRefreshAt as string | null,
  });
}
