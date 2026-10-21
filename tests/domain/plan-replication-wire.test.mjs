import assert from 'node:assert/strict';
import test from 'node:test';

const { buildPlansExport, validatePlanReplicationPush, validateSavedPlanWire, verifyPlanTransactionGroup, verifyPlansExport } = await import('../../supabase/functions/_shared/plan-replication-wire.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const PLAN = '22222222-2222-4222-8222-222222222222';
const WORKSPACE = '33333333-3333-4333-8333-333333333333';
const PROPOSAL = '44444444-4444-4444-8444-444444444444';
const TASK = '55555555-5555-4555-8555-555555555555';
const FOCUS = '66666666-6666-4666-8666-666666666666';
const BREAK = '77777777-7777-4777-8777-777777777777';
const MUTATION = '88888888-8888-4888-8888-888888888888';
const NOW = '2026-10-11T00:00:00.000Z';

const plan = (id = PLAN) => ({ id, workspaceId: WORKSPACE, localDate: '2026-10-11', timeZone: 'Asia/Colombo', availableStart: NOW, availableEnd: '2026-10-11T02:00:00.000Z', explanation: null, blocks: [
  { id: FOCUS, kind: 'focus', taskId: TASK, startsAt: '2026-10-11T00:10:00.000Z', endsAt: '2026-10-11T00:35:00.000Z', reminderId: null },
  { id: BREAK, kind: 'break', afterBlockId: FOCUS, startsAt: '2026-10-11T00:35:00.000Z', endsAt: '2026-10-11T00:40:00.000Z' },
], version: 1, createdAt: NOW, sourceProposalId: PROPOSAL, state: 'active', updatedAt: NOW });
const editPlan = (id = PLAN) => { const { version, createdAt, sourceProposalId, state, updatedAt, ...value } = plan(id); return value; };

function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`).join(',')}}`;
}

async function sha(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(value)));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

test('SavedPlan wire validation keeps canonical blocks and rejects duplicate IDs', () => {
  assert.doesNotThrow(() => validateSavedPlanWire(plan()));
  assert.throws(() => validateSavedPlanWire({ ...plan(), blocks: [plan().blocks[0], plan().blocks[0]] }), /VALIDATION_FAILED/);
  assert.throws(() => validateSavedPlanWire({ ...plan(), state: 'completed' }), /VALIDATION_FAILED/);
});

test('plan replication push admits only versioned edit and lifecycle commands', () => {
  const accepted = validatePlanReplicationPush({ contractVersion: 2, privacyEpoch: '4', items: [{ mutationId: MUTATION, command: 'plan.edit', targetId: PLAN, body: { expectedVersion: 1, plan: editPlan(), taskVersions: [{ id: TASK, expectedVersion: 1 }], reminderActions: [] } }] });
  assert.equal(accepted.items[0].command, 'plan.edit');
  assert.throws(() => validatePlanReplicationPush({ contractVersion: 2, privacyEpoch: '4', items: [{ mutationId: MUTATION, command: 'plan.edit', targetId: PLAN, body: { expectedVersion: 1, plan: plan(), taskVersions: [{ id: TASK, expectedVersion: 1 }], reminderActions: [] } }] }), /VALIDATION_FAILED/);
  assert.throws(() => validatePlanReplicationPush({ contractVersion: 2, privacyEpoch: '4', items: [{ mutationId: MUTATION, command: 'plan.edit', targetId: PLAN, body: { expectedVersion: 1, plan: editPlan(), taskVersions: [{ id: TASK, expectedVersion: 1 }, { id: TASK, expectedVersion: 2 }], reminderActions: [] } }] }), /VALIDATION_FAILED/);
  assert.throws(() => validatePlanReplicationPush({ contractVersion: 2, privacyEpoch: '4', items: [{ mutationId: MUTATION, command: 'plan.edit', targetId: PLAN, body: { expectedVersion: 1, plan: editPlan(), taskVersions: [{ id: OWNER, expectedVersion: 1 }], reminderActions: [] } }] }), /VALIDATION_FAILED/);
  assert.throws(() => validatePlanReplicationPush({ contractVersion: 2, privacyEpoch: '4', items: [{ mutationId: MUTATION, command: 'plan.edit', targetId: PLAN, body: { expectedVersion: 1, plan: editPlan(), taskVersions: [{ id: TASK, expectedVersion: 1 }], reminderActions: [{ action: 'create', id: FOCUS, taskId: TASK, scheduledFor: NOW, timeZone: 'Asia/Colombo', delivery: 'remote' }] } }] }), /VALIDATION_FAILED/);
  for (const command of ['plan.create', 'plan.edit']) {
    const item = { mutationId: MUTATION, command, targetId: PLAN, body: command === 'plan.create' ? {} : { expectedVersion: 1, plan: editPlan(), taskVersions: [{ id: TASK, expectedVersion: 1 }], reminderActions: [] } };
    if (command === 'plan.create') assert.throws(() => validatePlanReplicationPush({ contractVersion: 2, privacyEpoch: '1', items: [item] }), /VALIDATION_FAILED/);
  }
  assert.throws(() => validatePlanReplicationPush({ contractVersion: 2, privacyEpoch: '1', items: [{ mutationId: MUTATION, command: 'plan.archive', targetId: PLAN, body: { action: 'restore', expectedVersion: 1, reminderVersions: [] } }] }), /VALIDATION_FAILED/);
});

test('replication push rejects duplicate item IDs and plan target mismatch before execution', () => {
  const item = { mutationId: MUTATION, command: 'plan.edit', targetId: PLAN, body: { expectedVersion: 1, plan: editPlan(), taskVersions: [{ id: TASK, expectedVersion: 1 }], reminderActions: [] } };
  assert.throws(() => validatePlanReplicationPush({ contractVersion: 2, privacyEpoch: '1', items: [item, item] }), /VALIDATION_FAILED/);
  assert.throws(() => validatePlanReplicationPush({ contractVersion: 2, privacyEpoch: '1', items: [{ ...item, targetId: OWNER }] }), /VALIDATION_FAILED/);
});

test('transaction groups verify ordered boundaries, deletion payloads and JCS digest', async () => {
  const changes = [{ sequence: '8', entity: 'plan', entityId: PLAN, operation: 'upsert', payload: plan() }, { sequence: '9', entity: 'reminder', entityId: TASK, operation: 'delete', payload: null }];
  const base = { contractVersion: 2, privacyEpoch: '3', transactionId: OWNER, committedThrough: '9', changes };
  const group = { ...base, changeCount: 2, groupDigest: await sha(base) };
  assert.equal((await verifyPlanTransactionGroup(group, { privacyEpoch: '3', afterSequence: '7', highWater: '10' })).committedThrough, '9');
  await assert.rejects(() => verifyPlanTransactionGroup({ ...group, groupDigest: '0'.repeat(64) }, { privacyEpoch: '3', afterSequence: '7', highWater: '10' }), /SYNC_GROUP_DIGEST_INVALID/);
  await assert.rejects(() => verifyPlanTransactionGroup({ ...group, changes: [{ ...changes[1], sequence: '8' }] }, { privacyEpoch: '3', afterSequence: '7', highWater: '10' }), /VALIDATION_FAILED/);
  const nonFiniteChanges = [{ ...changes[0], payload: { title: Number.NaN } }];
  const nonFiniteBase = { contractVersion: 2, privacyEpoch: '3', transactionId: OWNER, committedThrough: '8', changes: nonFiniteChanges };
  const nonFiniteDigest = await sha(nonFiniteBase);
  await assert.rejects(() => verifyPlanTransactionGroup({ ...nonFiniteBase, changeCount: 1, groupDigest: nonFiniteDigest }, { privacyEpoch: '3', afterSequence: '7', highWater: '10' }), /VALIDATION_FAILED/);
});

test('transaction group digest rejects sparse, symbol-bearing, and custom-prototype payloads', async () => {
  const sparse = []; sparse[1] = 'gap';
  const symbolBearing = []; symbolBearing.push('value'); symbolBearing[Symbol('metadata')] = 'hidden';
  class CustomPayload { constructor() { this.value = 'hidden-shape'; } }
  for (const payload of [{ values: sparse }, { values: symbolBearing }, { values: new CustomPayload() }]) {
    const changes = [{ sequence: '8', entity: 'plan', entityId: PLAN, operation: 'upsert', payload }];
    const base = { contractVersion: 2, privacyEpoch: '3', transactionId: OWNER, committedThrough: '8', changes };
    const group = { ...base, changeCount: 1, groupDigest: await sha(base) };
    await assert.rejects(() => verifyPlanTransactionGroup(group, { privacyEpoch: '3', afterSequence: '7', highWater: '10' }), /VALIDATION_FAILED/);
  }
});

test('plans export sorts UUIDs, paginates at 100 and creates a zero-plan page', async () => {
  const second = plan('99999999-9999-4999-8999-999999999999');
  const result = await buildPlansExport({ exportJobId: OWNER, snapshotAt: NOW, highWater: '20', privacyEpoch: '2', plans: [second, plan()] });
  assert.equal(result.manifest.planCount, 2);
  assert.equal(result.manifest.pageCount, 1);
  assert.equal(result.pages[0].plans[0].id, PLAN);
  const many = Array.from({ length: 101 }, (_, index) => plan(`00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`));
  const paged = await buildPlansExport({ exportJobId: OWNER, snapshotAt: NOW, highWater: '20', privacyEpoch: '2', plans: many });
  assert.equal(paged.manifest.pageCount, 2);
  assert.equal(paged.pages[0].plans.length, 100);
  assert.equal(paged.pages[1].plans.length, 1);
  const empty = await buildPlansExport({ exportJobId: OWNER, snapshotAt: NOW, highWater: '20', privacyEpoch: '2', plans: [] });
  assert.deepEqual(empty.pages[0].plans, []);
  assert.equal(empty.manifest.pageCount, 1);
});

test('plans export restore verifies pages, manifest and content integrity', async () => {
  const exported = await buildPlansExport({ exportJobId: OWNER, snapshotAt: NOW, highWater: '20', privacyEpoch: '2', plans: [plan()] });
  const restored = await verifyPlansExport(exported);
  assert.equal(restored[0].id, PLAN);
  const tamperedPage = { ...exported.pages[0], plans: [{ ...exported.pages[0].plans[0], state: 'archived' }] };
  await assert.rejects(() => verifyPlansExport({ manifest: exported.manifest, pages: [tamperedPage] }), /EXPORT_PAGE_DIGEST_INVALID/);
  await assert.rejects(() => verifyPlansExport({ manifest: { ...exported.manifest, planCount: 2 }, pages: exported.pages }), /VALIDATION_FAILED/);
});
