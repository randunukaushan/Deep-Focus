import assert from 'node:assert/strict';
import test from 'node:test';

const { admitServerCapability } = await import('../../supabase/functions/_shared/entitlement-boundary.ts');
const { decideUsageReservation, executeReservedUsage, reserveUsageAtomically, reserveUsageTransactionally, settleUsageReceipt, settleUsageTransactionally } = await import('../../supabase/functions/_shared/usage-boundary.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const NOW = '2026-10-10T00:00:00.000Z';
const admission = admitServerCapability({
  verifiedActorId: OWNER, capability: 'ai',
  entitlement: { ownerId: OWNER, capability: 'ai', status: 'active', verifiedBy: 'server', policyVersion: 'v1', expiresAt: null, offerId: null },
  now: NOW,
});
const allowance = { ownerId: OWNER, capability: 'ai', periodKey: '2026-10', limitUnits: 10, consumedUnits: 3, reservedUnits: 2, policyVersion: 'v1' };

test('usage reservation is server-authoritative and returns bounded remaining units', () => {
  assert.deepEqual(decideUsageReservation({ admission, allowance, verifiedActorId: OWNER, capability: 'ai', units: 4 }), {
    allowed: true, ownerId: OWNER, capability: 'ai', periodKey: '2026-10', units: 4, remainingUnits: 1, policyVersion: 'v1',
  });
});

test('usage reservation fails closed for denied, foreign and exhausted requests', () => {
  assert.equal(decideUsageReservation({ admission: { allowed: false, reason: 'missing_entitlement' }, allowance, verifiedActorId: OWNER, capability: 'ai', units: 1 }).reason, 'capability_denied');
  assert.equal(decideUsageReservation({ admission, allowance, verifiedActorId: '22222222-2222-4222-8222-222222222222', capability: 'ai', units: 1 }).reason, 'owner_mismatch');
  assert.equal(decideUsageReservation({ admission, allowance: { ...allowance, consumedUnits: 8 }, verifiedActorId: OWNER, capability: 'ai', units: 1 }).reason, 'limit_exceeded');
});

test('malformed allowance and unsafe unit requests never produce a grant', () => {
  assert.equal(decideUsageReservation({ admission, allowance: { ...allowance, reservedUnits: 99 }, verifiedActorId: OWNER, capability: 'ai', units: 1 }).reason, 'invalid_allowance');
  assert.equal(decideUsageReservation({ admission, allowance, verifiedActorId: OWNER, capability: 'ai', units: 0 }).reason, 'invalid_request');
  assert.equal(decideUsageReservation({ admission, allowance, verifiedActorId: OWNER, capability: 'ai', units: 1001 }).reason, 'invalid_request');
});

test('usage decision exposes no prices, providers or client-controlled counters', () => {
  const result = decideUsageReservation({ admission, allowance, verifiedActorId: OWNER, capability: 'ai', units: 1 });
  assert.deepEqual(Object.keys(result).sort(), ['allowed', 'capability', 'ownerId', 'periodKey', 'policyVersion', 'remainingUnits', 'units']);
});

test('atomic reservation commits once and an identical replay returns the stored receipt', async () => {
  const receiptId = '66666666-6666-4666-8666-666666666666';
  let commitCount = 0;
  let saved = null;
  const store = {
    async readReceipt(ownerId, id) { return saved && saved.ownerId === ownerId && saved.receiptId === id ? saved : null; },
    async readAllowance() { return allowance; },
    async commitReservation(input) { commitCount += 1; saved = { receiptId: input.receiptId, ownerId: input.ownerId, decision: input.decision, status: 'reserved' }; },
    async commitSettlement(input) { saved.status = input.to; },
  };
  const first = await reserveUsageAtomically({ admission, verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', units: 1, receiptId, store });
  const replay = await reserveUsageAtomically({ admission, verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', units: 99, receiptId, store });
  assert.equal(first.allowed, true);
  assert.deepEqual(replay, { ...first, replayed: true });
  assert.equal(commitCount, 1);
});

test('reservation write failure is surfaced and never becomes a successful grant', async () => {
  const store = {
    async readReceipt() { return null; },
    async readAllowance() { return allowance; },
    async commitReservation() { throw new Error('transaction unavailable'); },
    async commitSettlement() {},
  };
  await assert.rejects(reserveUsageAtomically({ admission, verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', units: 1, receiptId: '77777777-7777-4777-8777-777777777777', store }), /transaction unavailable/);
});

test('reserved usage can be consumed or released once, with safe replay and transition checks', async () => {
  const receipt = { receiptId: '88888888-8888-4888-8888-888888888888', ownerId: OWNER, decision: { allowed: true, ownerId: OWNER, capability: 'ai', periodKey: '2026-10', units: 1, remainingUnits: 4, policyVersion: 'v1' }, status: 'reserved' };
  let commits = 0;
  const store = {
    async readReceipt(ownerId, id) { return ownerId === receipt.ownerId && id === receipt.receiptId ? receipt : null; },
    async commitSettlement(input) { commits += 1; receipt.status = input.to; },
  };
  assert.deepEqual(await settleUsageReceipt({ verifiedActorId: OWNER, receiptId: receipt.receiptId, action: 'consume', store }), { allowed: true, receiptId: receipt.receiptId, ownerId: OWNER, status: 'consumed' });
  assert.deepEqual(await settleUsageReceipt({ verifiedActorId: OWNER, receiptId: receipt.receiptId, action: 'consume', store }), { allowed: true, receiptId: receipt.receiptId, ownerId: OWNER, status: 'consumed', replayed: true });
  assert.equal((await settleUsageReceipt({ verifiedActorId: OWNER, receiptId: receipt.receiptId, action: 'release', store })).reason, 'invalid_transition');
  assert.equal(commits, 1);
});

test('settled reservation replay cannot call the provider again', async () => {
  const receiptId = '99999999-9999-4999-8999-999999999999';
  let providerCalls = 0;
  const reserve = async () => ({ allowed: false, reason: 'already_settled' });
  const result = await executeReservedUsage({ receiptId, reserve, execute: async () => { providerCalls += 1; return 'should-not-run'; }, settle: async () => ({ allowed: true, receiptId, ownerId: OWNER, status: 'consumed' }) });
  assert.deepEqual(result, { allowed: false, reason: 'reservation_denied' });
  assert.equal(providerCalls, 0);
});

test('reserved provider success consumes usage, while provider failure releases it', async () => {
  const receiptId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const settled = [];
  const reserve = async () => ({ allowed: true, ownerId: OWNER, capability: 'ai', periodKey: '2026-10', units: 1, remainingUnits: 1, policyVersion: 'v1' });
  const success = await executeReservedUsage({ receiptId, reserve, execute: async () => 'mock-result', settle: async (action) => { settled.push(action); return { allowed: true, receiptId, ownerId: OWNER, status: action === 'consume' ? 'consumed' : 'released' }; } });
  assert.deepEqual(success, { allowed: true, receiptId, result: 'mock-result' });
  assert.deepEqual(settled, ['consume']);
  const failed = await executeReservedUsage({ receiptId, reserve, execute: async () => { throw new Error('provider detail'); }, settle: async (action) => { settled.push(action); return { allowed: true, receiptId, ownerId: OWNER, status: action === 'consume' ? 'consumed' : 'released' }; } });
  assert.deepEqual(failed, { allowed: false, reason: 'provider_failed', released: true });
  assert.deepEqual(settled, ['consume', 'release']);
});

test('reservation and settlement transaction helpers keep read and write together', async () => {
  let transactionCount = 0;
  let saved = null;
  const store = {
    async withTransaction(operation) {
      transactionCount += 1;
      return operation({
        async readReceipt() { return saved; },
        async readAllowance() { return allowance; },
        async commitReservation(input) { saved = { receiptId: input.receiptId, ownerId: input.ownerId, decision: input.decision, status: 'reserved' }; },
        async commitSettlement(input) { saved.status = input.to; },
      });
    },
  };
  const receiptId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const reserved = await reserveUsageTransactionally({ admission, verifiedActorId: OWNER, capability: 'ai', periodKey: '2026-10', units: 1, receiptId, store });
  assert.equal(reserved.allowed, true);
  const settled = await settleUsageTransactionally({ verifiedActorId: OWNER, receiptId, action: 'consume', store });
  assert.deepEqual(settled, { allowed: true, receiptId, ownerId: OWNER, status: 'consumed' });
  assert.equal(transactionCount, 2);
});
