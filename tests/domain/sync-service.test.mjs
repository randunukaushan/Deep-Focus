import assert from 'node:assert/strict';
import test from 'node:test';

const { syncPendingOutbox } = await import('../../src/features/sync/sync-service.ts');

const NOW = '2026-10-09T04:00:00.000Z';

function mutation(id, overrides = {}) {
  return {
    mutationId: id, command: 'task.create', entityType: 'task', targetId: `target-${id}`,
    baseVersion: null, payloadSchemaVersion: 1, payload: { id, title: 'Study' }, payloadHash: `hash-${id}`,
    clientCreatedAt: NOW, attemptCount: 0, nextAttemptAt: NOW, state: 'pending', lastErrorCode: null, ...overrides,
  };
}

function store(mutations) {
  const acknowledged = [];
  const rejected = [];
  const attempts = [];
  return {
    acknowledged, rejected, attempts,
    async loadPendingOutbox() { return mutations; },
    async acknowledgeOutbox(id) { acknowledged.push(id); },
    async rejectOutbox(id, errorCode) { rejected.push({ id, errorCode }); },
    async recordOutboxAttempt(id, nextAttemptAt, errorCode) { attempts.push({ id, nextAttemptAt, errorCode }); },
  };
}

test('sync sends due mutations with stable idempotency and acknowledges only explicit successes', async () => {
  const current = store([mutation('a'), mutation('b')]);
  let request;
  const result = await syncPendingOutbox({
    store: current, now: () => NOW,
    push: async (items, idempotencyKey) => { request = { items, idempotencyKey }; return { acceptedMutationIds: ['a', 'b'] }; },
  });
  assert.equal(result.acknowledged, 2);
  assert.deepEqual(current.acknowledged, ['a', 'b']);
  assert.equal(request.idempotencyKey, 'sync:a:b');
  assert.deepEqual(request.items[0], { mutationId: 'a', command: 'task.create', targetId: 'target-a', body: { id: 'a', title: 'Study' } });
});

test('future retries are deferred and never sent early', async () => {
  const current = store([mutation('future', { nextAttemptAt: '2026-10-09T04:01:00.000Z' })]);
  let called = false;
  const result = await syncPendingOutbox({ store: current, now: () => NOW, push: async () => { called = true; return { acceptedMutationIds: ['future'] }; } });
  assert.equal(called, false);
  assert.deepEqual(result, { attempted: 0, acknowledged: 0, deferred: 1, failed: 0 });
});

test('transport failure records a retry and preserves every mutation', async () => {
  const current = store([mutation('a'), mutation('b')]);
  const result = await syncPendingOutbox({ store: current, now: () => NOW, retryDelaySeconds: 60, push: async () => { throw Object.assign(new Error('offline'), { code: 'NETWORK_UNAVAILABLE' }); } });
  assert.equal(result.failed, 2);
  assert.deepEqual(current.acknowledged, []);
  assert.deepEqual(current.attempts, [
    { id: 'a', nextAttemptAt: '2026-10-09T04:01:00.000Z', errorCode: 'NETWORK_UNAVAILABLE' },
    { id: 'b', nextAttemptAt: '2026-10-09T04:01:00.000Z', errorCode: 'NETWORK_UNAVAILABLE' },
  ]);
});

test('partial server acknowledgement quarantines a version conflict for explicit recovery', async () => {
  const current = store([mutation('a'), mutation('b')]);
  const result = await syncPendingOutbox({
    store: current, now: () => NOW,
    push: async () => ({ acceptedMutationIds: ['a'], rejectedMutationIds: [{ mutationId: 'b', errorCode: 'VERSION_CONFLICT' }] }),
  });
  assert.deepEqual(current.acknowledged, ['a']);
  assert.deepEqual(current.rejected, [{ id: 'b', errorCode: 'VERSION_CONFLICT' }]);
  assert.deepEqual(current.attempts, []);
  assert.deepEqual(result, { attempted: 2, acknowledged: 1, deferred: 0, failed: 1 });
});

test('access denial is quarantined and never retried automatically', async () => {
  const current = store([mutation('a')]);
  const result = await syncPendingOutbox({
    store: current, now: () => NOW,
    push: async () => ({ acceptedMutationIds: [], rejectedMutationIds: [{ mutationId: 'a', errorCode: 'ACCESS_DENIED' }] }),
  });
  assert.deepEqual(current.rejected, [{ id: 'a', errorCode: 'ACCESS_DENIED' }]);
  assert.deepEqual(current.attempts, []);
  assert.equal(result.failed, 1);
});

test('local remote-contract rejections are quarantined instead of retried as offline failures', async () => {
  const current = store([mutation('a')]);
  const result = await syncPendingOutbox({
    store: current, now: () => NOW,
    push: async () => ({ acceptedMutationIds: [], rejectedMutationIds: [{ mutationId: 'a', errorCode: 'SYNC_EVENT_REQUIRED' }] }),
  });
  assert.deepEqual(current.rejected, [{ id: 'a', errorCode: 'SYNC_EVENT_REQUIRED' }]);
  assert.deepEqual(current.attempts, []);
  assert.equal(result.failed, 1);
});

test('malformed server acknowledgement fails closed without deleting local mutations', async () => {
  const current = store([mutation('a')]);
  const result = await syncPendingOutbox({ store: current, now: () => NOW, push: async () => ({ acceptedMutationIds: ['foreign-id'] }) });
  assert.deepEqual(current.acknowledged, []);
  assert.deepEqual(current.attempts, [{ id: 'a', nextAttemptAt: '2026-10-09T04:00:30.000Z', errorCode: 'SYNC_RESPONSE_INVALID' }]);
  assert.equal(result.failed, 1);
});

test('ambiguous accepted and rejected mutation IDs fail closed', async () => {
  const current = store([mutation('a')]);
  const result = await syncPendingOutbox({
    store: current,
    now: () => NOW,
    push: async () => ({ acceptedMutationIds: ['a'], rejectedMutationIds: [{ mutationId: 'a', errorCode: 'VERSION_CONFLICT' }] }),
  });
  assert.deepEqual(current.acknowledged, []);
  assert.deepEqual(current.attempts, [{ id: 'a', nextAttemptAt: '2026-10-09T04:00:30.000Z', errorCode: 'SYNC_RESPONSE_INVALID' }]);
  assert.deepEqual(result, { attempted: 1, acknowledged: 0, deferred: 0, failed: 1 });
});

test('duplicate local mutation IDs are not sent to the remote push', async () => {
  const current = store([mutation('same'), mutation('same', { payload: { id: 'different', title: 'Other' } })]);
  let pushed = false;
  const result = await syncPendingOutbox({
    store: current,
    now: () => NOW,
    push: async () => { pushed = true; return { acceptedMutationIds: ['same'] }; },
  });
  assert.equal(pushed, false);
  assert.deepEqual(current.acknowledged, []);
  assert.deepEqual(current.attempts, [
    { id: 'same', nextAttemptAt: '2026-10-09T04:00:30.000Z', errorCode: 'SYNC_OUTBOX_INVALID' },
    { id: 'same', nextAttemptAt: '2026-10-09T04:00:30.000Z', errorCode: 'SYNC_OUTBOX_INVALID' },
  ]);
  assert.deepEqual(result, { attempted: 2, acknowledged: 0, deferred: 0, failed: 2 });
});

test('concurrent sync calls for one owner share one server push', async () => {
  const current = store([mutation('one')]);
  let pushes = 0;
  let release;
  const push = async () => { pushes += 1; await new Promise((resolve) => { release = resolve; }); return { acceptedMutationIds: ['one'] }; };
  const first = syncPendingOutbox({ store: current, push, now: () => NOW });
  const second = syncPendingOutbox({ store: current, push, now: () => NOW });
  await new Promise(setImmediate);
  assert.equal(pushes, 1);
  release();
  assert.deepEqual(await Promise.all([first, second]), [
    { attempted: 1, acknowledged: 1, deferred: 0, failed: 0 },
    { attempted: 1, acknowledged: 1, deferred: 0, failed: 0 },
  ]);
  assert.deepEqual(current.acknowledged, ['one']);
});

test('a failed outbox load does not poison the next retry or create an unhandled cleanup rejection', async () => {
  let loads = 0;
  const current = store([mutation('retry-after-load')]);
  current.loadPendingOutbox = async () => {
    loads += 1;
    if (loads === 1) throw new Error('OUTBOX_READ_FAILED');
    return [mutation('retry-after-load')];
  };
  const first = syncPendingOutbox({ store: current, now: () => NOW, push: async () => ({ acceptedMutationIds: ['retry-after-load'] }) });
  await assert.rejects(first, /OUTBOX_READ_FAILED/);
  await new Promise(setImmediate);
  const second = await syncPendingOutbox({ store: current, now: () => NOW, push: async () => ({ acceptedMutationIds: ['retry-after-load'] }) });
  assert.deepEqual(second, { attempted: 1, acknowledged: 1, deferred: 0, failed: 0 });
  assert.deepEqual(current.acknowledged, ['retry-after-load']);
});
