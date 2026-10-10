import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresCapabilityUsageReader, createPostgresUsageService, createPostgresUsageTransactionStore } = await import('../../supabase/functions/_shared/postgres-usage-adapter.ts');
const { admitServerCapability } = await import('../../supabase/functions/_shared/entitlement-boundary.ts');
const { reserveUsageTransactionally, settleUsageTransactionally } = await import('../../supabase/functions/_shared/usage-boundary.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const RECEIPT = '22222222-2222-4222-8222-222222222222';
const SESSION = '66666666-6666-4666-8666-666666666666';
const NOW = '2026-10-10T00:00:00.000Z';
const admission = admitServerCapability({ verifiedActorId: OWNER, capability: 'ai', entitlement: { ownerId: OWNER, capability: 'ai', status: 'active', verifiedBy: 'server', policyVersion: 'v1', expiresAt: null, offerId: null }, now: NOW });

function harness({ receipt = null, settlementUpdated = true, reservationInsertRows = [{ receipt_id: RECEIPT, owner_id: OWNER, capability: 'ai', period_key: '2026-10' }], foreignSettlementRow = null, foreignAllowanceRow = null } = {}) {
  const calls = [];
  let allowance = { owner_id: OWNER, capability: 'ai', period_key: '2026-10', limit_units: 10, consumed_units: 2, reserved_units: 1, policy_version: 'v1' };
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    if (sql.includes('from df_private.server_entitlements')) return { rows: [{ owner_id: OWNER, capability: 'ai', status: 'active', verified_by: 'server', policy_version: 'v1', expires_at: null, offer_id: null }] };
    if (sql.includes('from df_private.usage_reservation_receipts')) return { rows: receipt ? [receipt] : [] };
    if (sql.includes('from df_private.capability_allowances')) return { rows: [allowance] };
    if (sql.includes('update df_private.capability_allowances')) {
      if (sql.includes('reserved_units = reserved_units +')) { allowance = { ...allowance, reserved_units: allowance.reserved_units + params[3] }; return { rows: [{ owner_id: foreignAllowanceRow?.owner_id ?? OWNER, capability: foreignAllowanceRow?.capability ?? 'ai', period_key: foreignAllowanceRow?.period_key ?? '2026-10', limit_units: allowance.limit_units, consumed_units: allowance.consumed_units, reserved_units: allowance.reserved_units, policy_version: allowance.policy_version }] }; }
      if (sql.includes('consumed_units = consumed_units +')) { allowance = { ...allowance, reserved_units: allowance.reserved_units - params[3], consumed_units: allowance.consumed_units + params[3] }; return { rows: [foreignAllowanceRow ?? { owner_id: OWNER, capability: 'ai', period_key: '2026-10' }] }; }
      if (sql.includes('reserved_units = reserved_units -')) { allowance = { ...allowance, reserved_units: allowance.reserved_units - params[3] }; return { rows: [foreignAllowanceRow ?? { owner_id: OWNER, capability: 'ai', period_key: '2026-10' }] }; }
    }
    if (sql.startsWith('insert into df_private.usage_reservation_receipts')) return { rows: reservationInsertRows };
    if (sql.startsWith('update df_private.usage_reservation_receipts')) return { rows: settlementUpdated ? [foreignSettlementRow ?? { receipt_id: params[1], owner_id: OWNER, capability: 'ai', period_key: '2026-10', status: params[2] }] : [] };
    return { rows: [] };
  } };
  return { calls, runner: { withTransaction: async (run) => run(client) } };
}

function sessionHarness({ revoked = false } = {}) {
  const h = harness();
  const query = h.runner.withTransaction;
  h.runner.withTransaction = async (run) => query((client) => run({ query: async (sql, params) => {
    if (sql.includes('from df_private.app_sessions')) {
      h.calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
      return { rows: revoked ? [{ owner_id: OWNER, session_id: SESSION, status: 'revoked', revoked_at: NOW }] : [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    }
    return client.query(sql, params);
  } }));
  return h;
}

test('PostgreSQL usage adapter reserves units with a locked allowance and stores replay metadata', async () => {
  const h = harness();
  const result = await reserveUsageTransactionally({ admission, verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', units: 2, receiptId: RECEIPT, store: createPostgresUsageTransactionStore({ runner: h.runner }) });
  assert.deepEqual(result, { allowed: true, ownerId: OWNER, capability: 'ai', periodKey: '2026-10', units: 2, remainingUnits: 5, policyVersion: 'v1' });
  const insert = h.calls.find((call) => call.sql.startsWith('insert into df_private.usage_reservation_receipts'));
  assert.deepEqual(insert.params.slice(0, 7), [OWNER, RECEIPT, 'ai', '2026-10', 2, 'v1', 5]);
});

test('PostgreSQL usage adapter replays a stored reservation without another provider grant', async () => {
  const h = harness({ receipt: { receipt_id: RECEIPT, owner_id: OWNER, capability: 'ai', period_key: '2026-10', units: 2, policy_version: 'v1', remaining_units: 5, status: 'reserved' } });
  const result = await reserveUsageTransactionally({ admission, verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', units: 99, receiptId: RECEIPT, store: createPostgresUsageTransactionStore({ runner: h.runner }) });
  assert.deepEqual(result, { allowed: true, ownerId: OWNER, capability: 'ai', periodKey: '2026-10', units: 2, remainingUnits: 5, policyVersion: 'v1', replayed: true });
  assert.equal(h.calls.some((call) => call.sql.startsWith('insert into')), false);
});

test('PostgreSQL usage adapter fails closed when reservation receipt insert is not acknowledged', async () => {
  const h = harness({ reservationInsertRows: [] });
  await assert.rejects(
    () => reserveUsageTransactionally({ admission, verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', units: 2, receiptId: RECEIPT, store: createPostgresUsageTransactionStore({ runner: h.runner }) }),
    /DEPENDENCY_UNAVAILABLE/,
  );
});

test('PostgreSQL usage adapter fails closed on a foreign reservation receipt row', async () => {
  const h = harness({ reservationInsertRows: [{ receipt_id: RECEIPT, owner_id: '33333333-3333-4333-8333-333333333333', capability: 'ai', period_key: '2026-10' }] });
  await assert.rejects(
    () => reserveUsageTransactionally({ admission, verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', units: 2, receiptId: RECEIPT, store: createPostgresUsageTransactionStore({ runner: h.runner }) }),
    /DEPENDENCY_UNAVAILABLE/,
  );
});

test('PostgreSQL usage adapter fails closed on a reservation receipt scope mismatch', async () => {
  const h = harness({ reservationInsertRows: [{ receipt_id: RECEIPT, owner_id: OWNER, capability: 'cloud_resources', period_key: '2026-10' }] });
  await assert.rejects(
    () => reserveUsageTransactionally({ admission, verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', units: 2, receiptId: RECEIPT, store: createPostgresUsageTransactionStore({ runner: h.runner }) }),
    /DEPENDENCY_UNAVAILABLE/,
  );
});

test('PostgreSQL usage adapter fails closed on a foreign allowance returned during reservation', async () => {
  const h = harness({ foreignAllowanceRow: { owner_id: '33333333-3333-4333-8333-333333333333', capability: 'ai', period_key: '2026-10' } });
  await assert.rejects(
    () => reserveUsageTransactionally({ admission, verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', units: 2, receiptId: RECEIPT, store: createPostgresUsageTransactionStore({ runner: h.runner }) }),
    /DEPENDENCY_UNAVAILABLE/,
  );
});

test('PostgreSQL usage adapter settles a reservation once and updates the allowance atomically', async () => {
  const h = harness({ receipt: { receipt_id: RECEIPT, owner_id: OWNER, capability: 'ai', period_key: '2026-10', units: 2, policy_version: 'v1', remaining_units: 5, status: 'reserved' } });
  const result = await settleUsageTransactionally({ verifiedActorId: OWNER, receiptId: RECEIPT, action: 'consume', store: createPostgresUsageTransactionStore({ runner: h.runner }) });
  assert.deepEqual(result, { allowed: true, receiptId: RECEIPT, ownerId: OWNER, status: 'consumed' });
  const settlement = h.calls.find((call) => call.sql.includes('consumed_units = consumed_units +'));
  assert.equal(settlement.sql.includes('reserved_units = reserved_units -'), true);
});

test('PostgreSQL usage service reads entitlement and reserves allowance in one transaction', async () => {
  const h = harness();
  const result = await createPostgresUsageService({ runner: h.runner }).reserve({ verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', units: 2, receiptId: RECEIPT, now: NOW, sessionId: SESSION });
  assert.deepEqual(result, { allowed: true, ownerId: OWNER, capability: 'ai', periodKey: '2026-10', units: 2, remainingUnits: 5, policyVersion: 'v1' });
  assert.equal(h.calls.some((call) => call.sql.includes('app_sessions')), true);
  assert.equal(h.calls.some((call) => call.sql.includes('server_entitlements')), true);
  assert.ok(h.calls.some((call) => call.sql.includes('capability_allowances')));
});

test('PostgreSQL usage service fails before allowance access when entitlement is missing', async () => {
  const h = harness();
  let allowanceSeen = false;
  const original = h.runner.withTransaction;
  h.runner.withTransaction = async (run) => original((client) => run({
    query: async (sql, params) => {
      if (sql.includes('from df_private.server_entitlements')) return { rows: [] };
      if (sql.includes('capability_allowances')) allowanceSeen = true;
      return client.query(sql, params);
    },
  }));
  const result = await createPostgresUsageService({ runner: h.runner }).reserve({ verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', units: 1, receiptId: RECEIPT, now: NOW, sessionId: SESSION });
  assert.deepEqual(result, { allowed: false, reason: 'capability_denied' });
  assert.equal(allowanceSeen, false);
});

test('PostgreSQL usage service settles a reserved receipt through the same transaction adapter', async () => {
  const h = harness({ receipt: { receipt_id: RECEIPT, owner_id: OWNER, capability: 'ai', period_key: '2026-10', units: 2, policy_version: 'v1', remaining_units: 5, status: 'reserved' } });
  const result = await createPostgresUsageService({ runner: h.runner }).settle({ verifiedActorId: OWNER, receiptId: RECEIPT, action: 'release', sessionId: SESSION });
  assert.deepEqual(result, { allowed: true, receiptId: RECEIPT, ownerId: OWNER, status: 'released' });
  assert.ok(h.calls.some((call) => call.sql.includes('reserved_units = reserved_units -')));
});

test('PostgreSQL usage adapter fails closed when receipt settlement updates no row', async () => {
  const h = harness({ receipt: { receipt_id: RECEIPT, owner_id: OWNER, capability: 'ai', period_key: '2026-10', units: 2, policy_version: 'v1', remaining_units: 5, status: 'reserved' }, settlementUpdated: false });
  await assert.rejects(() => settleUsageTransactionally({ verifiedActorId: OWNER, receiptId: RECEIPT, action: 'consume', store: createPostgresUsageTransactionStore({ runner: h.runner }) }), /DEPENDENCY_UNAVAILABLE/);
});

test('PostgreSQL usage adapter fails closed on foreign settlement metadata', async () => {
  const h = harness({ receipt: { receipt_id: RECEIPT, owner_id: OWNER, capability: 'ai', period_key: '2026-10', units: 2, policy_version: 'v1', remaining_units: 5, status: 'reserved' }, foreignSettlementRow: { receipt_id: RECEIPT, owner_id: '33333333-3333-4333-8333-333333333333', capability: 'ai', period_key: '2026-10', status: 'consumed' } });
  await assert.rejects(() => settleUsageTransactionally({ verifiedActorId: OWNER, receiptId: RECEIPT, action: 'consume', store: createPostgresUsageTransactionStore({ runner: h.runner }) }), /DEPENDENCY_UNAVAILABLE/);
});

test('PostgreSQL usage adapter fails closed on a foreign allowance scope during settlement', async () => {
  const h = harness({ receipt: { receipt_id: RECEIPT, owner_id: OWNER, capability: 'ai', period_key: '2026-10', units: 2, policy_version: 'v1', remaining_units: 5, status: 'reserved' }, foreignAllowanceRow: { owner_id: OWNER, capability: 'cloud_resources', period_key: '2026-10' } });
  await assert.rejects(() => settleUsageTransactionally({ verifiedActorId: OWNER, receiptId: RECEIPT, action: 'consume', store: createPostgresUsageTransactionStore({ runner: h.runner }) }), /DEPENDENCY_UNAVAILABLE/);
});

test('PostgreSQL usage adapter fails closed on a foreign allowance row', async () => {
  const h = harness();
  const base = h.runner.withTransaction;
  h.runner.withTransaction = async (run) => base((client) => run({
    query: async (sql, params) => {
      const result = await client.query(sql, params);
      if (sql.includes('from df_private.capability_allowances')) result.rows[0].owner_id = '33333333-3333-4333-8333-333333333333';
      return result;
    },
  }));
  await assert.rejects(() => createPostgresCapabilityUsageReader({ runner: h.runner }).read({ verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', now: NOW, sessionId: SESSION }), /DEPENDENCY_UNAVAILABLE/);
});

test('PostgreSQL capability usage reader returns server admission and allowance together', async () => {
  const h = harness();
  const result = await createPostgresCapabilityUsageReader({ runner: h.runner }).read({ verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', now: NOW, sessionId: SESSION });
  assert.equal(result.admission.allowed, true);
  assert.deepEqual(result.allowance, { ownerId: OWNER, capability: 'ai', periodKey: '2026-10', limitUnits: 10, consumedUnits: 2, reservedUnits: 1, policyVersion: 'v1' });
});

test('PostgreSQL capability usage reader does not read allowance after denied admission', async () => {
  const h = harness();
  let allowanceSeen = false;
  const original = h.runner.withTransaction;
  h.runner.withTransaction = async (run) => original((client) => run({
    query: async (sql, params) => {
      if (sql.includes('from df_private.server_entitlements')) return { rows: [] };
      if (sql.includes('capability_allowances')) allowanceSeen = true;
      return client.query(sql, params);
    },
  }));
  const result = await createPostgresCapabilityUsageReader({ runner: h.runner }).read({ verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', now: NOW, sessionId: SESSION });
  assert.deepEqual(result, { admission: { allowed: false, reason: 'missing_entitlement' }, allowance: null });
  assert.equal(allowanceSeen, false);
});

test('session-bound usage reservation rechecks the session before entitlement and allowance work', async () => {
  const h = sessionHarness();
  const result = await createPostgresUsageService({ runner: h.runner }).reserve({ verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', units: 1, receiptId: RECEIPT, now: NOW, sessionId: SESSION });
  assert.equal(result.allowed, true);
  assert.equal(h.calls[0].sql.includes('app_sessions'), true);
});

test('revoked session blocks usage settlement before receipt access', async () => {
  const h = sessionHarness({ revoked: true });
  await assert.rejects(() => createPostgresUsageService({ runner: h.runner }).settle({ verifiedActorId: OWNER, receiptId: RECEIPT, action: 'release', sessionId: SESSION }), /AUTH_REQUIRED/);
  assert.equal(h.calls.length, 1);
});
