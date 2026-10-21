import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDeletionChallengeResponse, validateEmptyDeletionChallengeRequest } from '../../supabase/functions/_shared/deletion-challenge-validation.ts';

const challengeId = '55555555-5555-4555-8555-555555555555';
const jobId = '66666666-6666-4666-8666-666666666666';
const credential = 'a'.repeat(43);
const now = '2026-10-11T00:00:00.000Z';

test('deletion challenge request is an empty object', () => {
  assert.deepEqual(validateEmptyDeletionChallengeRequest({}), {});
  assert.throws(() => validateEmptyDeletionChallengeRequest({ acknowledged: true }), /must be empty/);
});

test('deletion challenge response validates bounded IDs, consequence version and receipt expiry', () => {
  const result = validateDeletionChallengeResponse({ data: { challengeId, jobId, consequencesVersion: 'v1', expiresAt: '2026-10-11T00:10:00.000Z', statusReceipt: { credential, expiresAt: '2026-10-11T00:05:00.000Z' } } }, now);
  assert.equal(result.data.jobId, jobId);
  assert.equal(result.data.statusReceipt.credential, credential);
});

test('deletion challenge rejects expired, overlong or unsafe receipt data', () => {
  const base = { challengeId, jobId, consequencesVersion: 'v1', expiresAt: '2026-10-11T00:10:00.000Z', statusReceipt: { credential, expiresAt: '2026-10-11T00:05:00.000Z' } };
  assert.throws(() => validateDeletionChallengeResponse({ data: { ...base, expiresAt: now } }, now), /expired/);
  assert.throws(() => validateDeletionChallengeResponse({ data: { ...base, statusReceipt: { credential, expiresAt: '2026-10-11T00:11:00.000Z' } } }, now), /expiry is unsafe/);
  assert.throws(() => validateDeletionChallengeResponse({ data: { ...base, statusReceipt: { credential: 'short', expiresAt: '2026-10-11T00:05:00.000Z' } } }, now), /bounded server secret/);
});
