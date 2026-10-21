import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDeletionConfirmationRequest } from '../../supabase/functions/_shared/deletion-confirmation-validation.ts';

const challengeId = '77777777-7777-4777-8777-777777777777';

test('deletion confirmation accepts only the exact challenge and consequences version fields', () => {
  assert.deepEqual(validateDeletionConfirmationRequest({ challengeId, acknowledgedConsequencesVersion: 'v1' }), { challengeId, acknowledgedConsequencesVersion: 'v1' });
  assert.throws(() => validateDeletionConfirmationRequest({ challengeId, acknowledgedConsequencesVersion: 'v1', jobId: challengeId }), /unsupported fields/);
});

test('deletion confirmation rejects foreign-shaped IDs and blank versions', () => {
  assert.throws(() => validateDeletionConfirmationRequest({ challengeId: 'not-an-id', acknowledgedConsequencesVersion: 'v1' }), /UUID/);
  assert.throws(() => validateDeletionConfirmationRequest({ challengeId, acknowledgedConsequencesVersion: '' }), /acknowledgedConsequencesVersion is invalid/);
  assert.throws(() => validateDeletionConfirmationRequest({ challengeId, acknowledgedConsequencesVersion: 'x'.repeat(65) }), /acknowledgedConsequencesVersion is invalid/);
});
