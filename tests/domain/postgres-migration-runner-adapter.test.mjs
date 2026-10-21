import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresMigrationRunnerStore } = await import('../../supabase/functions/_shared/postgres-migration-runner-adapter.ts');

const ID = '20261012090000_first';
const FIRST = '20261009071127_personal_core_v1';
const SQL = 'begin; create table example_a (id integer); commit;';
const RECEIPT = { migrationId: ID, checksumSha256: 'a'.repeat(64), schemaVersion: 1, appliedBy: 'migration_runner' };

async function digest(value) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function harness({ rows = [], inserted = [], receiptsExist = true, schemaExists = true } = {}) {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('to_regclass')) return { rows: [{ receipts_exist: receiptsExist, schema_exists: schemaExists }] };
    if (sql.startsWith('select migration_id')) return { rows };
    if (sql.startsWith('insert into')) return { rows: inserted };
    return { rows: [] };
  } }) };
  return { calls, runner };
}

test('migration runner adapter reads, executes and records inside one transaction', async () => {
  const hash = await digest(SQL);
  const row = { migration_id: ID, checksum_sha256: hash, schema_version: 1, applied_by: 'migration_runner' };
  const h = harness({ inserted: [row] });
  const store = createPostgresMigrationRunnerStore(h);
  const result = await store.withMigrationTransaction(ID, async (transaction) => {
    assert.equal(await transaction.loadReceipt(ID), null);
    await transaction.executeMigration({ migrationId: ID, checksumSha256: hash, sqlText: SQL });
    await transaction.saveReceipt({ ...RECEIPT, checksumSha256: hash });
    return 'committed';
  });
  assert.equal(result, 'committed');
  assert.equal(h.calls.length, 6);
  assert.equal(h.calls[0].sql, 'set transaction isolation level read committed');
  assert.equal(h.calls[1].sql, 'select pg_advisory_xact_lock(1145457987, 1)');
  assert.match(h.calls[2].sql, /to_regclass/);
  assert.match(h.calls[3].sql, /for update$/);
  assert.equal(h.calls[4].sql, 'create table example_a (id integer);');
  assert.deepEqual(h.calls[5].params, [ID, hash, 1, 'migration_runner']);
});

test('migration runner adapter rejects a checksum mismatch before SQL execution', async () => {
  const h = harness();
  const store = createPostgresMigrationRunnerStore(h);
  await assert.rejects(() => store.withMigrationTransaction(ID, (transaction) => transaction.executeMigration({ migrationId: ID, checksumSha256: 'b'.repeat(64), sqlText: SQL })), /MIGRATION_CHECKSUM_MISMATCH/);
  assert.equal(h.calls.length, 0);
});

test('migration runner adapter rejects non-transactional or destructive SQL before execution', async () => {
  const h = harness();
  const store = createPostgresMigrationRunnerStore(h);
  for (const sqlText of ['create table unsafe (id integer);', 'begin; drop table unsafe; commit;', 'begin; commit;', 'begin; begin; create table unsafe (id integer); commit;']) {
    const checksumSha256 = await digest(sqlText);
    await assert.rejects(() => store.withMigrationTransaction(ID, (transaction) => transaction.executeMigration({ migrationId: ID, checksumSha256, sqlText })), /VALIDATION_FAILED/);
  }
  assert.equal(h.calls.length, 0);
});

test('migration runner adapter maps and validates an existing receipt without executing SQL', async () => {
  const hash = await digest(SQL);
  const row = { migration_id: ID, checksum_sha256: hash, schema_version: 1, applied_by: 'migration_runner' };
  const h = harness({ rows: [row] });
  const store = createPostgresMigrationRunnerStore(h);
  const receipt = await store.withMigrationTransaction(ID, (transaction) => transaction.loadReceipt(ID));
  assert.deepEqual(receipt, { migrationId: ID, checksumSha256: hash, schemaVersion: 1, appliedBy: 'migration_runner' });
  assert.equal(h.calls.length, 4);
});

test('migration runner adapter fails closed for foreign returned receipt identity', async () => {
  const hash = await digest(SQL);
  const h = harness({ rows: [{ migration_id: '20261012090100_other', checksum_sha256: hash, schema_version: 1, applied_by: 'migration_runner' }] });
  const store = createPostgresMigrationRunnerStore(h);
  await assert.rejects(() => store.withMigrationTransaction(ID, (transaction) => transaction.loadReceipt(ID)), /DEPENDENCY_UNAVAILABLE/);
});

test('migration runner adapter fails closed on malformed receipt result containers', async () => {
  const malformedRead = { withTransaction: async (run) => run({ query: async () => ({ rows: null }) }) };
  const readStore = createPostgresMigrationRunnerStore({ runner: malformedRead });
  await assert.rejects(() => readStore.withMigrationTransaction(ID, (transaction) => transaction.loadReceipt(ID)), /DEPENDENCY_UNAVAILABLE/);

  const malformedWrite = { withTransaction: async (run) => run({ query: async (sql) => sql.startsWith('insert into') ? { rows: [null] } : { rows: [] } }) };
  const writeStore = createPostgresMigrationRunnerStore({ runner: malformedWrite });
  const hash = await digest(SQL);
  await assert.rejects(() => writeStore.withMigrationTransaction(ID, (transaction) => transaction.saveReceipt({ ...RECEIPT, checksumSha256: hash })), /DEPENDENCY_UNAVAILABLE/);
});

test('migration runner adapter fails closed on sparse receipt rows', async () => {
  const rows = [];
  rows[1] = { migration_id: ID, checksum_sha256: 'a'.repeat(64), schema_version: 1, applied_by: 'migration_runner' };
  const runner = { withTransaction: async (run) => run({ query: async (sql) => {
    if (sql.includes('to_regclass')) return { rows: [{ receipts_exist: true, schema_exists: true }] };
    return { rows };
  } }) };
  await assert.rejects(
    () => createPostgresMigrationRunnerStore({ runner }).withMigrationTransaction(ID, (transaction) => transaction.loadReceipt(ID)),
    /DEPENDENCY_UNAVAILABLE/,
  );
});

test('migration runner adapter rejects a returned receipt that differs from the requested receipt', async () => {
  const hash = await digest(SQL);
  const h = harness({ inserted: [{ migration_id: ID, checksum_sha256: 'b'.repeat(64), schema_version: 1, applied_by: 'migration_runner' }] });
  const store = createPostgresMigrationRunnerStore(h);
  await assert.rejects(() => store.withMigrationTransaction(ID, (transaction) => transaction.saveReceipt({ ...RECEIPT, checksumSha256: hash })), /MIGRATION_CHECKSUM_MISMATCH/);
});

test('migration runner adapter fails closed before callbacks for a malformed transaction client', async () => {
  const store = createPostgresMigrationRunnerStore({
    runner: { withTransaction: async (run) => run({}) },
  });
  await assert.rejects(() => store.withMigrationTransaction(ID, async () => 'must not run'), /DEPENDENCY_UNAVAILABLE/);
});

test('bootstrap allows only the first migration with an absent private schema', async () => {
  const h = harness({ receiptsExist: false, schemaExists: false });
  const store = createPostgresMigrationRunnerStore(h);
  assert.equal(await store.withMigrationTransaction(FIRST, (tx) => tx.loadReceipt(FIRST)), null);
  assert.equal(h.calls.length, 3);
  assert.equal(h.calls.some((call) => call.sql.startsWith('select migration_id')), false);
  for (const [id, schemaExists] of [[ID, false], [FIRST, true]]) {
    const bad = harness({ receiptsExist: false, schemaExists });
    await assert.rejects(() => createPostgresMigrationRunnerStore(bad)
      .withMigrationTransaction(id, (tx) => tx.loadReceipt(id)), /DEPENDENCY_UNAVAILABLE/);
  }
});

test('lock failure aborts before catalog, migration SQL or receipt writes', async () => {
  const calls = [];
  const store = createPostgresMigrationRunnerStore({ runner: { withTransaction: async (run) => run({
    query: async (sql) => {
      calls.push(sql);
      if (sql.includes('pg_advisory_xact_lock')) throw new Error('lock unavailable');
      return { rows: [] };
    },
  }) } });
  await assert.rejects(() => store.withMigrationTransaction(ID, (tx) => tx.loadReceipt(ID)), /lock unavailable/);
  assert.equal(calls.length, 2);
});
