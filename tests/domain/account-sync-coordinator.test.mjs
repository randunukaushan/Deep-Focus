import assert from 'node:assert/strict';
import test from 'node:test';

const { runAccountSync } = await import('../../src/features/sync/account-sync-coordinator.ts');

const USER = '10000000-0000-4000-8000-000000000001';
const OWNER = `account:${USER}`;
const MUTATION = '20000000-0000-4000-8000-000000000002';
const ENTITY = '30000000-0000-4000-8000-000000000003';
const NOW = '2026-10-11T00:00:00.000Z';

function store() {
  const calls = { applied: [], pushed: [] };
  const base = {
    async loadRemotePullState() { return null; },
    async applySyncPageAtomically(input) { calls.applied.push(input); return { applied: input.changes.length, replayed: 0, nextCursor: input.nextCursor }; },
    async loadPendingOutbox() { return [{ mutationId: MUTATION, command: 'task.create', entityType: 'task', targetId: ENTITY,
      baseVersion: null, payloadSchemaVersion: 1, payload: { id: ENTITY, title: 'Focus' }, payloadHash: 'hash',
      clientCreatedAt: NOW, attemptCount: 0, nextAttemptAt: NOW, state: 'pending', lastErrorCode: null }]; },
    async acknowledgeOutbox(id) { calls.pushed.push(id); },
    async rejectOutbox() {},
    async recordOutboxAttempt() {},
  };
  return { calls, base };
}

function page() {
  return { nextCursor: 'cursor-1', changes: [{ sequence: '1', entityKind: 'task', entityId: ENTITY, operation: 'upsert', payload: { id: ENTITY, title: 'Remote' } }] };
}

test('coordinator applies the remote page before pushing due local outbox work', async () => {
  const current = store();
  const calls = [];
  const result = await runAccountSync({
    store: current.base, authenticatedUserId: () => USER,
    pull: async (ownerId, cursor, limit) => { calls.push({ ownerId, cursor, limit }); return page(); },
    push: async () => ({ acceptedMutationIds: [MUTATION] }), now: () => NOW,
  });
  assert.equal(result.status, 'completed');
  assert.deepEqual(calls, [{ ownerId: OWNER, cursor: null, limit: 50 }]);
  assert.equal(current.calls.applied[0].ownerId, OWNER);
  assert.deepEqual(current.calls.pushed, [MUTATION]);
});

test('account switching after pull never applies the old account page or pushes its outbox', async () => {
  const current = store();
  let active = USER;
  let pushCalled = false;
  const result = await runAccountSync({
    store: current.base, authenticatedUserId: () => active,
    pull: async () => { active = '40000000-0000-4000-8000-000000000004'; return page(); },
    push: async () => { pushCalled = true; return { acceptedMutationIds: [MUTATION] }; }, now: () => NOW,
  });
  assert.deepEqual(result, { status: 'account_changed' });
  assert.deepEqual(current.calls.applied, []);
  assert.equal(pushCalled, false);
});

test('pull failure leaves local apply and outbox acknowledgement untouched', async () => {
  const current = store();
  await assert.rejects(() => runAccountSync({
    store: current.base, authenticatedUserId: () => USER,
    pull: async () => { throw new Error('offline'); }, push: async () => ({ acceptedMutationIds: [MUTATION] }), now: () => NOW,
  }), /offline/);
  assert.deepEqual(current.calls.applied, []);
  assert.deepEqual(current.calls.pushed, []);
});

test('local page apply failure leaves the outbox untouched and does not push', async () => {
  const current = store();
  let pushCalled = false;
  await assert.rejects(() => runAccountSync({
    store: { ...current.base, async applySyncPageAtomically() { throw new Error('local apply failed'); } },
    authenticatedUserId: () => USER, pull: async () => page(),
    push: async () => { pushCalled = true; return { acceptedMutationIds: [MUTATION] }; }, now: () => NOW,
  }), /local apply failed/);
  assert.equal(pushCalled, false);
  assert.deepEqual(current.calls.pushed, []);
});

test('push failure does not undo an already committed pull page or acknowledge the outbox', async () => {
  const current = store();
  const result = await runAccountSync({
    store: current.base, authenticatedUserId: () => USER, pull: async () => page(),
    push: async () => { throw new Error('push unavailable'); }, now: () => NOW,
  });
  assert.equal(result.status, 'completed');
  assert.deepEqual(result.push, { attempted: 1, acknowledged: 0, deferred: 0, failed: 1 });
  assert.equal(current.calls.applied.length, 1);
  assert.deepEqual(current.calls.pushed, []);
});

test('missing account identity and invalid page limits stop before remote pull', async () => {
  let pulls = 0;
  const current = store();
  assert.deepEqual(await runAccountSync({ store: current.base, authenticatedUserId: () => null, pull: async () => { pulls += 1; return page(); }, push: async () => ({ acceptedMutationIds: [] }) }), { status: 'account_changed' });
  await assert.rejects(() => runAccountSync({ store: current.base, authenticatedUserId: () => USER, pull: async () => { pulls += 1; return page(); }, push: async () => ({ acceptedMutationIds: [] }), pullLimit: 101 }), /SYNC_PULL_LIMIT_INVALID/);
  assert.equal(pulls, 0);
});
