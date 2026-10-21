import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEmptyDownloadRequest, validateExportDownloadResponse } from '../../supabase/functions/_shared/export-download-validation.ts';

const jobId = '44444444-4444-4444-8444-444444444444';
const now = '2026-10-11T00:00:00.000Z';
const allowed = ['https://artifacts.example/'];

test('download-token request accepts only the documented empty body', () => {
  assert.deepEqual(validateEmptyDownloadRequest({}), {});
  assert.throws(() => validateEmptyDownloadRequest({ refresh: true }), /must be empty/);
});

test('download response requires a future HTTPS URL on the artifact allowlist', () => {
  const result = validateExportDownloadResponse({ data: { jobId, url: 'https://artifacts.example/private/export.json?sig=opaque', expiresAt: '2026-10-11T00:05:00.000Z' } }, allowed, now);
  assert.equal(result.data.jobId, jobId);
  assert.throws(() => validateExportDownloadResponse({ data: { jobId, url: 'https://attacker.example/export.json', expiresAt: '2026-10-11T00:05:00.000Z' } }, allowed, now), /artifact allowlist/);
  assert.throws(() => validateExportDownloadResponse({ data: { jobId, url: 'https://artifacts.example/export.json', expiresAt: now } }, allowed, now), /expired/);
});

test('download response rejects credentials, ports, fragments and extra fields', () => {
  const base = { jobId, expiresAt: '2026-10-11T00:05:00.000Z' };
  assert.throws(() => validateExportDownloadResponse({ data: { ...base, url: 'https://user:pass@artifacts.example/export.json' } }, allowed, now), /unsafe/);
  assert.throws(() => validateExportDownloadResponse({ data: { ...base, url: 'https://artifacts.example:8443/export.json' } }, allowed, now), /unsafe/);
  assert.throws(() => validateExportDownloadResponse({ data: { ...base, url: 'https://artifacts.example/export.json#fragment' } }, allowed, now), /unsafe/);
  assert.throws(() => validateExportDownloadResponse({ data: { ...base, url: 'https://artifacts.example/export.json', secret: 'raw' } }, allowed, now), /unsupported fields/);
});
