import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

const { buildMigrationManifest } = await import('../../supabase/functions/_shared/migration-manifest.ts');

const SQL_A = 'begin;\ncreate table df_private.a (id uuid);\ncommit;\n';
const SQL_B = 'begin;\ncreate table df_private.b (id uuid);\ncommit;\n';

test('migration manifest sorts receipts and binds checksums to exact local text', async () => {
  const receipts = await buildMigrationManifest({ schemaVersion: 4, appliedBy: 'manual_review', files: [
    { name: '20261011200001_second_v1.sql', text: SQL_B },
    { name: '20261011200000_first_v1.sql', text: SQL_A },
  ] });
  assert.deepEqual(receipts.map((receipt) => receipt.migrationId), ['20261011200000_first_v1', '20261011200001_second_v1']);
  assert.equal(receipts[0].schemaVersion, 4);
  assert.notEqual(receipts[0].checksumSha256, receipts[1].checksumSha256);
});

test('migration manifest rejects malformed, duplicate or destructive SQL before execution', async () => {
  for (const files of [
    [{ name: 'bad.sql', text: SQL_A }],
    [{ name: '20261011200000_same_v1.sql', text: SQL_A }, { name: '20261011200000_same_v1.sql', text: SQL_A }],
    [{ name: '20261011200000_bad_v1.sql', text: 'begin; delete from df_private.a; commit;' }],
    [{ name: '20261011200000_bad_v1.sql', text: 'begin; drop schema df_private; commit;' }],
    [{ name: '20261011200000_bad_v1.sql', text: 'begin; alter table df_private.a drop column id; commit;' }],
    [{ name: '20261011200000_bad_v1.sql', text: 'create table df_private.a (id uuid);' }],
  ]) assert.rejects(() => buildMigrationManifest({ files, schemaVersion: 1 }), /VALIDATION_FAILED/);
});

test('migration manifest rejects null and array inputs before reading files', async () => {
  await assert.rejects(() => buildMigrationManifest(null), /VALIDATION_FAILED/);
  await assert.rejects(() => buildMigrationManifest([]), /VALIDATION_FAILED/);
});

test('repository migrations produce a deterministic receipt manifest without execution', async () => {
  const directory = new URL('../../supabase/migrations/', import.meta.url);
  const names = (await readdir(directory)).filter((name) => name.endsWith('.sql')).sort();
  const files = await Promise.all(names.map(async (name) => ({ name, text: await readFile(new URL(name, directory), 'utf8') })));
  const receipts = await buildMigrationManifest({ files, schemaVersion: 1 });
  assert.equal(receipts.length, names.length);
  assert.deepEqual(receipts.map((receipt) => `${receipt.migrationId}.sql`), names);
  assert.equal(new Set(receipts.map((receipt) => receipt.checksumSha256)).size, receipts.length);
});
