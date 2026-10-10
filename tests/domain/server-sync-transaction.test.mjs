import assert from 'node:assert/strict';
import test from 'node:test';

const { commitAuthorizedSyncPage, hashSyncChange } = await import('../../supabase/functions/_shared/sync-transaction.ts');
const { signSyncCursor } = await import('../../supabase/functions/_shared/sync-cursor.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const TASK = '22222222-2222-4222-8222-222222222222';
const SECRET = 'server-only-development-secret-with-32-bytes-minimum';
const EXPIRY = '2026-10-10T01:00:00.000Z';

function makeStore() {
  const heads = new Map([[OWNER, '0']]);
  const changes = new Map();
  let transactions = 0;
  return {
    get transactions() { return transactions; },
    async withTransaction(operation) {
      transactions += 1;
      const headSnapshot = new Map(heads);
      const changeSnapshot = new Map(changes);
      const tx = {
        async readHeadForUpdate(ownerId) { return { lastSequence: heads.get(ownerId) ?? '0' }; },
        async readChange(ownerId, sequence) { return changes.get(`${ownerId}:${sequence}`) ?? null; },
        async appendChange(ownerId, change, changeHash) { changes.set(`${ownerId}:${change.sequence}`, { ...change, changeHash }); },
        async advanceHead(ownerId, sequence) { heads.set(ownerId, sequence); },
      };
      try { return await operation(tx); }
      catch (error) { heads.clear(); for (const item of headSnapshot) heads.set(...item); changes.clear(); for (const item of changeSnapshot) changes.set(...item); throw error; }
    },
    head() { return heads.get(OWNER); },
    change(sequence) { return changes.get(`${OWNER}:${sequence}`); },
  };
}

function page(changes, cursorLastSequence = '0') {
  return { actorId: OWNER, cursorOwnerId: OWNER, cursorLastSequence, nextCursor: `cursor-${changes.at(-1)?.sequence ?? cursorLastSequence}`, changes };
}

test('server sync commit locks the owner head and appends ordered changes atomically', async () => {
  const store = makeStore();
  const result = await commitAuthorizedSyncPage({ ...page([{ sequence: '1', entityKind: 'task', entityId: TASK, operation: 'upsert', payload: { title: 'Study' } }]), store });
  assert.deepEqual(result, { applied: 1, replayed: 0, lastSequence: '1', nextCursor: 'cursor-1' });
  assert.equal(store.head(), '1');
  assert.equal(store.change('1').changeHash.length, 64);
  assert.equal(store.transactions, 1);
});

test('server sync transaction preserves a signed pull cursor as the next cursor', async () => {
  const store = makeStore();
  const signedCursor = await signSyncCursor({
    version: 1, ownerId: OWNER, endpoint: 'sync', limit: 50,
    after: '1', highWater: '1', expiresAt: EXPIRY,
  }, SECRET);
  const result = await commitAuthorizedSyncPage({
    ...page([{ sequence: '1', entityKind: 'task', entityId: TASK, operation: 'upsert', payload: { title: 'Study' } }]),
    nextCursor: signedCursor,
    store,
  });
  assert.equal(result.nextCursor, signedCursor);
  assert.match(result.nextCursor, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
});

test('server sync accepts a canonical delete change with a null payload', async () => {
  const store = makeStore();
  const deleted = { sequence: '1', entityKind: 'goal', entityId: TASK, operation: 'delete', payload: null };
  const result = await commitAuthorizedSyncPage({ ...page([deleted]), store });
  assert.deepEqual(result, { applied: 1, replayed: 0, lastSequence: '1', nextCursor: 'cursor-1' });
  assert.equal(store.change('1').payload, null);
  assert.equal((await hashSyncChange(deleted)).length, 64);
});

test('server sync accepts an owner settings upsert change', async () => {
  const settings = { sequence: '1', entityKind: 'settings', entityId: TASK, operation: 'upsert', payload: { id: TASK, theme: 'system', version: 1 } };
  const store = makeStore();
  assert.deepEqual(await commitAuthorizedSyncPage({ actorId: OWNER, cursorOwnerId: OWNER, cursorLastSequence: '0', nextCursor: 'cursor-settings', changes: [settings], store }), { applied: 1, replayed: 0, lastSequence: '1', nextCursor: 'cursor-settings' });
});

test('exact server replay is safe while a changed replay is rejected and rolled back', async () => {
  const store = makeStore();
  const first = { sequence: '1', entityKind: 'task', entityId: TASK, operation: 'upsert', payload: { title: 'Study' } };
  await commitAuthorizedSyncPage({ ...page([first]), store });
  assert.deepEqual(await commitAuthorizedSyncPage({ ...page([first], '1'), store }), { applied: 0, replayed: 1, lastSequence: '1', nextCursor: 'cursor-1' });
  await assert.rejects(commitAuthorizedSyncPage({ ...page([{ ...first, payload: { title: 'Tampered' } }], '1'), store }), /SYNC_REPLAY_CONFLICT/);
  assert.equal(store.head(), '1');
  assert.equal(store.change('1').payload.title, 'Study');
});

test('server sync refuses a stale concurrent head before writing', async () => {
  const store = makeStore();
  await commitAuthorizedSyncPage({ ...page([{ sequence: '1', entityKind: 'task', entityId: TASK, operation: 'upsert', payload: { title: 'Study' } }]), store });
  await assert.rejects(commitAuthorizedSyncPage({ ...page([{ sequence: '2', entityKind: 'task', entityId: TASK, operation: 'upsert', payload: { title: 'Later' } }]), store }), /SYNC_HEAD_CHANGED/);
  assert.equal(store.head(), '1');
  assert.equal(store.change('2'), undefined);
});

test('server sync rejects foreign cursor and malformed ordering before opening a transaction', async () => {
  const store = makeStore();
  await assert.rejects(commitAuthorizedSyncPage({ ...page([{ sequence: '1', entityKind: 'task', entityId: TASK, operation: 'upsert', payload: {} }]), cursorOwnerId: '33333333-3333-4333-8333-333333333333', store }), /SYNC_PAGE_INVALID/);
  await assert.rejects(commitAuthorizedSyncPage({ ...page([{ sequence: '2', entityKind: 'task', entityId: TASK, operation: 'upsert', payload: {} }, { sequence: '1', entityKind: 'task', entityId: TASK, operation: 'upsert', payload: {} }]), store }), /SYNC_SEQUENCE_ORDER_INVALID/);
  assert.equal(store.transactions, 0);
});

test('server change hash is stable across object key order', async () => {
  const left = await hashSyncChange({ sequence: '1', entityKind: 'task', entityId: TASK, operation: 'upsert', payload: { b: 2, a: 1 } });
  const right = await hashSyncChange({ sequence: '1', entityKind: 'task', entityId: TASK, operation: 'upsert', payload: { a: 1, b: 2 } });
  assert.equal(left, right);
  assert.match(left, /^[a-f0-9]{64}$/);
});
