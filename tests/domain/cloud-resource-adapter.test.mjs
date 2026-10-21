import assert from 'node:assert/strict';
import test from 'node:test';
import { register } from 'node:module';

register('../helpers/local-database-loader.mjs', import.meta.url);

const { prepareCloudUploadIntent, createDisabledCloudResourceAdapter } = await import('../../src/features/resources/cloud-resource-adapter.ts');

const OWNER = 'owner-a';
const NOW = '2026-10-09T08:00:00.000Z';
const entitlement = { ownerId: OWNER, capability: 'cloud_resources', status: 'active', verifiedBy: 'server', policyVersion: 'test', expiresAt: '2026-10-10T08:00:00.000Z', offerId: 'test' };
const selection = { ownerId: OWNER, resourceId: 'resource-1', resourceRevision: 2, selectedAt: '2026-10-09T07:00:00.000Z', consent: 'granted' };

test('cloud upload intent requires explicit selection and server-verified access', () => {
  assert.equal(prepareCloudUploadIntent(null, entitlement, OWNER, NOW).reason, 'selection_required');
  assert.equal(prepareCloudUploadIntent(selection, null, OWNER, NOW).reason, 'entitlement_denied');
  assert.deepEqual(prepareCloudUploadIntent(selection, entitlement, OWNER, NOW), { ready: true, intent: { ownerId: OWNER, resourceId: 'resource-1', resourceRevision: 2, operationId: 'cloud-resource:owner-a:resource-1:2:2026-10-09T07:00:00.000Z' } });
});

test('foreign ownership, missing consent and future selection fail closed', () => {
  assert.equal(prepareCloudUploadIntent({ ...selection, ownerId: 'owner-b' }, entitlement, OWNER, NOW).reason, 'invalid_selection');
  assert.equal(prepareCloudUploadIntent({ ...selection, consent: 'missing' }, entitlement, OWNER, NOW).reason, 'consent_required');
  assert.equal(prepareCloudUploadIntent({ ...selection, selectedAt: '2026-10-09T09:00:00.000Z' }, entitlement, OWNER, NOW).reason, 'invalid_selection');
});

test('invalid resource identity or revision cannot create an upload intent', () => {
  assert.equal(prepareCloudUploadIntent({ ...selection, resourceId: '\u0000bad' }, entitlement, OWNER, NOW).reason, 'invalid_selection');
  assert.equal(prepareCloudUploadIntent({ ...selection, resourceRevision: 0 }, entitlement, OWNER, NOW).reason, 'invalid_selection');
});

test('disabled adapter never uploads or downloads in the local build', async () => {
  const adapter = createDisabledCloudResourceAdapter();
  await assert.rejects(adapter.upload({ ownerId: OWNER, resourceId: 'resource-1', resourceRevision: 1, operationId: 'op-1' }), /CLOUD_RESOURCES_NOT_CONFIGURED/);
  await assert.rejects(adapter.download(OWNER, 'resource-1', 1), /CLOUD_RESOURCES_NOT_CONFIGURED/);
});
