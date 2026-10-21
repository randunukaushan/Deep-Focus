import assert from 'node:assert/strict';
import test from 'node:test';

const { createSafeServerLogger } = await import('../../supabase/functions/_shared/safe-server-logger.ts');

const valid = { event: 'sync.completed', operation: 'sync.pull', outcome: 'success', requestId: 'req_123', durationMs: 12 };

test('safe logger emits only the bounded allowlist and freezes the emitted copy', () => {
  const entries = [];
  const logger = createSafeServerLogger({ sink: (entry) => entries.push(entry) });
  logger.write(valid);
  assert.deepEqual(entries, [valid]);
  assert.equal(Object.isFrozen(entries[0]), true);
  assert.notEqual(entries[0], valid);
});

test('safe logger rejects raw secret-bearing or unknown fields before the sink', () => {
  let writes = 0;
  const logger = createSafeServerLogger({ sink: () => { writes += 1; } });
  assert.throws(() => logger.write({ ...valid, secret: 'must-not-log' }), /VALIDATION_FAILED/);
  assert.throws(() => logger.write({ ...valid, token: 'bearer-value' }), /VALIDATION_FAILED/);
  assert.equal(writes, 0);
});

test('safe logger rejects runtime type confusion and non-object entries', () => {
  const logger = createSafeServerLogger({ sink: () => {} });
  for (const value of [null, [], 'sync.completed', { ...valid, event: 1 }, { ...valid, durationMs: '12' }]) {
    assert.throws(() => logger.write(value), /VALIDATION_FAILED/);
  }
});

test('safe logger requires bounded error codes for non-success outcomes', () => {
  const logger = createSafeServerLogger({ sink: () => {} });
  assert.throws(() => logger.write({ event: 'sync.failed', operation: 'sync.pull', outcome: 'failure' }), /VALIDATION_FAILED/);
  assert.throws(() => logger.write({ event: 'sync.failed', operation: 'sync.pull', outcome: 'failure', errorCode: 'raw provider detail' }), /VALIDATION_FAILED/);
  assert.throws(() => logger.write({ ...valid, errorCode: 'DEPENDENCY_UNAVAILABLE' }), /VALIDATION_FAILED/);
  assert.doesNotThrow(() => logger.write({ ...valid, outcome: 'failure', errorCode: 'DEPENDENCY_UNAVAILABLE' }));
});
