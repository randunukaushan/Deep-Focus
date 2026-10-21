import assert from 'node:assert/strict';
import test from 'node:test';

const { planSyncSnapshotRetention } = await import('../../supabase/functions/_shared/sync-snapshot-retention-plan.ts');
const OWNER = '11111111-1111-4111-8111-111111111111';
const ONE = '22222222-2222-4222-8222-222222222222';
const TWO = '33333333-3333-4333-8333-333333333333';
const NOW = '2026-10-11T02:00:00.000Z';

test('retention planner returns only expired owner-bound actions and performs no writes', () => {
  assert.deepEqual(planSyncSnapshotRetention({ ownerId: OWNER, now: NOW, candidates: [
    { ownerId: OWNER, snapshotId: ONE, status: 'ready', expiresAt: '2026-10-11T01:00:00.000Z' },
    { ownerId: OWNER, snapshotId: TWO, status: 'expired', expiresAt: '2026-10-11T01:30:00.000Z' },
    { ownerId: OWNER, snapshotId: '44444444-4444-4444-8444-444444444444', status: 'building', expiresAt: '2026-10-11T03:00:00.000Z' },
  ] }), [
    { ownerId: OWNER, snapshotId: ONE, action: 'mark_expired', reason: 'expired' },
    { ownerId: OWNER, snapshotId: TWO, action: 'delete_expired', reason: 'expired' },
  ]);
});

test('retention planner rejects foreign, duplicate, malformed and oversized candidates', () => {
  const base = { ownerId: OWNER, snapshotId: ONE, status: 'ready', expiresAt: NOW };
  assert.throws(() => planSyncSnapshotRetention({ ownerId: OWNER, now: NOW, candidates: [{ ...base, ownerId: '55555555-5555-4555-8555-555555555555' }] }), /VALIDATION_FAILED/);
  assert.throws(() => planSyncSnapshotRetention({ ownerId: OWNER, now: NOW, candidates: [base, base] }), /VALIDATION_FAILED/);
  assert.throws(() => planSyncSnapshotRetention({ ownerId: OWNER, now: NOW, candidates: [{ ...base, status: 'unknown' }] }), /VALIDATION_FAILED/);
  assert.throws(() => planSyncSnapshotRetention({ ownerId: OWNER, now: NOW, maxItems: 1, candidates: [base, { ...base, snapshotId: TWO }] }), /VALIDATION_FAILED/);
});
