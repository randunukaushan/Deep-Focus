import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresMigrationReceiptStore } = await import('../../supabase/functions/_shared/postgres-migration-receipt-adapter.ts');
const RECEIPT = { migrationId: '20261011200000_schema_migration_receipts_v1', checksumSha256: 'a'.repeat(64), schemaVersion: 1, appliedBy: 'migration_runner' };

function harness({ existing = [], inserted = [RECEIPT] } = {}) {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.schema_migration_receipts')) return { rows: existing.map((value) => ({ migration_id: value.migrationId, checksum_sha256: value.checksumSha256, schema_version: value.schemaVersion, applied_by: value.appliedBy })) };
    if (sql.startsWith('insert into df_private.schema_migration_receipts')) return { rows: inserted.map((value) => ({ migration_id: value.migrationId, checksum_sha256: value.checksumSha256, schema_version: value.schemaVersion, applied_by: value.appliedBy })) };
    throw new Error(`unexpected query: ${sql}`);
  } }) };
  return { calls, runner };
}

test('migration receipt adapter inserts a validated receipt transactionally', async () => {
  const h = harness();
  assert.deepEqual(await createPostgresMigrationReceiptStore(h).record(RECEIPT), { receipt: RECEIPT, replayed: false });
  assert.equal(h.calls.length, 2);
  assert.equal(h.calls[1].params[0], RECEIPT.migrationId);
});

test('matching receipt replays but a checksum/version/authority mismatch fails closed', async () => {
  assert.deepEqual(await createPostgresMigrationReceiptStore(harness({ existing: [RECEIPT] })).record(RECEIPT), { receipt: RECEIPT, replayed: true });
  await assert.rejects(() => createPostgresMigrationReceiptStore(harness({ existing: [{ ...RECEIPT, checksumSha256: 'b'.repeat(64) }] })).record(RECEIPT), (error) => error.code === 'MIGRATION_CHECKSUM_MISMATCH');
});

test('migration receipt store rejects malformed runner, client and result containers', async () => {
  assert.throws(() => createPostgresMigrationReceiptStore(null), /DEPENDENCY_UNAVAILABLE/);
  const malformedClient = createPostgresMigrationReceiptStore({ runner: { withTransaction: async (run) => run({ query: 'not-a-function' }) } });
  await assert.rejects(() => malformedClient.record(RECEIPT), /DEPENDENCY_UNAVAILABLE/);
  const malformedRows = createPostgresMigrationReceiptStore({ runner: { withTransaction: async (run) => run({ query: async () => ({ rows: null }) }) } });
  await assert.rejects(() => malformedRows.record(RECEIPT), /DEPENDENCY_UNAVAILABLE/);
});

test('migration receipt store fails closed on sparse receipt rows', async () => {
  const rows = [];
  rows[1] = { migration_id: RECEIPT.migrationId, checksum_sha256: RECEIPT.checksumSha256, schema_version: 1, applied_by: 'migration_runner' };
  const runner = { withTransaction: async (run) => run({ query: async () => ({ rows }) }) };
  await assert.rejects(
    () => createPostgresMigrationReceiptStore({ runner }).record(RECEIPT),
    /DEPENDENCY_UNAVAILABLE/,
  );
});
