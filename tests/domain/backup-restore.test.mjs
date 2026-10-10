import assert from 'node:assert/strict';
import test from 'node:test';

const { computeBackupPayloadSha256, createBackupArtifact, decideBackupRestore, restoreBackupAtomically, validateBackupManifest } = await import('../../supabase/functions/_shared/backup-restore.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SHA = 'a'.repeat(64);
const manifest = { version: 1, ownerId: OWNER, schemaVersion: 2, createdAt: '2026-10-10T00:00:00.000Z', recordCount: 3, payloadSha256: SHA };
const records = [
  { kind: 'profile', id: '31111111-1111-4111-8111-111111111111', ownerId: OWNER, data: { displayName: 'A' } },
  { kind: 'workspace', id: '32222222-2222-4222-8222-222222222222', ownerId: OWNER, data: { kind: 'personal' } },
  { kind: 'goal', id: '33333333-3333-4333-8333-333333333333', ownerId: OWNER, data: { title: 'Study' } },
];
const recordsSha = await computeBackupPayloadSha256(records);
const recordsManifest = { ...manifest, payloadSha256: recordsSha };

test('backup manifest validates bounded ownership, schema and digest metadata', () => {
  assert.equal(validateBackupManifest(manifest), true);
  assert.equal(validateBackupManifest({ ...manifest, recordCount: -1 }), false);
  assert.equal(validateBackupManifest({ ...manifest, payloadSha256: 'short' }), false);
  assert.equal(validateBackupManifest({ ...manifest, ownerId: 'foreign' }), false);
});

test('restore admits matching empty target only after ownership and digest checks', () => {
  assert.deepEqual(decideBackupRestore({ manifest, verifiedOwnerId: OWNER, currentSchemaVersion: 3, computedPayloadSha256: SHA, targetHasData: false }), { allowed: true, ownerId: OWNER, schemaVersion: 2 });
});

test('restore rejects foreign, future, mismatched and non-empty targets', () => {
  assert.equal(decideBackupRestore({ manifest, verifiedOwnerId: '22222222-2222-4222-8222-222222222222', currentSchemaVersion: 3, computedPayloadSha256: SHA, targetHasData: false }).reason, 'owner_mismatch');
  assert.equal(decideBackupRestore({ manifest: { ...manifest, schemaVersion: 4 }, verifiedOwnerId: OWNER, currentSchemaVersion: 3, computedPayloadSha256: SHA, targetHasData: false }).reason, 'future_schema');
  assert.equal(decideBackupRestore({ manifest, verifiedOwnerId: OWNER, currentSchemaVersion: 3, computedPayloadSha256: 'b'.repeat(64), targetHasData: false }).reason, 'payload_mismatch');
  assert.equal(decideBackupRestore({ manifest, verifiedOwnerId: OWNER, currentSchemaVersion: 3, computedPayloadSha256: SHA, targetHasData: true }).reason, 'overwrite_requires_confirmation');
});

test('restore admission never performs destructive work', () => {
  const result = decideBackupRestore({ manifest, verifiedOwnerId: OWNER, currentSchemaVersion: 3, computedPayloadSha256: SHA, targetHasData: true });
  assert.equal(result.allowed, false);
});

test('atomic restore validates all records before one transaction callback', async () => {
  let calls = 0;
  const result = await restoreBackupAtomically({
    manifest: recordsManifest, verifiedOwnerId: OWNER, currentSchemaVersion: 3, targetHasData: false,
    payload: records, computedPayloadSha256: recordsSha,
    transaction: async (received) => { calls += 1; assert.deepEqual(received, records); },
  });
  assert.deepEqual(result, { restored: 3, ownerId: OWNER, schemaVersion: 2 });
  assert.equal(calls, 1);
});

test('atomic restore rejects foreign and duplicate records before writing', async () => {
  let calls = 0;
  const foreignPayload = [...records.slice(0, 2), { ...records[2], ownerId: '44444444-4444-4444-8444-444444444444' }];
  const duplicatePayload = [...records.slice(0, 2), records[1]];
  const foreignSha = await computeBackupPayloadSha256(foreignPayload);
  const duplicateSha = await computeBackupPayloadSha256(duplicatePayload);
  await assert.rejects(() => restoreBackupAtomically({
    manifest: { ...recordsManifest, payloadSha256: foreignSha }, verifiedOwnerId: OWNER, currentSchemaVersion: 3, targetHasData: false,
    payload: foreignPayload, computedPayloadSha256: foreignSha,
    transaction: async () => { calls += 1; },
  }), /BACKUP_PAYLOAD_INVALID/);
  await assert.rejects(() => restoreBackupAtomically({
    manifest: { ...recordsManifest, payloadSha256: duplicateSha }, verifiedOwnerId: OWNER, currentSchemaVersion: 3, targetHasData: false,
    payload: duplicatePayload, computedPayloadSha256: duplicateSha,
    transaction: async () => { calls += 1; },
  }), /BACKUP_DUPLICATE_RECORD/);
  assert.equal(calls, 0);
});

test('transaction failure is propagated so the caller can roll back and retry', async () => {
  let calls = 0;
  await assert.rejects(() => restoreBackupAtomically({
    manifest: recordsManifest, verifiedOwnerId: OWNER, currentSchemaVersion: 3, targetHasData: false,
    payload: records, computedPayloadSha256: recordsSha,
    transaction: async () => { calls += 1; throw new Error('ROLLBACK_REQUIRED'); },
  }), /ROLLBACK_REQUIRED/);
  assert.equal(calls, 1);
});

test('a rolled-back restore can be retried from the same digest-bound artifact', async () => {
  let attempts = 0;
  const transaction = async (received) => {
    attempts += 1;
    assert.deepEqual(received, records);
    if (attempts === 1) throw new Error('ROLLBACK_REQUIRED');
  };
  await assert.rejects(() => restoreBackupAtomically({
    manifest: recordsManifest, verifiedOwnerId: OWNER, currentSchemaVersion: 3, targetHasData: false,
    payload: records, computedPayloadSha256: recordsSha, transaction,
  }), /ROLLBACK_REQUIRED/);
  const result = await restoreBackupAtomically({
    manifest: recordsManifest, verifiedOwnerId: OWNER, currentSchemaVersion: 3, targetHasData: false,
    payload: records, computedPayloadSha256: recordsSha, transaction,
  });
  assert.deepEqual(result, { restored: 3, ownerId: OWNER, schemaVersion: 2 });
  assert.equal(attempts, 2);
});

test('atomic restore recomputes the payload digest instead of trusting caller metadata', async () => {
  let calls = 0;
  await assert.rejects(() => restoreBackupAtomically({
    manifest: recordsManifest, verifiedOwnerId: OWNER, currentSchemaVersion: 3, targetHasData: false,
    payload: records, computedPayloadSha256: 'b'.repeat(64),
    transaction: async () => { calls += 1; },
  }), /BACKUP_PAYLOAD_DIGEST_INVALID/);
  assert.equal(calls, 0);
});

test('backup payload digest is canonical and changes when payload data changes', async () => {
  const first = await computeBackupPayloadSha256([{ b: 2, a: 1 }, { nested: { z: true, y: false } }]);
  const reordered = await computeBackupPayloadSha256([{ a: 1, b: 2 }, { nested: { y: false, z: true } }]);
  const changed = await computeBackupPayloadSha256([{ a: 1, b: 3 }, { nested: { y: false, z: true } }]);
  assert.equal(first, reordered);
  assert.notEqual(first, changed);
  assert.match(first, /^[a-f0-9]{64}$/);
});

test('backup export reads only the verified owner and binds manifest to the returned payload', async () => {
  let requestedOwner;
  const artifact = await createBackupArtifact({
    verifiedOwnerId: OWNER, schemaVersion: 3, createdAt: '2026-10-10T00:00:00.000Z',
    source: { async readRecords(ownerId) { requestedOwner = ownerId; return records; } },
  });
  assert.equal(requestedOwner, OWNER);
  assert.equal(artifact.manifest.recordCount, records.length);
  assert.equal(artifact.manifest.payloadSha256, await computeBackupPayloadSha256(artifact.payload));
  assert.equal(validateBackupManifest(artifact.manifest), true);
});

test('backup export rejects foreign, duplicate and failed source reads without hiding errors', async () => {
  await assert.rejects(createBackupArtifact({ verifiedOwnerId: OWNER, schemaVersion: 3, createdAt: '2026-10-10T00:00:00.000Z', source: { async readRecords() { return [{ ...records[0], ownerId: '44444444-4444-4444-8444-444444444444' }]; } } }), /BACKUP_EXPORT_INVALID/);
  await assert.rejects(createBackupArtifact({ verifiedOwnerId: OWNER, schemaVersion: 3, createdAt: '2026-10-10T00:00:00.000Z', source: { async readRecords() { return [records[0], records[0]]; } } }), /BACKUP_EXPORT_DUPLICATE/);
  await assert.rejects(createBackupArtifact({ verifiedOwnerId: OWNER, schemaVersion: 3, createdAt: '2026-10-10T00:00:00.000Z', source: { async readRecords() { throw new Error('BACKUP_SOURCE_UNAVAILABLE'); } } }), /BACKUP_SOURCE_UNAVAILABLE/);
});
