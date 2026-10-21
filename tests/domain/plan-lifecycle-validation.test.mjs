import assert from 'node:assert/strict';
import test from 'node:test';

const { decidePlanLifecycle, normalizePlanLifecycleInput } = await import('../../supabase/functions/_shared/plan-lifecycle-validation.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const PLAN = '22222222-2222-4222-8222-222222222222';
const REMINDER = '33333333-3333-4333-8333-333333333333';
const plan = (state = 'active', version = 2) => ({ id: PLAN, ownerId: OWNER, state, version });

test('lifecycle input is exact, bounded and duplicate-safe', () => {
  assert.deepEqual(normalizePlanLifecycleInput({ action: 'archive', expectedVersion: 2, reminderVersions: [{ id: REMINDER, expectedVersion: 4 }] }), { action: 'archive', expectedVersion: 2, reminderVersions: [{ id: REMINDER, expectedVersion: 4 }] });
  assert.throws(() => normalizePlanLifecycleInput({ action: 'archive', expectedVersion: 2, reminderVersions: [{ id: REMINDER, expectedVersion: 4 }, { id: REMINDER, expectedVersion: 4 }] }), /VALIDATION_FAILED/);
  assert.throws(() => normalizePlanLifecycleInput({ action: 'delete', expectedVersion: 2, reminderVersions: [], ownerId: OWNER }), /VALIDATION_FAILED/);
});

test('archive requires the exact current reminder set and disables it once', () => {
  const result = decidePlanLifecycle({ plan: plan(), command: { action: 'archive', expectedVersion: 2, reminderVersions: [{ id: REMINDER, expectedVersion: 4 }] }, boundReminderVersions: [{ id: REMINDER, version: 4 }] });
  assert.deepEqual(result, { action: 'archive', planId: PLAN, previousVersion: 2, nextVersion: 3, nextState: 'archived', remindersToDisable: [{ id: REMINDER, expectedVersion: 4 }] });
  assert.throws(() => decidePlanLifecycle({ plan: plan(), command: { action: 'archive', expectedVersion: 2, reminderVersions: [] }, boundReminderVersions: [{ id: REMINDER, version: 4 }] }), /VALIDATION_FAILED/);
});

test('restore is the only transition with an empty reminder action set', () => {
  assert.equal(decidePlanLifecycle({ plan: plan('archived'), command: { action: 'restore', expectedVersion: 2, reminderVersions: [] }, boundReminderVersions: [] }).nextState, 'active');
  assert.throws(() => decidePlanLifecycle({ plan: plan('active'), command: { action: 'restore', expectedVersion: 2, reminderVersions: [] }, boundReminderVersions: [] }), /INVALID_TRANSITION/);
});

test('stale and deleted plans fail before any mutation decision', () => {
  assert.throws(() => decidePlanLifecycle({ plan: plan(), command: { action: 'archive', expectedVersion: 1, reminderVersions: [] }, boundReminderVersions: [] }), /VERSION_CONFLICT/);
  assert.throws(() => decidePlanLifecycle({ plan: plan('deleted'), command: { action: 'delete', expectedVersion: 2, reminderVersions: [] }, boundReminderVersions: [] }), /ENTITY_DELETED/);
});

test('delete returns a tombstone transition and never a resurrectable next version', () => {
  const result = decidePlanLifecycle({ plan: plan('archived'), command: { action: 'delete', expectedVersion: 2, reminderVersions: [{ id: REMINDER, expectedVersion: 4 }] }, boundReminderVersions: [{ id: REMINDER, version: 4 }] });
  assert.equal(result.nextState, 'deleted');
  assert.equal(result.nextVersion, null);
  assert.equal(result.remindersToDisable[0].id, REMINDER);
});
