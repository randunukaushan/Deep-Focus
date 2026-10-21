/** Local, review-gated PL-02 plan replication and export wire helpers. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const SHA256 = /^[a-f0-9]{64}$/;

export type PlanReplicationItem = { mutationId: string; command: 'plan.edit' | 'plan.archive' | 'plan.restore' | 'plan.delete'; targetId: string; body: Record<string, unknown> };
export type SavedPlanWire = {
  id: string; workspaceId: string; localDate: string; timeZone: string; availableStart: string;
  availableEnd: string; explanation: string | null; blocks: Record<string, unknown>[];
  version: number; createdAt: string; sourceProposalId: string; state: 'active' | 'archived'; updatedAt: string;
};

function fail(code = 'VALIDATION_FAILED'): never { throw new SafeBoundaryError(422, code); }
function isInstant(value: unknown): value is string { return typeof value === 'string' && INSTANT.test(value) && Number.isFinite(Date.parse(value)); }
function isPositiveVersion(value: unknown): value is number { return Number.isSafeInteger(value) && (value as number) > 0; }
function keysExactly(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).length === allowed.length && Object.keys(value).every((key) => allowed.includes(key));
}

function canonical(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail();
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    const keys = Object.keys(value);
    if (Object.getOwnPropertySymbols(value).length > 0
      || keys.length !== value.length
      || keys.some((key) => !/^(?:0|[1-9][0-9]*)$/.test(key) || Number(key) >= value.length)) fail();
    return `[${value.map(canonical).join(',')}]`;
  }
  if (!value || typeof value !== 'object') fail();
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) fail();
  if (Object.getOwnPropertySymbols(value).length > 0) fail();
  return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`).join(',')}}`;
}

async function digest(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(canonical(value));
  const result = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), (byte) => byte.toString(16).padStart(2, '0')).join('');
  if (!SHA256.test(result)) fail('DEPENDENCY_UNAVAILABLE');
  return result;
}

function validateBlock(block: Record<string, unknown>): void {
  if (block.kind === 'focus') {
    if (!keysExactly(block, ['id', 'kind', 'taskId', 'startsAt', 'endsAt', 'reminderId']) || typeof block.id !== 'string' || !UUID.test(block.id)
      || !isInstant(block.startsAt) || !isInstant(block.endsAt) || Date.parse(block.endsAt) <= Date.parse(block.startsAt)
      || typeof block.taskId !== 'string' || !UUID.test(block.taskId) || (block.reminderId !== null && (typeof block.reminderId !== 'string' || !UUID.test(block.reminderId)))) fail();
    return;
  }
  if (!keysExactly(block, ['id', 'kind', 'afterBlockId', 'startsAt', 'endsAt']) || block.kind !== 'break' || typeof block.id !== 'string' || !UUID.test(block.id)
    || typeof block.afterBlockId !== 'string' || !UUID.test(block.afterBlockId) || !isInstant(block.startsAt) || !isInstant(block.endsAt)
    || Date.parse(block.endsAt) <= Date.parse(block.startsAt)) fail();
}

function validatePlanCreateBlock(block: Record<string, unknown>): void {
  if (block.kind === 'focus') {
    if (Object.keys(block).length !== 6 || !['id', 'kind', 'taskId', 'startsAt', 'endsAt', 'reminderId'].every((key) => key in block)
      || typeof block.id !== 'string' || !UUID.test(block.id) || block.kind !== 'focus'
      || typeof block.taskId !== 'string' || !UUID.test(block.taskId) || !isInstant(block.startsAt) || !isInstant(block.endsAt)
      || Date.parse(block.endsAt) <= Date.parse(block.startsAt) || (block.reminderId !== null && (typeof block.reminderId !== 'string' || !UUID.test(block.reminderId)))) fail();
    return;
  }
  if (Object.keys(block).length !== 5 || !['id', 'kind', 'afterBlockId', 'startsAt', 'endsAt'].every((key) => key in block)
    || block.kind !== 'break' || typeof block.id !== 'string' || !UUID.test(block.id) || typeof block.afterBlockId !== 'string' || !UUID.test(block.afterBlockId)
    || !isInstant(block.startsAt) || !isInstant(block.endsAt) || Date.parse(block.endsAt) <= Date.parse(block.startsAt)) fail();
}

function validatePlanCreate(value: unknown): asserts value is { id: string; workspaceId: string; blocks: Record<string, unknown>[] } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail();
  const plan = value as Record<string, unknown>;
  if (Object.keys(plan).length !== 8 || !['id', 'workspaceId', 'localDate', 'timeZone', 'availableStart', 'availableEnd', 'explanation', 'blocks'].every((key) => key in plan)
    || typeof plan.id !== 'string' || !UUID.test(plan.id) || typeof plan.workspaceId !== 'string' || !UUID.test(plan.workspaceId)
    || typeof plan.localDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(plan.localDate) || typeof plan.timeZone !== 'string' || plan.timeZone.length < 1 || plan.timeZone.length > 100
    || !isInstant(plan.availableStart) || !isInstant(plan.availableEnd) || Date.parse(plan.availableEnd) <= Date.parse(plan.availableStart)
    || (plan.explanation !== null && (typeof plan.explanation !== 'string' || plan.explanation.length < 1 || plan.explanation.length > 500))
    || !Array.isArray(plan.blocks) || plan.blocks.length < 1 || plan.blocks.length > 100) fail();
  const seen = new Set<string>(); const focusTasks = new Set<string>(); const blockTimes: { id: string; kind: string; startsAt: number; endsAt: number; afterBlockId?: string }[] = []; let hasFocus = false;
  for (const raw of plan.blocks) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail();
    validatePlanCreateBlock(raw as Record<string, unknown>);
    const id = (raw as Record<string, unknown>).id as string;
    if (seen.has(id)) fail();
    const block = raw as Record<string, unknown>; const startsAt = Date.parse(block.startsAt as string); const endsAt = Date.parse(block.endsAt as string);
    if (startsAt < Date.parse(plan.availableStart as string) || endsAt > Date.parse(plan.availableEnd as string)) fail();
    seen.add(id); hasFocus ||= block.kind === 'focus';
    if (block.kind === 'focus') focusTasks.add(block.taskId as string);
    blockTimes.push({ id, kind: block.kind as string, startsAt, endsAt, ...(block.afterBlockId === undefined ? {} : { afterBlockId: block.afterBlockId as string }) });
  }
  if (!hasFocus) fail();
  const ordered = [...blockTimes].sort((a, b) => a.startsAt - b.startsAt || a.id.localeCompare(b.id));
  for (let index = 1; index < ordered.length; index += 1) if (ordered[index].startsAt < ordered[index - 1].endsAt) fail();
  const prior = new Set<string>();
  for (const block of ordered) {
    if (block.kind === 'break' && (!block.afterBlockId || !prior.has(block.afterBlockId))) fail();
    prior.add(block.id);
  }
  return;
}

function validateVersionRefs(value: unknown, maximum: number, minimum: number): void {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) fail();
  const seen = new Set<string>();
  for (const raw of value) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail();
    const row = raw as Record<string, unknown>;
    if (Object.keys(row).length !== 2 || !('id' in row) || !('expectedVersion' in row)
      || typeof row.id !== 'string' || !UUID.test(row.id) || !isPositiveVersion(row.expectedVersion) || seen.has(row.id)) fail();
    seen.add(row.id);
  }
}

function validateReminderActions(value: unknown): void {
  if (!Array.isArray(value) || value.length > 200) fail();
  const seen = new Set<string>();
  for (const raw of value) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail();
    const action = raw as Record<string, unknown>;
    if (typeof action.action !== 'string' || typeof action.id !== 'string' || !UUID.test(action.id) || seen.has(action.id)) fail();
    seen.add(action.id);
    if (action.action === 'keep' || action.action === 'disable') {
      if (Object.keys(action).length !== 3 || !isPositiveVersion(action.expectedVersion)) fail();
    } else if (action.action === 'update') {
      if (Object.keys(action).length !== 6 || !isPositiveVersion(action.expectedVersion) || !isInstant(action.scheduledFor)
        || typeof action.timeZone !== 'string' || action.timeZone.length < 1 || action.timeZone.length > 100 || typeof action.enabled !== 'boolean') fail();
    } else if (action.action === 'create') {
      if (Object.keys(action).length !== 6 || typeof action.taskId !== 'string' || !UUID.test(action.taskId) || !isInstant(action.scheduledFor)
        || typeof action.timeZone !== 'string' || action.timeZone.length < 1 || action.timeZone.length > 100 || action.delivery !== 'local_device') fail();
    } else fail();
  }
}

export function validateSavedPlanWire(value: unknown): asserts value is SavedPlanWire {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail();
  const plan = value as Record<string, unknown>;
  if (!keysExactly(plan, ['id', 'workspaceId', 'localDate', 'timeZone', 'availableStart', 'availableEnd', 'explanation', 'blocks', 'version', 'createdAt', 'sourceProposalId', 'state', 'updatedAt'])
    || typeof plan.id !== 'string' || !UUID.test(plan.id) || typeof plan.workspaceId !== 'string' || !UUID.test(plan.workspaceId)
    || typeof plan.localDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(plan.localDate) || typeof plan.timeZone !== 'string' || plan.timeZone.length < 1 || plan.timeZone.length > 100
    || !isInstant(plan.availableStart) || !isInstant(plan.availableEnd) || Date.parse(plan.availableEnd) <= Date.parse(plan.availableStart)
    || (plan.explanation !== null && (typeof plan.explanation !== 'string' || plan.explanation.length < 1 || plan.explanation.length > 500))
    || !Array.isArray(plan.blocks) || plan.blocks.length < 1 || plan.blocks.length > 100 || !plan.blocks.some((block) => (block as Record<string, unknown>)?.kind === 'focus')
    || !isPositiveVersion(plan.version) || !isInstant(plan.createdAt) || !UUID.test(String(plan.sourceProposalId)) || !['active', 'archived'].includes(String(plan.state))
    || !isInstant(plan.updatedAt) || Date.parse(plan.updatedAt) < Date.parse(plan.createdAt)) fail();
  const seen = new Set<string>();
  for (const raw of plan.blocks) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail();
    validateBlock(raw as Record<string, unknown>);
    const id = (raw as Record<string, unknown>).id as string;
    if (seen.has(id)) fail();
    seen.add(id);
  }
}

export function validatePlanEditInput(value: unknown, targetId?: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail();
  const body = value as Record<string, unknown>;
  if (!keysExactly(body, ['expectedVersion', 'plan', 'taskVersions', 'reminderActions']) || !isPositiveVersion(body.expectedVersion)
    || !Array.isArray(body.taskVersions) || !Array.isArray(body.reminderActions)) fail();
  validatePlanCreate(body.plan);
  if (targetId !== undefined && body.plan.id !== targetId) fail();
  validateVersionRefs(body.taskVersions, 100, 1);
  const requiredTasks = new Set((body.plan.blocks as Record<string, unknown>[]).filter((block) => block.kind === 'focus').map((block) => block.taskId as string));
  const submittedTasks = new Set((body.taskVersions as Record<string, unknown>[]).map((row) => row.id as string));
  if (requiredTasks.size !== submittedTasks.size || [...requiredTasks].some((id) => !submittedTasks.has(id))) fail();
  validateReminderActions(body.reminderActions);
}

function validateActionBody(item: PlanReplicationItem): void {
  const body = item.body;
  if (item.command === 'plan.edit') {
    validatePlanEditInput(body, item.targetId);
  } else {
    if (!keysExactly(body, ['action', 'expectedVersion', 'reminderVersions']) || !isPositiveVersion(body.expectedVersion)
      || body.action !== item.command.slice('plan.'.length) || !Array.isArray(body.reminderVersions) || body.reminderVersions.length > 100) fail();
  }
}

export function validatePlanReplicationPush(input: unknown): { contractVersion: 2; privacyEpoch: string; items: PlanReplicationItem[] } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail();
  const value = input as Record<string, unknown>;
  let encodedLength = 0;
  try { encodedLength = new TextEncoder().encode(canonical(value)).byteLength; } catch { fail(); }
  if (!keysExactly(value, ['contractVersion', 'privacyEpoch', 'items']) || value.contractVersion !== 2 || typeof value.privacyEpoch !== 'string' || !DECIMAL.test(value.privacyEpoch)
    || value.privacyEpoch === '0' || !Array.isArray(value.items) || value.items.length < 1 || value.items.length > 25
    || encodedLength > 65_536) fail();
  const seen = new Set<string>();
  const items = value.items.map((raw) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail();
    const item = raw as Record<string, unknown>;
    if (!keysExactly(item, ['mutationId', 'command', 'targetId', 'body']) || typeof item.mutationId !== 'string' || !UUID.test(item.mutationId)
      || typeof item.targetId !== 'string' || !UUID.test(item.targetId) || !['plan.edit', 'plan.archive', 'plan.restore', 'plan.delete'].includes(String(item.command))
      || !item.body || typeof item.body !== 'object' || Array.isArray(item.body) || seen.has(item.mutationId)) fail();
    seen.add(item.mutationId);
    const typed = { mutationId: item.mutationId, command: item.command as PlanReplicationItem['command'], targetId: item.targetId, body: item.body as Record<string, unknown> };
    validateActionBody(typed);
    return typed;
  });
  return { contractVersion: 2, privacyEpoch: value.privacyEpoch, items };
}

export type PlanTransactionGroup = { transactionId: string; committedThrough: string; changeCount: number; groupDigest: string; changes: { sequence: string; entity: 'plan' | 'reminder' | 'task' | 'goal' | 'session' | 'break' | 'settings'; entityId: string; operation: 'upsert' | 'delete'; payload: unknown }[] };

export async function verifyPlanTransactionGroup(group: unknown, input: { privacyEpoch: string; afterSequence: string; highWater: string }): Promise<PlanTransactionGroup> {
  if (!DECIMAL.test(input.privacyEpoch) || !DECIMAL.test(input.afterSequence) || !DECIMAL.test(input.highWater) || BigInt(input.afterSequence) > BigInt(input.highWater)) fail();
  if (!group || typeof group !== 'object' || Array.isArray(group)) fail();
  const value = group as Record<string, unknown>;
  if (typeof value.transactionId !== 'string' || !UUID.test(value.transactionId) || typeof value.committedThrough !== 'string' || !DECIMAL.test(value.committedThrough)
    || !Array.isArray(value.changes) || value.changes.length < 1 || value.changes.length > 500 || value.changeCount !== value.changes.length || typeof value.groupDigest !== 'string' || !SHA256.test(value.groupDigest)) fail();
  const changes = value.changes as Record<string, unknown>[];
  let previous = BigInt(input.afterSequence);
  const max = BigInt(input.highWater);
  for (const change of changes) {
    if (!change || typeof change !== 'object' || typeof change.sequence !== 'string' || !DECIMAL.test(change.sequence) || BigInt(change.sequence) <= previous || BigInt(change.sequence) > max
      || typeof change.entityId !== 'string' || !UUID.test(change.entityId) || !['plan', 'reminder', 'task', 'goal', 'session', 'break', 'settings'].includes(String(change.entity))
      || !['upsert', 'delete'].includes(String(change.operation)) || (change.operation === 'delete' ? change.payload !== null : change.payload === null)) fail();
    previous = BigInt(change.sequence);
  }
  if (BigInt(value.committedThrough as string) !== previous || BigInt(value.committedThrough as string) > max) fail();
  const expected = await digest({ contractVersion: 2, privacyEpoch: input.privacyEpoch, transactionId: value.transactionId, committedThrough: value.committedThrough, changes });
  if (expected !== value.groupDigest) fail('SYNC_GROUP_DIGEST_INVALID');
  return { transactionId: value.transactionId, committedThrough: value.committedThrough as string, changeCount: changes.length, groupDigest: value.groupDigest as string, changes: changes as PlanTransactionGroup['changes'] };
}

export async function buildPlansExport(input: { exportJobId: string; snapshotAt: string; highWater: string; privacyEpoch: string; plans: SavedPlanWire[]; }): Promise<{ manifest: Record<string, unknown>; pages: Record<string, unknown>[] }> {
  if (!UUID.test(input.exportJobId) || !isInstant(input.snapshotAt) || !DECIMAL.test(input.highWater) || !DECIMAL.test(input.privacyEpoch)) fail();
  const plans = [...input.plans]; plans.forEach(validateSavedPlanWire); plans.sort((a, b) => a.id.localeCompare(b.id));
  if (new Set(plans.map((plan) => plan.id)).size !== plans.length) fail();
  const pages: Record<string, unknown>[] = [];
  const pageCount = Math.max(1, Math.ceil(plans.length / 100));
  for (let index = 0; index < pageCount; index += 1) {
    const pagePlans = plans.slice(index * 100, (index + 1) * 100);
    const preimage = { contractVersion: 2, section: 'plans', exportJobId: input.exportJobId, privacyEpoch: input.privacyEpoch, highWater: input.highWater, pageIndex: index, plans: pagePlans };
    pages.push({ pageIndex: index, plans: pagePlans, pageDigest: await digest(preimage) });
  }
  const manifestPreimage = { contractVersion: 2, section: 'plans', exportJobId: input.exportJobId, snapshotAt: input.snapshotAt, privacyEpoch: input.privacyEpoch, highWater: input.highWater, plans };
  const manifest = { contractVersion: 2, section: 'plans', exportJobId: input.exportJobId, snapshotAt: input.snapshotAt, highWater: input.highWater, privacyEpoch: input.privacyEpoch, planCount: plans.length, pageCount, manifestDigest: await digest(manifestPreimage) };
  return { manifest, pages };
}

export async function verifyPlansExport(input: { manifest: unknown; pages: unknown }): Promise<SavedPlanWire[]> {
  if (!input || !input.manifest || typeof input.manifest !== 'object' || Array.isArray(input.manifest) || !Array.isArray(input.pages)) fail();
  const manifest = input.manifest as Record<string, unknown>;
  if (!keysExactly(manifest, ['contractVersion', 'section', 'exportJobId', 'snapshotAt', 'highWater', 'privacyEpoch', 'planCount', 'pageCount', 'manifestDigest'])
    || manifest.contractVersion !== 2 || manifest.section !== 'plans' || typeof manifest.exportJobId !== 'string' || !UUID.test(manifest.exportJobId)
    || !isInstant(manifest.snapshotAt) || typeof manifest.highWater !== 'string' || !DECIMAL.test(manifest.highWater)
    || typeof manifest.privacyEpoch !== 'string' || !DECIMAL.test(manifest.privacyEpoch) || !Number.isSafeInteger(manifest.planCount) || (manifest.planCount as number) < 0
    || !Number.isSafeInteger(manifest.pageCount) || (manifest.pageCount as number) < 1 || typeof manifest.manifestDigest !== 'string' || !SHA256.test(manifest.manifestDigest)
    || input.pages.length !== manifest.pageCount) fail();
  const plans: SavedPlanWire[] = [];
  for (let index = 0; index < input.pages.length; index += 1) {
    const page = input.pages[index];
    if (!page || typeof page !== 'object' || Array.isArray(page)) fail();
    const value = page as Record<string, unknown>;
    if (!keysExactly(value, ['pageIndex', 'plans', 'pageDigest']) || value.pageIndex !== index || !Array.isArray(value.plans)
      || value.plans.length > 100 || typeof value.pageDigest !== 'string' || !SHA256.test(value.pageDigest)) fail();
    const pagePlans = value.plans as SavedPlanWire[];
    pagePlans.forEach(validateSavedPlanWire);
    const expectedPageDigest = await digest({ contractVersion: 2, section: 'plans', exportJobId: manifest.exportJobId, privacyEpoch: manifest.privacyEpoch, highWater: manifest.highWater, pageIndex: index, plans: pagePlans });
    if (expectedPageDigest !== value.pageDigest) fail('EXPORT_PAGE_DIGEST_INVALID');
    plans.push(...pagePlans);
  }
  if (plans.length !== manifest.planCount || plans.some((plan, index) => index > 0 && plans[index - 1].id.localeCompare(plan.id) >= 0)) fail();
  const expectedManifestDigest = await digest({ contractVersion: 2, section: 'plans', exportJobId: manifest.exportJobId, snapshotAt: manifest.snapshotAt, privacyEpoch: manifest.privacyEpoch, highWater: manifest.highWater, plans });
  if (expectedManifestDigest !== manifest.manifestDigest) fail('EXPORT_MANIFEST_DIGEST_INVALID');
  return plans;
}
