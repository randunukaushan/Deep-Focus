import assert from 'node:assert/strict';
import test from 'node:test';

const { assertMigrationReceipt, validateMigrationReceipt } = await import('../../supabase/functions/_shared/migration-receipt-validation.ts');

const valid = { migrationId: '20261011200000_schema_migration_receipts_v1', checksumSha256: 'a'.repeat(64), schemaVersion: 1, appliedBy: 'migration_runner' };

test('migration receipt validation binds ordered identity, checksum, version and authority', () => {
  assert.equal(validateMigrationReceipt(valid), true);
  assert.doesNotThrow(() => assertMigrationReceipt(valid));
  for (const candidate of [
    { ...valid, migrationId: 'bad' },
    { ...valid, checksumSha256: 'not-a-digest' },
    { ...valid, schemaVersion: 0 },
    { ...valid, appliedBy: 'client' },
    { ...valid, secret: 'must-not-be-accepted' },
  ]) {
    assert.equal(validateMigrationReceipt(candidate), false);
    assert.throws(() => assertMigrationReceipt(candidate), /VALIDATION_FAILED/);
  }
});
