import assert from 'node:assert/strict';
import test from 'node:test';

const { createAccountSyncBoundary } = await import('../../src/features/sync/account-sync-boundary.ts');

const OWNER = '10000000-0000-4000-8000-000000000001';
const MUTATION = '20000000-0000-4000-8000-000000000002';
const NOW = '2026-10-09T04:00:00.000Z';

function store() {
  const mutation = {
    mutationId: MUTATION, command: 'task.create', entityType: 'task', targetId: MUTATION,
    baseVersion: null, payloadSchemaVersion: 1, payload: { id: MUTATION, title: 'Study' },
    payloadHash: 'hash', clientCreatedAt: NOW, attemptCount: 0, nextAttemptAt: NOW,
    state: 'pending', lastErrorCode: null,
  };
  const state = { mutation, acknowledged: [] };
  return {
    state,
    async loadPendingOutbox() { return [state.mutation]; },
    async acknowledgeOutbox(id) { state.acknowledged.push(id); },
    async rejectOutbox() {},
    async recordOutboxAttempt() {},
  };
}

test('account sync boundary stays inert without a configured endpoint or owner', async () => {
  let calls = 0;
  const current = store();
  const boundary = createAccountSyncBoundary({
    store: current, ownerId: () => null, baseUrl: undefined,
    getAccessToken: async () => { calls += 1; return 'token'; },
    fetcher: async () => { calls += 1; throw new Error('must not call network'); },
  });
  assert.deepEqual(await boundary.run(), { status: 'unavailable' });
  assert.equal(calls, 0);
});

test('account sync boundary binds the push to the verified owner and bearer token', async () => {
  const current = store();
  const requests = [];
  const boundary = createAccountSyncBoundary({
    store: current, ownerId: () => OWNER, baseUrl: 'https://api.example.test',
    getAccessToken: async () => 'access-token',
    fetcher: async (input, init) => {
      requests.push({ input, init });
      return { ok: true, status: 200, async json() { return { acceptedMutationIds: [MUTATION] }; } };
    },
  });
  assert.deepEqual(await boundary.run(), { status: 'completed', result: { attempted: 1, acknowledged: 1, deferred: 0, failed: 0 } });
  assert.deepEqual(current.state.acknowledged, [MUTATION]);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].init.headers.Authorization, 'Bearer access-token');
});

test('account sync boundary leaves the outbox pending when owner changes during push', async () => {
  const current = store();
  let owner = OWNER;
  let resolve;
  const boundary = createAccountSyncBoundary({
    store: current, ownerId: () => owner, baseUrl: 'https://api.example.test',
    getAccessToken: async () => 'access-token',
    fetcher: async () => new Promise((done) => { resolve = () => done({ ok: true, status: 200, async json() { return { acceptedMutationIds: [MUTATION] }; } }); }),
  });
  const resultPromise = boundary.run();
  await new Promise(setImmediate);
  owner = '30000000-0000-4000-8000-000000000003';
  resolve();
  assert.deepEqual(await resultPromise, { status: 'completed', result: { attempted: 1, acknowledged: 0, deferred: 0, failed: 1 } });
  assert.deepEqual(current.state.acknowledged, []);
});
