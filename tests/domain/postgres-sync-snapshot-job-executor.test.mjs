import assert from 'node:assert/strict';
import test from 'node:test';

const { runPostgresSyncSnapshotJob } = await import('../../supabase/functions/_shared/postgres-sync-snapshot-job-executor.ts');
const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const JOB = '33333333-3333-4333-8333-333333333333';
const WORKER = '44444444-4444-4444-8444-444444444444';
const SNAPSHOT = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-10-11T02:00:00.000Z';
const LEASE = '2026-10-11T02:05:00.000Z';
const EXPIRES = '2026-10-11T03:00:00.000Z';
const SECRET = 'snapshot-secret-that-is-long-enough-123456';
const DIGEST = 'a'.repeat(64);

function job(state = 'running') {
  return { ownerId: OWNER, jobId: JOB, snapshotId: SNAPSHOT, state, leaseOwner: state === 'running' ? WORKER : null, fencingVersion: 1, leaseExpiresAt: state === 'running' ? LEASE : null, attemptCount: 1, nextAttemptAt: NOW, safeErrorCode: null };
}

test('executor composes worker store and materializer without running an unclaimed job', async () => {
  let calls = 0;
  const runner = { withTransaction: async (run) => run({ query: async () => { calls += 1; return { rows: [] }; } }) };
  const result = await runPostgresSyncSnapshotJob({ runner, ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3, sessionId: SESSION, createdAt: NOW, expiresAt: EXPIRES, cursorSecret: SECRET, digestPage: async () => DIGEST, digestManifest: async () => DIGEST });
  assert.equal(result, null);
  assert.equal(calls, 1);
});

test('executor rejects missing scheduler session before any database transaction', async () => {
  let transactions = 0;
  const runner = { withTransaction: async () => { transactions += 1; throw new Error('must not run'); } };
  try {
    await runPostgresSyncSnapshotJob({ runner, ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3, sessionId: 'bad', createdAt: NOW, expiresAt: EXPIRES, cursorSecret: SECRET, digestPage: async () => DIGEST, digestManifest: async () => DIGEST });
    assert.fail('expected validation failure');
  } catch (error) {
    assert.equal(error.code, 'VALIDATION_FAILED');
  }
  assert.equal(transactions, 0);
});
