import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresPrivacyJobStore } = await import('../../supabase/functions/_shared/postgres-privacy-job-adapter.ts');

const OWNER = '99999999-9999-4999-8999-999999999999';
const JOB = '88888888-8888-4888-8888-888888888888';
const OP = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const WORKER = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const NOW = '2026-10-11T01:00:00.000Z';
const LEASE = '2026-10-11T01:05:00.000Z';

function row(overrides = {}) {
  return { job_id: JOB, owner_id: OWNER, operation_id: OP, kind: 'export', state: 'queued', lease_owner: null, fencing_version: 0, lease_expires_at: null, attempt_count: 0, next_attempt_at: '2026-10-11T00:00:00.000Z', safe_error_code: null, artifact_locator: null, artifact_expires_at: null, ...overrides };
}

function harness(initial = row(), returned = null) {
  const calls = [];
  let stored = { ...initial };
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('for update')) return { rows: [stored] };
    if (sql.includes('returning')) {
      if (sql.includes("state = 'succeeded'")) stored = { ...stored, state: 'succeeded', lease_owner: null, lease_expires_at: null, safe_error_code: null, artifact_locator: params[2], artifact_expires_at: params[3] };
      else if (sql.includes('fencing_version = $6')) stored = { ...stored, state: params[2], lease_owner: params[3], lease_expires_at: params[4], fencing_version: params[5], attempt_count: params[6], safe_error_code: params[7] };
      else stored = { ...stored, state: params[2], lease_owner: null, lease_expires_at: null, next_attempt_at: params[3], safe_error_code: params[4], artifact_locator: null, artifact_expires_at: null };
      return { rows: [returned ?? stored] };
    }
    if (sql.includes("state = 'queued'")) return { rows: [stored] };
    return { rows: [] };
  } };
  return { calls, runner: { withTransaction: async (run) => run(client) } };
}

test('privacy adapter claims owner-bound rows with a fenced lease', async () => {
  const h = harness();
  const result = await createPostgresPrivacyJobStore({ runner: h.runner }).claim({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 });
  assert.equal(result.state, 'running');
  assert.equal(result.leaseOwner, WORKER);
  assert.match(h.calls[0].sql, /where owner_id = \$1 and job_id = \$2 for update/i);
  assert.match(h.calls[1].sql, /fencing_version = \$6/i);
});

test('privacy adapter normalizes PostgreSQL bigint fencing versions', async () => {
  const h = harness(row({ fencing_version: '0' }));
  const result = await createPostgresPrivacyJobStore({ runner: h.runner }).claim({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 });
  assert.equal(result.fencingVersion, 1);
});

test('privacy adapter enqueues one owner-bound export job and replays the same operation', async () => {
  const calls = [];
  const createdRow = row({ state: 'queued', operation_id: OP, next_attempt_at: NOW });
  let insertCount = 0;
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('insert into df_private.privacy_jobs')) {
      insertCount += 1;
      return insertCount === 1 ? { rows: [createdRow] } : { rows: [] };
    }
    if (sql.includes('where owner_id = $1 and operation_id = $2')) return { rows: [createdRow] };
    return { rows: [] };
  } }) };
  const store = createPostgresPrivacyJobStore({ runner });
  const first = await store.enqueueExport({ ownerId: OWNER, jobId: JOB, operationId: OP, now: NOW });
  const replay = await store.enqueueExport({ ownerId: OWNER, jobId: '77777777-7777-4777-8777-777777777777', operationId: OP, now: NOW });
  assert.equal(first.jobId, JOB);
  assert.equal(replay.jobId, JOB);
  assert.equal(insertCount, 2);
  assert.deepEqual(calls[0].params, [JOB, OWNER, OP, NOW]);
  assert.deepEqual(calls[2].params, [OWNER, OP]);
});

test('privacy adapter rejects unsafe enqueue input before writing and does not reveal another owner operation', async () => {
  let calls = 0;
  const runner = { withTransaction: async (run) => run({ query: async () => { calls += 1; return { rows: [] }; } }) };
  const store = createPostgresPrivacyJobStore({ runner });
  await assert.rejects(() => store.enqueueExport({ ownerId: 'bad', jobId: JOB, operationId: OP, now: NOW }), /VALIDATION_FAILED/);
  await assert.rejects(() => store.enqueueExport({ ownerId: OWNER, jobId: JOB, operationId: 'bad', now: NOW }), /VALIDATION_FAILED/);
  assert.equal(calls, 0);
  const foreignRunner = { withTransaction: async (run) => run({ query: async (sql) => sql.includes('insert into') ? { rows: [] } : { rows: [{ ...row(), owner_id: '44444444-4444-4444-8444-444444444444' }] } }) };
  await assert.rejects(() => createPostgresPrivacyJobStore({ runner: foreignRunner }).enqueueExport({ ownerId: OWNER, jobId: JOB, operationId: OP, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
});

test('privacy adapter polls only bounded queued or expired-running rows in stable order', async () => {
  const h = harness();
  const jobs = await createPostgresPrivacyJobStore({ runner: h.runner }).listDue({ now: NOW, limit: 10 });
  assert.equal(jobs.length, 1);
  assert.match(h.calls[0].sql, /state = 'queued'.*state = 'running'/s);
  assert.match(h.calls[0].sql, /order by next_attempt_at asc, job_id asc limit 10/i);
});

test('privacy adapter rejects unsafe owner or polling bounds before SQL', async () => {
  const h = harness();
  await assert.rejects(() => createPostgresPrivacyJobStore({ runner: h.runner }).claim({ ownerId: 'bad', jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 }), /VALIDATION_FAILED/);
  await assert.rejects(() => createPostgresPrivacyJobStore({ runner: h.runner }).listDue({ now: NOW, limit: 0 }), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('privacy adapter fails closed on malformed returned ownership or lease metadata', async () => {
  const malformed = harness(row({ owner_id: 'bad' }));
  await assert.rejects(() => createPostgresPrivacyJobStore({ runner: malformed.runner }).claim({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
  const foreign = harness(row({ state: 'running', lease_owner: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', lease_expires_at: LEASE }));
  await assert.rejects(() => createPostgresPrivacyJobStore({ runner: foreign.runner }).complete({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, artifactLocator: 'private/key', artifactExpiresAt: '2026-10-11T01:10:00.000Z' }), /VALIDATION_FAILED/);
  const partial = harness(row({ lease_owner: WORKER, lease_expires_at: null }));
  await assert.rejects(() => createPostgresPrivacyJobStore({ runner: partial.runner }).claim({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
});

test('privacy adapter keeps completion and failure owner/lease predicates', async () => {
  const complete = harness(row({ state: 'running', lease_owner: WORKER, lease_expires_at: LEASE, attempt_count: 1 }));
  await createPostgresPrivacyJobStore({ runner: complete.runner }).complete({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, artifactLocator: 'private/key', artifactExpiresAt: '2026-10-11T01:10:00.000Z' });
  assert.match(complete.calls[1].sql, /where owner_id = \$1 and job_id = \$2 and state = 'running' and lease_owner = \$5 and fencing_version = \$6/i);
  const failed = harness(row({ state: 'running', lease_owner: WORKER, lease_expires_at: LEASE, attempt_count: 1 }));
  const result = await createPostgresPrivacyJobStore({ runner: failed.runner }).fail({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, retryAt: '2026-10-11T01:10:00.000Z', safeErrorCode: 'DEPENDENCY_UNAVAILABLE', maxAttempts: 3 });
  assert.equal(result.state, 'queued');
  assert.match(failed.calls[1].sql, /and lease_owner = \$6 and fencing_version = \$7/i);
});

test('privacy adapter rejects a foreign row returned after a claimed owner update', async () => {
  const h = harness(row(), row({ owner_id: '44444444-4444-4444-8444-444444444444' }));
  await assert.rejects(() => createPostgresPrivacyJobStore({ runner: h.runner }).claim({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
});

test('privacy adapter rejects a returned row with a different operation identity', async () => {
  const h = harness(row(), row({ operation_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd' }));
  await assert.rejects(() => createPostgresPrivacyJobStore({ runner: h.runner }).claim({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
});

test('privacy adapter fails closed on malformed or ambiguous database result containers', async () => {
  const malformed = { runner: { withTransaction: async (run) => run({ query: async () => ({ rows: null }) }) } };
  const store = createPostgresPrivacyJobStore(malformed);
  await assert.rejects(() => store.listDue({ now: NOW, limit: 10 }), /DEPENDENCY_UNAVAILABLE/);
  await assert.rejects(() => store.claim({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);

  const duplicate = harness();
  const base = duplicate.runner;
  duplicate.runner = { withTransaction: async (run) => base.withTransaction(async (client) => run({ query: async (sql, params) => {
    const result = await client.query(sql, params);
    if (sql.includes('for update')) result.rows = [result.rows[0], result.rows[0]];
    return result;
  } })) };
  await assert.rejects(() => createPostgresPrivacyJobStore({ runner: duplicate.runner }).claim({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
});

test('privacy adapter rejects malformed runner and transaction client dependencies', async () => {
  assert.throws(() => createPostgresPrivacyJobStore(null), /DEPENDENCY_UNAVAILABLE/);
  const store = createPostgresPrivacyJobStore({ runner: { withTransaction: async (run) => run({ query: 'not-a-function' }) } });
  await assert.rejects(() => store.listDue({ now: NOW, limit: 10 }), /DEPENDENCY_UNAVAILABLE/);
});

test('privacy adapter fails closed on sparse due-job rows before returning work', async () => {
  const sparse = [];
  sparse[1] = row();
  const store = createPostgresPrivacyJobStore({ runner: { withTransaction: async (run) => run({ query: async (sql) => {
    if (sql.includes("state = 'queued'")) return { rows: sparse };
    return { rows: [] };
  } }) } });
  await assert.rejects(() => store.listDue({ now: NOW, limit: 10 }), /DEPENDENCY_UNAVAILABLE/);
});
