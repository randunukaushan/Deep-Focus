import assert from 'node:assert/strict';
import test from 'node:test';

const { runMigrations } = await import('../../supabase/functions/_shared/migration-runner.ts');

const SQL_A = '20261012090000_first.sql';
const SQL_B = '20261012090100_second.sql';
const TEXT_A = 'begin; create table example_a (id integer); commit;';
const TEXT_B = 'begin; create table example_b (id integer); commit;';

function storeHarness({ receipts = new Map(), failAt = null, failReceiptAt = null } = {}) {
  const calls = [];
  return {
    calls,
    receipts,
    store: {
      withMigrationTransaction: async (migrationId, run) => {
        calls.push(['begin', migrationId]);
        const transaction = {
          loadReceipt: async (id) => receipts.get(id) ?? null,
          executeMigration: async (input) => {
            calls.push(['execute', input.migrationId]);
            if (failAt === input.migrationId) throw new Error('migration failed');
          },
          saveReceipt: async (receipt) => {
            calls.push(['receipt', receipt.migrationId]);
            if (failReceiptAt === receipt.migrationId) throw new Error('receipt save failed');
            receipts.set(receipt.migrationId, receipt);
          },
        };
        const result = await run(transaction);
        calls.push(['commit', migrationId]);
        return result;
      },
    },
  };
}

test('migration runner validates, orders, applies and receipts each migration after execution', async () => {
  const h = storeHarness();
  const result = await runMigrations({ files: [{ name: SQL_B, text: TEXT_B }, { name: SQL_A, text: TEXT_A }], schemaVersion: 1, store: h.store });
  assert.deepEqual(result.map((item) => [item.migrationId, item.status]), [['20261012090000_first', 'applied'], ['20261012090100_second', 'applied']]);
  assert.deepEqual(h.calls, [
    ['begin', '20261012090000_first'], ['execute', '20261012090000_first'], ['receipt', '20261012090000_first'], ['commit', '20261012090000_first'],
    ['begin', '20261012090100_second'], ['execute', '20261012090100_second'], ['receipt', '20261012090100_second'], ['commit', '20261012090100_second'],
  ]);
});

test('migration runner replays exact receipts without executing SQL and rejects changed identity', async () => {
  const first = storeHarness();
  const files = [{ name: SQL_A, text: TEXT_A }];
  const applied = await runMigrations({ files, schemaVersion: 1, store: first.store });
  const replay = storeHarness({ receipts: first.receipts });
  const replayed = await runMigrations({ files, schemaVersion: 1, store: replay.store });
  assert.equal(applied[0].status, 'applied');
  assert.equal(replayed[0].status, 'replayed');
  assert.deepEqual(replay.calls, [['begin', '20261012090000_first'], ['commit', '20261012090000_first']]);

  const changed = storeHarness({ receipts: new Map([[applied[0].migrationId, { ...applied[0].receipt, checksumSha256: 'b'.repeat(64) }]]) });
  await assert.rejects(() => runMigrations({ files, schemaVersion: 1, store: changed.store }), /MIGRATION_CHECKSUM_MISMATCH/);
});

test('migration failure does not save a receipt and a later retry can apply it', async () => {
  const failed = storeHarness({ failAt: '20261012090000_first' });
  await assert.rejects(() => runMigrations({ files: [{ name: SQL_A, text: TEXT_A }], schemaVersion: 1, store: failed.store }), /migration failed/);
  assert.equal(failed.receipts.size, 0);
  const retry = storeHarness({ receipts: failed.receipts });
  const result = await runMigrations({ files: [{ name: SQL_A, text: TEXT_A }], schemaVersion: 1, store: retry.store });
  assert.equal(result[0].status, 'applied');
});

test('receipt-save failure is not reported as applied and a retry can re-run the migration', async () => {
  const failed = storeHarness({ failReceiptAt: '20261012090000_first' });
  await assert.rejects(() => runMigrations({ files: [{ name: SQL_A, text: TEXT_A }], schemaVersion: 1, store: failed.store }), /receipt save failed/);
  assert.equal(failed.receipts.size, 0);
  const retry = storeHarness({ receipts: failed.receipts });
  const result = await runMigrations({ files: [{ name: SQL_A, text: TEXT_A }], schemaVersion: 1, store: retry.store });
  assert.equal(result[0].status, 'applied');
  assert.deepEqual(retry.calls.map(([kind]) => kind), ['begin', 'execute', 'receipt', 'commit']);
});

test('migration runner validates the complete manifest before opening a transaction', async () => {
  let transactions = 0;
  await assert.rejects(() => runMigrations({
    files: [{ name: SQL_A, text: TEXT_A }, { name: '20261012090200_bad.sql', text: 'drop table unsafe;' }],
    schemaVersion: 1,
    store: { withMigrationTransaction: async () => { transactions += 1; throw new Error('must not run'); } },
  }), /VALIDATION_FAILED/);
  assert.equal(transactions, 0);
});

test('migration runner rejects a malformed store before validating or executing migrations', async () => {
  await assert.rejects(() => runMigrations(null), /VALIDATION_FAILED/);
  await assert.rejects(() => runMigrations({ files: [{ name: SQL_A, text: TEXT_A }], schemaVersion: 1, store: null }), /VALIDATION_FAILED/);
});

test('serialized duplicate invocations apply once and replay once', async () => {
  const h = storeHarness();
  let queue = Promise.resolve();
  const serialized = {
    withMigrationTransaction: (migrationId, run) => {
      const next = queue.then(() => h.store.withMigrationTransaction(migrationId, run));
      queue = next.then(() => undefined, () => undefined);
      return next;
    },
  };
  const files = [{ name: SQL_A, text: TEXT_A }];
  const [first, second] = await Promise.all([
    runMigrations({ files, schemaVersion: 1, store: serialized }),
    runMigrations({ files, schemaVersion: 1, store: serialized }),
  ]);
  assert.deepEqual([first[0].status, second[0].status].sort(), ['applied', 'replayed']);
  assert.equal(h.calls.filter((call) => call[0] === 'execute').length, 1);
});
