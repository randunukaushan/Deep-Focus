import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresPrivacyDownloadGrantStore } = await import('../../supabase/functions/_shared/postgres-privacy-download-grant-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const JOB = '22222222-2222-4222-8222-222222222222';
const GRANT = '33333333-3333-4333-8333-333333333333';
const OTHER_GRANT = '44444444-4444-4444-8444-444444444444';
const DIGEST = 'a'.repeat(64);
const NOW = '2026-10-11T02:00:00.000Z';
const EXPIRES = '2026-10-11T02:05:00.000Z';
const ARTIFACT_EXPIRES = '2026-10-11T03:00:00.000Z';
const AUTHENTICATED_AT = '2026-10-11T01:59:00.000Z';

function jobRow() { return { job_id: JOB, owner_id: OWNER, state: 'succeeded', artifact_locator: 'private/server-only', artifact_expires_at: ARTIFACT_EXPIRES }; }
function grantRow(overrides = {}) { return { owner_id: OWNER, grant_id: GRANT, job_id: JOB, expires_at: EXPIRES, consumed_at: null, ...overrides }; }

test('download grant requires a succeeded owned unexpired export and stores only the digest', async () => {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.privacy_jobs')) return { rows: [jobRow()] };
    return { rows: [grantRow()] };
  } }) };
  const result = await createPostgresPrivacyDownloadGrantStore({ runner }).issueExportGrant({ ownerId: OWNER, grantId: GRANT, jobId: JOB, tokenDigest: DIGEST, now: NOW, expiresAt: EXPIRES, authenticatedAt: AUTHENTICATED_AT, recentAuthMaxAgeMs: 120000 });
  assert.deepEqual(result, { ownerId: OWNER, grantId: GRANT, jobId: JOB, expiresAt: EXPIRES, consumedAt: null });
  assert.deepEqual(calls[1].params, [OWNER, GRANT, JOB, DIGEST, EXPIRES]);
  assert.doesNotMatch(JSON.stringify(result), /private\/server-only|token_digest/);
});

test('repeated grant requests replay the existing grant and never silently extend it', async () => {
  let inserts = 0;
  const runner = { withTransaction: async (run) => run({ query: async (sql) => {
    if (sql.includes('from df_private.privacy_jobs')) return { rows: [jobRow()] };
    if (sql.includes('insert into')) { inserts += 1; return { rows: [] }; }
    return { rows: [grantRow()] };
  } }) };
  const result = await createPostgresPrivacyDownloadGrantStore({ runner }).issueExportGrant({ ownerId: OWNER, grantId: OTHER_GRANT, jobId: JOB, tokenDigest: 'b'.repeat(64), now: NOW, expiresAt: '2026-10-11T02:30:00.000Z', authenticatedAt: AUTHENTICATED_AT, recentAuthMaxAgeMs: 120000 });
  assert.equal(result.grantId, GRANT);
  assert.equal(result.expiresAt, EXPIRES);
  assert.equal(inserts, 1);
});

test('download grant fails closed when the database acknowledges an already-expired created grant', async () => {
  const runner = { withTransaction: async (run) => run({ query: async (sql) => {
    if (sql.includes('from df_private.privacy_jobs')) return { rows: [jobRow()] };
    return { rows: [grantRow({ expires_at: NOW })] };
  } }) };
  await assert.rejects(() => createPostgresPrivacyDownloadGrantStore({ runner }).issueExportGrant({ ownerId: OWNER, grantId: GRANT, jobId: JOB, tokenDigest: DIGEST, now: NOW, expiresAt: EXPIRES, authenticatedAt: AUTHENTICATED_AT, recentAuthMaxAgeMs: 120000 }), /INVALID_TRANSITION/);
});

test('download grant rejects unsafe input, foreign jobs, failed jobs and expired artifacts before issuing', async () => {
  const noQuery = { withTransaction: async (run) => run({ query: async () => { throw new Error('must not query'); } }) };
  const store = createPostgresPrivacyDownloadGrantStore({ runner: noQuery });
  await assert.rejects(() => store.issueExportGrant({ ownerId: OWNER, grantId: GRANT, jobId: JOB, tokenDigest: 'bad', now: NOW, expiresAt: EXPIRES, authenticatedAt: AUTHENTICATED_AT, recentAuthMaxAgeMs: 120000 }), /VALIDATION_FAILED/);
  const foreign = { withTransaction: async (run) => run({ query: async (sql) => sql.includes('privacy_jobs') ? { rows: [{ ...jobRow(), owner_id: '55555555-5555-4555-8555-555555555555' }] } : { rows: [] } }) };
  await assert.rejects(() => createPostgresPrivacyDownloadGrantStore({ runner: foreign }).issueExportGrant({ ownerId: OWNER, grantId: GRANT, jobId: JOB, tokenDigest: DIGEST, now: NOW, expiresAt: EXPIRES, authenticatedAt: AUTHENTICATED_AT, recentAuthMaxAgeMs: 120000 }), /INVALID_TRANSITION/);
  const failed = { withTransaction: async (run) => run({ query: async (sql) => sql.includes('privacy_jobs') ? { rows: [{ ...jobRow(), state: 'failed', artifact_locator: null, artifact_expires_at: null }] } : { rows: [] } }) };
  await assert.rejects(() => createPostgresPrivacyDownloadGrantStore({ runner: failed }).issueExportGrant({ ownerId: OWNER, grantId: GRANT, jobId: JOB, tokenDigest: DIGEST, now: NOW, expiresAt: EXPIRES, authenticatedAt: AUTHENTICATED_AT, recentAuthMaxAgeMs: 120000 }), /INVALID_TRANSITION/);
});

test('download grant requires recent authentication before any database access', async () => {
  let calls = 0;
  const runner = { withTransaction: async (run) => run({ query: async () => { calls += 1; return { rows: [] }; } }) };
  await assert.rejects(() => createPostgresPrivacyDownloadGrantStore({ runner }).issueExportGrant({ ownerId: OWNER, grantId: GRANT, jobId: JOB, tokenDigest: DIGEST, now: NOW, expiresAt: EXPIRES, authenticatedAt: '2026-10-11T01:00:00.000Z', recentAuthMaxAgeMs: 120000 }), /AUTH_REQUIRED/);
  assert.equal(calls, 0);
});

test('download grant fails closed on runtime digest types and malformed result containers', async () => {
  let calls = 0;
  const noQuery = { withTransaction: async (run) => run({ query: async () => { calls += 1; return { rows: [] }; } }) };
  await assert.rejects(() => createPostgresPrivacyDownloadGrantStore({ runner: noQuery }).issueExportGrant({ ownerId: OWNER, grantId: GRANT, jobId: JOB, tokenDigest: Symbol('digest'), now: NOW, expiresAt: EXPIRES, authenticatedAt: AUTHENTICATED_AT, recentAuthMaxAgeMs: 120000 }), /VALIDATION_FAILED/);
  const malformed = { withTransaction: async (run) => run({ query: async () => ({ rows: null }) }) };
  await assert.rejects(() => createPostgresPrivacyDownloadGrantStore({ runner: malformed }).issueExportGrant({ ownerId: OWNER, grantId: GRANT, jobId: JOB, tokenDigest: DIGEST, now: NOW, expiresAt: EXPIRES, authenticatedAt: AUTHENTICATED_AT, recentAuthMaxAgeMs: 120000 }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(calls, 0);
});

test('download grant store rejects malformed runner, request and transaction client dependencies', async () => {
  assert.throws(() => createPostgresPrivacyDownloadGrantStore(null), /DEPENDENCY_UNAVAILABLE/);
  const malformedClient = createPostgresPrivacyDownloadGrantStore({ runner: { withTransaction: async (run) => run({ query: 'not-a-function' }) } });
  await assert.rejects(() => malformedClient.issueExportGrant({ ownerId: OWNER, grantId: GRANT, jobId: JOB, tokenDigest: DIGEST, now: NOW, expiresAt: EXPIRES, authenticatedAt: AUTHENTICATED_AT, recentAuthMaxAgeMs: 120000 }), /DEPENDENCY_UNAVAILABLE/);
});

test('download grant fails closed on sparse export-job rows before issuing a grant', async () => {
  const sparse = [];
  sparse[1] = jobRow();
  let grantWrite = false;
  const store = createPostgresPrivacyDownloadGrantStore({ runner: { withTransaction: async (run) => run({ query: async (sql) => {
    if (sql.includes('from df_private.privacy_jobs')) return { rows: sparse };
    grantWrite = true;
    return { rows: [] };
  } }) } });
  await assert.rejects(() => store.issueExportGrant({ ownerId: OWNER, grantId: GRANT, jobId: JOB, tokenDigest: DIGEST, now: NOW, expiresAt: EXPIRES, authenticatedAt: AUTHENTICATED_AT, recentAuthMaxAgeMs: 120000 }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(grantWrite, false);
});
