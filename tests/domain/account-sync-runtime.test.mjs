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
    client: { auth: { getSession: async () => ({ data: { session: { access_token: 'access-token' } }, error: null }) } },
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
