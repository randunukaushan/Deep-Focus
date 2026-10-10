import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresRateLimitCounter } = await import('../../supabase/functions/_shared/postgres-rate-limit-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const KEY = `actor:${OWNER}:createTask`;
const NOW = Date.parse('2026-10-10T00:00:12.345Z');

function harness(count = 1) {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    return { rows: [{ request_count: count }] };
  } }) };
  return { runner, calls };
}

test('PostgreSQL counter performs an atomic owner/operation/window upsert', async () => {
  const h = harness(2);
  const result = await createPostgresRateLimitCounter(h).consume(KEY, 60_000, 2, NOW);
  assert.deepEqual(result, { allowed: true, retryAfterSeconds: 48 });
  assert.match(h.calls[0].sql, /on conflict \(owner_id, operation, window_start_ms\)/i);
  assert.deepEqual(h.calls[0].params, [OWNER, 'createTask', 1791590400000]);
});

test('counter denies after the configured limit without hiding the retry window', async () => {
  const result = await createPostgresRateLimitCounter(harness(3)).consume(KEY, 60_000, 2, NOW);
  assert.deepEqual(result, { allowed: false, retryAfterSeconds: 48 });
});

test('window boundary changes the bucket key', async () => {
  const h = harness(1);
  await createPostgresRateLimitCounter(h).consume(KEY, 60_000, 2, NOW + 60_000);
  assert.equal(h.calls[0].params[2], 1791590460000);
});

test('malformed actor keys and unsafe policy inputs fail before storage', async () => {
  let called = false;
  const counter = createPostgresRateLimitCounter({ runner: { withTransaction: async () => { called = true; return { request_count: 1 }; } } });
  await assert.rejects(() => counter.consume('actor:foreign:createTask', 60_000, 2, NOW), /VALIDATION_FAILED/);
  await assert.rejects(() => counter.consume(KEY, 999, 2, NOW), /VALIDATION_FAILED/);
  assert.equal(called, false);
});

test('malformed database counter result fails closed', async () => {
  const counter = createPostgresRateLimitCounter({ runner: { withTransaction: async (run) => run({ query: async () => ({ rows: [{ request_count: 0 }] }) }) } });
  await assert.rejects(() => counter.consume(KEY, 60_000, 2, NOW), /DEPENDENCY_UNAVAILABLE/);
});

test('concurrent counter calls preserve a monotonic atomic result in the adapter contract', async () => {
  let count = 0;
  const seen = [];
  const counter = createPostgresRateLimitCounter({ runner: {
    withTransaction: async (run) => run({ query: async (_sql, params) => {
      count += 1;
      seen.push(params[2]);
      await Promise.resolve();
      return { rows: [{ request_count: count }] };
    } }),
  } });
  const results = await Promise.all(Array.from({ length: 25 }, () => counter.consume(KEY, 60_000, 100, NOW)));
  assert.equal(results.length, 25);
  assert.equal(new Set(seen).size, 1);
  assert.deepEqual(results.map((result) => result.allowed), Array.from({ length: 25 }, () => true));
});
