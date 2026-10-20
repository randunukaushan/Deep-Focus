import assert from 'node:assert/strict';
import test from 'node:test';

const { createAccountSyncRuntime } = await import('../../src/features/sync/account-sync-runtime.ts');

const OWNER = '10000000-0000-4000-8000-000000000001';
const MUTATION = '20000000-0000-4000-8000-000000000002';
const NOW = '2026-10-11T00:00:00.000Z';

function store() {
  const calls = { acknowledged: [], attempts: [] };
  return {
    calls,
    async loadPendingOutbox() {
      return [{ mutationId: MUTATION, command: 'task.create', entityType: 'task', targetId: MUTATION,
        baseVersion: null, payloadSchemaVersion: 1, payload: { id: MUTATION, title: 'Focus' }, payloadHash: 'hash',
        clientCreatedAt: NOW, attemptCount: 0, nextAttemptAt: NOW, state: 'pending', lastErrorCode: null }];
    },
    async acknowledgeOutbox(id) { calls.acknowledged.push(id); },
    async rejectOutbox() {},
    async recordOutboxAttempt(id) { calls.attempts.push(id); },
  };
}

test('runtime remains inert without an explicit API endpoint', async () => {
  let sessionReads = 0;
  const result = await createAccountSyncRuntime({
    store: store(), ownerId: () => OWNER, baseUrl: undefined,
    client: { auth: { getSession: async () => { sessionReads += 1; return { data: { session: null }, error: null }; } } },
  }).run();
  assert.deepEqual(result, { status: 'unavailable' });
  assert.equal(sessionReads, 0);
});

test('runtime rejects an unsafe endpoint before reading the provider session', async () => {
  let sessionReads = 0;
  const result = await createAccountSyncRuntime({
    store: store(), ownerId: () => OWNER, baseUrl: 'http://api.example.test?token=bad',
    client: { auth: { getSession: async () => { sessionReads += 1; return { data: { session: null }, error: null }; } } },
  }).run();
  assert.deepEqual(result, { status: 'unavailable' });
  assert.equal(sessionReads, 0);
});

test('runtime obtains only a bearer token and preserves the verified owner boundary', async () => {
  const current = store();
  let request;
  const result = await createAccountSyncRuntime({
    store: current, ownerId: () => OWNER, baseUrl: 'https://api.example.test',
    client: { auth: { getSession: async () => ({ data: { session: { access_token: 'access-token', user: { id: OWNER } } }, error: null }) } },
    fetcher: async (input, init) => { request = { input, init }; return { ok: true, status: 200, async json() { return { acceptedMutationIds: [MUTATION] }; } }; },
  }).run();
  assert.equal(result.status, 'completed');
  assert.deepEqual(current.calls.acknowledged, [MUTATION]);
  assert.equal(request.init.headers.Authorization, 'Bearer access-token');
  assert.equal(JSON.parse(request.init.body).ownerId, undefined);
});

test('runtime does not claim success when session token acquisition fails', async () => {
  const current = store();
  const result = await createAccountSyncRuntime({
    store: current, ownerId: () => OWNER, baseUrl: 'https://api.example.test',
    client: { auth: { getSession: async () => ({ data: { session: null }, error: new Error('offline') }) } },
    fetcher: async () => { throw new Error('network must not be reached'); },
  }).run();
  assert.equal(result.status, 'completed');
  assert.deepEqual(current.calls.acknowledged, []);
  assert.deepEqual(current.calls.attempts, [MUTATION]);
});

test('runtime rejects malformed session client and owner reader before sync work', async () => {
  let fetchCalls = 0;
  const base = { store: store(), ownerId: () => OWNER, baseUrl: 'https://api.example.test', fetcher: async () => { fetchCalls += 1; throw new Error('must not fetch'); } };
  assert.deepEqual(await createAccountSyncRuntime({ ...base, client: {} }).run(), { status: 'unavailable' });
  assert.deepEqual(await createAccountSyncRuntime({ ...base, ownerId: () => { throw new Error('owner unavailable'); }, client: { auth: { getSession: async () => ({ data: { session: null }, error: null }) } } }).run(), { status: 'unavailable' });
  assert.equal(fetchCalls, 0);
});

test('switching accounts during outbox loading never sends or consumes the old batch', async () => {
  const current = store();
  const load = current.loadPendingOutbox;
  let owner = OWNER;
  let requests = 0;
  current.loadPendingOutbox = async () => {
    const pending = await load();
    owner = '30000000-0000-4000-8000-000000000003';
    return pending;
  };
  const result = await createAccountSyncRuntime({
    store: current, ownerId: () => owner, baseUrl: 'https://api.example.test',
    client: { auth: { getSession: async () => ({ data: { session: { access_token: 'new-account-token', user: { id: owner } } }, error: null }) } },
    fetcher: async () => { requests += 1; throw new Error('must not send'); },
  }).run();
  assert.equal(result.status, 'completed');
  assert.equal(result.result.attempted, 0);
  assert.equal(requests, 0);
  assert.deepEqual(current.calls.acknowledged, []);
  assert.deepEqual(current.calls.attempts, []);
});

test('a token for a different or absent session owner never reaches transport', async () => {
  for (const user of [undefined, { id: '30000000-0000-4000-8000-000000000003' }]) {
    const current = store();
    let requests = 0;
    const result = await createAccountSyncRuntime({
      store: current, ownerId: () => OWNER, baseUrl: 'https://api.example.test',
      client: { auth: { getSession: async () => ({ data: { session: { access_token: 'wrong-owner-token', user } }, error: null }) } },
      fetcher: async () => { requests += 1; throw new Error('must not send'); },
    }).run();
    assert.equal(result.result.acknowledged, 0);
    assert.equal(requests, 0);
    assert.deepEqual(current.calls.acknowledged, []);
    assert.deepEqual(current.calls.attempts, [MUTATION]);
  }
});
