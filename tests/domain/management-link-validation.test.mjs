import test from 'node:test';
import assert from 'node:assert/strict';
import { validateManagementDestination, validateManagementLink, validateManagementLinkRequest, validateNoRedirectChain } from '../../supabase/functions/_shared/management-link-validation.ts';

const licenseId = '22222222-2222-4222-8222-222222222222';
const allowed = ['https://billing.example/'];

test('management-link request accepts only an owned license reference shape', () => {
  assert.deepEqual(validateManagementLinkRequest({ licenseId }), { licenseId });
  assert.throws(() => validateManagementLinkRequest({ licenseId, returnUrl: 'https://billing.example/' }), /unsupported fields/);
});

test('provider management destination requires an HTTPS allowlisted origin', () => {
  assert.equal(validateManagementDestination('https://billing.example/manage?license=1', allowed), 'https://billing.example/manage?license=1');
  assert.throws(() => validateManagementDestination('//billing.example/manage', allowed), /absolute URL/);
  assert.throws(() => validateManagementDestination('https://user:pass@billing.example/manage', allowed), /unsafe/);
  assert.throws(() => validateManagementDestination('https://billing.example:8443/manage', allowed), /unsafe/);
  assert.throws(() => validateManagementDestination('https://attacker.example/manage', allowed), /allowlist/);
});

test('management link rejects foreign provider fields and redirect chains', () => {
  const link = validateManagementLink({ licenseId, providerSource: 'web_provider', url: 'https://billing.example/manage', expiresAt: '2026-10-11T00:00:00.000Z' }, allowed);
  assert.equal(link.licenseId, licenseId);
  assert.throws(() => validateManagementLink({ licenseId, providerSource: 'unknown', url: 'https://billing.example/manage', expiresAt: '2026-10-11T00:00:00.000Z' }, allowed), /providerSource/);
  assert.throws(() => validateNoRedirectChain(['https://attacker.example']), /redirect chains/);
  validateNoRedirectChain([]);
});
