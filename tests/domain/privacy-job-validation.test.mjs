import test from 'node:test';
import assert from 'node:assert/strict';
import { validateExportRequest, validatePrivacyJob, validatePrivacyJobResponse } from '../../supabase/functions/_shared/privacy-job-validation.ts';

const id = '33333333-3333-4333-8333-333333333333';

test('export request is restricted to the documented own-account JSON scope', () => {
  assert.deepEqual(validateExportRequest({ format: 'json', scope: 'own_account_data' }), { format: 'json', scope: 'own_account_data' });
  assert.throws(() => validateExportRequest({ format: 'json', scope: 'all_data' }), /exact approved scope/);
  assert.throws(() => validateExportRequest({ format: 'json', scope: 'own_account_data', includeLocalFiles: true }), /exact approved scope/);
});

test('privacy job response exposes only coarse export/deletion status', () => {
  const response = validatePrivacyJobResponse({ data: { id, kind: 'export', state: 'queued', updatedAt: '2026-10-11T00:00:00.000Z' } });
  assert.deepEqual(response.data, { id, kind: 'export', state: 'queued', updatedAt: '2026-10-11T00:00:00.000Z', safeErrorCode: null });
});

test('privacy job validation allows only safe error codes on failed jobs', () => {
  assert.equal(validatePrivacyJob({ id, kind: 'deletion', state: 'failed', updatedAt: '2026-10-11T00:00:00.000Z', safeErrorCode: 'DEPENDENCY_UNAVAILABLE' }).safeErrorCode, 'DEPENDENCY_UNAVAILABLE');
  assert.throws(() => validatePrivacyJob({ id, kind: 'deletion', state: 'running', updatedAt: '2026-10-11T00:00:00.000Z', safeErrorCode: 'LEAK' }), /non-failed/);
  assert.throws(() => validatePrivacyJob({ id, kind: 'deletion', state: 'failed', updatedAt: '2026-10-11T00:00:00.000Z', safeErrorCode: 'sql error' }), /allowlisted/);
});
