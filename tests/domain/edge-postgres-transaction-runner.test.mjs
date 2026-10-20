import assert from 'node:assert/strict';
import test from 'node:test';

const { createEdgePostgresTransactionRunner } = await import('../../supabase/functions/_shared/edge-postgres-transaction-runner.ts');

function poolHarness({ failBegin = false, failCommit = false, failRollback = false } = {}) {
  const calls = [];
  const transaction = {
    async begin() { calls.push('begin'); if (failBegin) throw new Error('BEGIN_FAILED'); },
    async commit() { calls.push('commit'); if (failCommit) throw new Error('COMMIT_FAILED'); },
    async rollback() { calls.push('rollback'); if (failRollback) throw new Error('ROLLBACK_FAILED'); },
    async queryObject(sql, params) { calls.push(['query', sql, params]); return { rows: [{ owner_id: 'owner' }] }; },
  };
  const connection = {
    createTransaction(name, options) { calls.push(['create', name, options]); return transaction; },
    release() { calls.push('release'); },
  };
  return { calls, pool: { async connect() { calls.push('connect'); return connection; } } };
}

test('edge runner uses one serializable transaction and releases the connection after commit', async () => {
  const h = poolHarness();
  const runner = createEdgePostgresTransactionRunner({ pool: h.pool });
  const result = await runner.withTransaction(async (client) => {
    const queried = await client.query('select owner_id from df_private.profiles where owner_id = $1', ['owner']);
    return queried.rows[0].owner_id;
  });
  assert.equal(result, 'owner');
  assert.deepEqual(h.calls, [
    'connect', ['create', 'deep_focus_gateway', { isolation_level: 'serializable' }], 'begin',
    ['query', 'select owner_id from df_private.profiles where owner_id = $1', ['owner']], 'commit', 'release',
  ]);
});

test('edge runner rolls back and releases the connection when a query callback fails', async () => {
  const h = poolHarness();
  const runner = createEdgePostgresTransactionRunner({ pool: h.pool });
  await assert.rejects(() => runner.withTransaction(async () => { throw new Error('WRITE_FAILED'); }), /WRITE_FAILED/);
  assert.deepEqual(h.calls.slice(-2), ['rollback', 'release']);
});

test('edge runner preserves the primary failure even when rollback fails', async () => {
  const h = poolHarness({ failRollback: true });
  const runner = createEdgePostgresTransactionRunner({ pool: h.pool });
  await assert.rejects(() => runner.withTransaction(async () => { throw new Error('WRITE_FAILED'); }), /WRITE_FAILED/);
  assert.equal(h.calls.at(-1), 'release');
});

test('edge runner rolls back when commit fails', async () => {
  const h = poolHarness({ failCommit: true });
  const runner = createEdgePostgresTransactionRunner({ pool: h.pool });
  await assert.rejects(() => runner.withTransaction(async () => 'ok'), /COMMIT_FAILED/);
  assert.deepEqual(h.calls.slice(-3), ['commit', 'rollback', 'release']);
});

test('driver timestamps, SQL dates and bigint sequences enter repositories without precision loss', async () => {
  const transaction = {
    begin: async () => {}, commit: async () => {}, rollback: async () => {},
    queryObject: async () => ({
      rows: [{ issued_at: new Date('2026-10-19T12:34:56.000Z'), due_date: new Date('2026-10-19T00:00:00.000Z'), sequence: 9007199254740993n, version: 1, payload: { keep: true } }],
      rowDescription: { columns: [{ name: 'issued_at', typeOid: 1184 }, { name: 'due_date', typeOid: 1082 }, { name: 'sequence', typeOid: 20 }] },
    }),
  };
  const runner = createEdgePostgresTransactionRunner({ pool: { connect: async () => ({ createTransaction: () => transaction, release() {} }) } });
  const result = await runner.withTransaction((client) => client.query('select fixture'));
  assert.deepEqual(result.rows, [{ issued_at: '2026-10-19T12:34:56.000Z', due_date: '2026-10-19', sequence: '9007199254740993', version: 1, payload: { keep: true } }]);
});
