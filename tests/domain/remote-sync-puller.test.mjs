import assert from 'node:assert/strict';
import test from 'node:test';

const { createRemoteSyncPuller } = await import('../../src/features/sync/remote-sync-puller.ts');

const OWNER = 'account:10000000-0000-4000-8000-000000000001';
const ENTITY = '20000000-0000-4000-8000-000000000002';
const CURSOR = 'cursor-1.signature';

function page() {
  return { data: { nextCursor: CURSOR, changes: [{ sequence: '1', entityKind: 'task', entityId: ENTITY, operation: 'upsert', payload: { id: ENTITY, title: 'Focus' } }] } };
}

test('remote pull requests a bounded cursor page and returns the validated data envelope', async () => {
  let request;
  const pull = createRemoteSyncPuller({ client: { request: async (path, options) => { request = { path, options }; return page(); } } });
  assert.deepEqual(await pull(OWNER, null, 25), page().data);
  assert.deepEqual(request, { path: '/v1/sync/pull?limit=25', options: undefined });
});

test('remote pull preserves a continuation cursor and never sends an owner parameter', async () => {
  let path;
  const pull = createRemoteSyncPuller({ client: { request: async (received) => { path = received; return page(); } } });
  await pull(OWNER, CURSOR, 50);
  assert.equal(path, `/v1/sync/pull?limit=50&cursor=${encodeURIComponent(CURSOR)}`);
  assert.equal(path.includes('owner'), false);
});

test('remote pull rejects invalid owner, cursor, limit and malformed pages before local apply', async () => {
  let calls = 0;
  const pull = createRemoteSyncPuller({ client: { request: async () => { calls += 1; return page(); } } });
  await assert.rejects(() => pull('10000000-0000-4000-8000-000000000001', null, 50), /SYNC_OWNER_INVALID/);
  await assert.rejects(() => pull(OWNER, 'bad cursor', 50), /SYNC_CURSOR_INVALID/);
  await assert.rejects(() => pull(OWNER, null, 101), /SYNC_CURSOR_INVALID/);
  const malformed = createRemoteSyncPuller({ client: { request: async () => ({ data: { nextCursor: CURSOR, changes: [{ sequence: '0' }] } }) } });
  await assert.rejects(() => malformed(OWNER, null, 50), /SYNC_PAGE_INVALID/);
  assert.equal(calls, 0);
});

test('remote pull does not hide transport failures', async () => {
  const pull = createRemoteSyncPuller({ client: { request: async () => { throw new Error('offline'); } } });
  await assert.rejects(() => pull(OWNER, null, 50), /offline/);
});
