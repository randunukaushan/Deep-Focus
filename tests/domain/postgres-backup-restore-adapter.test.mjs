import assert from 'node:assert/strict';
import test from 'node:test';

const { computeBackupPayloadSha256 } = await import('../../supabase/functions/_shared/backup-restore.ts');
const { createPostgresBackupRestoreAdapter } = await import('../../supabase/functions/_shared/postgres-backup-restore-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const OTHER_OWNER = '22222222-2222-4222-8222-222222222222';
const NOW = '2026-10-14T00:00:00.000Z';
const RECORDS = [{ kind: 'task', id: '33333333-3333-4333-8333-333333333333', ownerId: OWNER, data: { title: 'Read' } }];

function harness() {
  const calls = [];
  const client = { query: async (...args) => { calls.push(args); return { rows: [] }; } };
  return { calls, client, runner: { withTransaction: async (run) => run(client) } };
}

test('PostgreSQL backup adapter exports only the verified owner through one transaction', async () => {
  const h = harness();
  let readOwner;
  const store = createPostgresBackupRestoreAdapter({
    runner: h.runner,
    source: { readRecords: async (client, ownerId) => { assert.equal(client, h.client); readOwner = ownerId; return RECORDS; } },
    writer: { writeRecords: async () => { throw new Error('writer must not run during export'); } },
  });
  const artifact = await store.export({ verifiedOwnerId: OWNER, schemaVersion: 2, createdAt: NOW });
  assert.equal(readOwner, OWNER);
  assert.equal(artifact.manifest.ownerId, OWNER);
  assert.deepEqual(artifact.payload, RECORDS);
  assert.equal(h.calls.length, 0);
});

test('PostgreSQL backup adapter restores validated records through the caller transaction', async () => {
  const h = harness();
  const digest = await computeBackupPayloadSha256(RECORDS);
  let written;
  const store = createPostgresBackupRestoreAdapter({
    runner: h.runner,
    source: { readRecords: async () => [] },
    writer: { writeRecords: async (client, ownerId, records) => { assert.equal(client, h.client); assert.equal(ownerId, OWNER); written = records; } },
  });
  const result = await store.restore({
    manifest: { version: 1, ownerId: OWNER, schemaVersion: 2, createdAt: NOW, recordCount: RECORDS.length, payloadSha256: digest },
    verifiedOwnerId: OWNER, currentSchemaVersion: 3, targetHasData: false, payload: RECORDS, computedPayloadSha256: digest,
  });
  assert.deepEqual(result, { restored: 1, ownerId: OWNER, schemaVersion: 2 });
  assert.deepEqual(written, RECORDS);
});

test('PostgreSQL backup adapter rejects restore admission before opening a transaction', async () => {
  const h = harness();
  const store = createPostgresBackupRestoreAdapter({ runner: h.runner, source: { readRecords: async () => [] }, writer: { writeRecords: async () => {} } });
  const digest = await computeBackupPayloadSha256(RECORDS);
  await assert.rejects(() => store.restore({
    manifest: { version: 1, ownerId: OWNER, schemaVersion: 2, createdAt: NOW, recordCount: 1, payloadSha256: digest },
    verifiedOwnerId: OTHER_OWNER, currentSchemaVersion: 3, targetHasData: false, payload: RECORDS, computedPayloadSha256: digest,
  }), /BACKUP_RESTORE_OWNER_MISMATCH/);
  assert.equal(h.calls.length, 0);
});

test('PostgreSQL backup adapter propagates writer failure without reporting restore success', async () => {
  const h = harness();
  const digest = await computeBackupPayloadSha256(RECORDS);
  const store = createPostgresBackupRestoreAdapter({
    runner: h.runner,
    source: { readRecords: async () => [] },
    writer: { writeRecords: async () => { throw new Error('injected restore failure'); } },
  });
  await assert.rejects(() => store.restore({
    manifest: { version: 1, ownerId: OWNER, schemaVersion: 2, createdAt: NOW, recordCount: 1, payloadSha256: digest },
    verifiedOwnerId: OWNER, currentSchemaVersion: 3, targetHasData: false, payload: RECORDS, computedPayloadSha256: digest,
  }), /injected restore failure/);
});
