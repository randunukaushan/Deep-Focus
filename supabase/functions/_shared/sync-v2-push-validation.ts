/** Local, review-gated V2 push envelope admission. It does not execute mutations. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { validateGatewayOperationDto } from './gateway-dto-validation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { validatePlanReplicationPush } from './plan-replication-wire.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const MAX_BODY_BYTES = 65_536;

const LEGACY_COMMANDS = new Set([
  'task.create', 'task.patch', 'task.action', 'task.delete',
  'goal.create', 'goal.patch', 'goal.delete',
  'session.start', 'session.event', 'break.record', 'settings.patch',
  'reminder.create', 'reminder.patch', 'reminder.delete',
]);

type LegacyCommand = typeof LEGACY_COMMANDS extends Set<infer T> ? T & string : never;
type V2Command = LegacyCommand | 'plan.edit' | 'plan.archive' | 'plan.restore' | 'plan.delete';
export type V2PushItem = { mutationId: string; command: V2Command; targetId: string; body: Record<string, unknown> };
export type V2PushInput = { contractVersion: 2; privacyEpoch: string; items: V2PushItem[] };

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}
function exactKeys(value: Record<string, unknown>, keys: readonly string[]): void {
  const actual = Object.keys(value).sort().join(',');
  if (actual !== [...keys].sort().join(',')) invalid();
}
function byteLength(value: unknown): number {
  try { return new TextEncoder().encode(JSON.stringify(value)).byteLength; } catch { invalid(); }
}

function operationFor(command: LegacyCommand): Parameters<typeof validateGatewayOperationDto>[0] {
  const operations: Record<LegacyCommand, Parameters<typeof validateGatewayOperationDto>[0]> = {
    'task.create': 'createTask', 'task.patch': 'patchTask', 'task.action': 'applyTaskAction', 'task.delete': 'deleteTask',
    'goal.create': 'createGoal', 'goal.patch': 'patchGoal', 'goal.delete': 'deleteGoal',
    'session.start': 'startSession', 'session.event': 'applySessionEvent', 'break.record': 'recordBreak',
    'settings.patch': 'patchSettings', 'reminder.create': 'createReminder', 'reminder.patch': 'patchReminder',
    'reminder.delete': 'deleteReminder',
  };
  return operations[command];
}

function validateLegacyItem(item: V2PushItem): void {
  validateGatewayOperationDto(operationFor(item.command as LegacyCommand), item.body);
  if (['task.create', 'goal.create', 'session.start', 'break.record', 'reminder.create'].includes(item.command)) {
    const bodyId = (item.body as Record<string, unknown>).id;
    if (bodyId !== item.targetId) invalid();
  }
  if (item.command === 'task.action' || item.command === 'session.event') {
    if ((item.body as Record<string, unknown>).id !== item.targetId) invalid();
  }
}

/**
 * Validates the complete envelope before any domain transaction is allowed.
 * The authenticated owner and current epoch are deliberately supplied by the
 * caller; this function never accepts an owner selector from the client.
 */
export function validateSyncV2PushInput(value: unknown): V2PushInput {
  const input = object(value);
  exactKeys(input, ['contractVersion', 'privacyEpoch', 'items']);
  if (input.contractVersion !== 2 || typeof input.privacyEpoch !== 'string' || !DECIMAL.test(input.privacyEpoch)
    || input.privacyEpoch === '0' || !Array.isArray(input.items) || input.items.length < 1 || input.items.length > 25
    || byteLength(input) > MAX_BODY_BYTES) invalid();

  const seen = new Set<string>();
  const items = input.items.map((raw): V2PushItem => {
    const item = object(raw);
    exactKeys(item, ['mutationId', 'command', 'targetId', 'body']);
    if (typeof item.mutationId !== 'string' || !UUID.test(item.mutationId) || seen.has(item.mutationId)
      || typeof item.command !== 'string' || typeof item.targetId !== 'string' || !UUID.test(item.targetId)) invalid();
    const body = object(item.body);
    const typed = { mutationId: item.mutationId, command: item.command as V2Command, targetId: item.targetId, body };
    seen.add(typed.mutationId);
    if (typed.command === 'plan.edit' || typed.command === 'plan.archive' || typed.command === 'plan.restore' || typed.command === 'plan.delete') {
      validatePlanReplicationPush({ contractVersion: 2, privacyEpoch: input.privacyEpoch, items: [typed] });
    } else if (LEGACY_COMMANDS.has(typed.command)) {
      validateLegacyItem(typed);
    } else invalid();
    return typed;
  });
  return { contractVersion: 2, privacyEpoch: input.privacyEpoch, items };
}
