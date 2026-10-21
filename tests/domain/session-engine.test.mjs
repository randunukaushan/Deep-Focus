import test from 'node:test';
import assert from 'node:assert/strict';
import * as engine from '../../src/features/focus/session-engine.ts';

// Milliseconds from epoch are explicit observations, not wall-clock waiting.
// Values below are contract oracles (13 §§8/11), not engine-derived expectations.
const freshSession = () => engine.createFocusSession(25, 'Synthetic task', 0);

function assertProjection(session, now, expected) {
  const actual = engine.projectFocusSession(session, now);
  assert.deepEqual(actual, expected);
}

function assertValidationRejected(action, code) {
  let result;
  try {
    result = action();
  } catch (error) {
    if (error instanceof RangeError || error?.code === code) return;
    throw error; // An arbitrary crash is not a validated rejection.
  }
  assert.equal(result?.ok, false, `Expected explicit ${code} rejection`);
  assert.equal(result.code, code, 'Rejection must identify the validation boundary');
}

test('CR-T01: complete a full 25-minute session at 1,500,000 ms', () => {
  const original = freshSession();
  const session = engine.completeFocusSession(original, 1_500_000);
  assert.equal(session.status, 'completed');
  assert.equal(session.focusedDurationSeconds, 1500);
  assert.equal(session.pausedDurationSeconds, 0);
  assert.equal(session.completedAt, '1970-01-01T00:25:00.000Z');
  assert.equal(original.status, 'active', 'Transition must not mutate its input');
  assertProjection(session, 1_500_000, {
    focusedSeconds: 1500, pausedSeconds: 0, remainingSeconds: 0, progress: 1,
  });
});

test('CR-T02: early completion at 60,000 ms must remain active; cancel is available', () => {
  const original = freshSession();
  const attempted = engine.completeFocusSession(original, 60_000);
  assert.equal(attempted.status, 'active', 'Early request must not create a terminal record');
  assert.equal(attempted.completedAt, undefined);
  const cancelled = engine.cancelFocusSession(attempted, 60_000);
  assert.equal(cancelled.status, 'cancelled');
  assert.equal(cancelled.focusedDurationSeconds, 60);
});

test('CR-T03: pause 300,000 / resume 420,000 / project 1,320,000', () => {
  const session = freshSession();
  const paused = engine.pauseFocusSession(session, 300_000);
  const resumed = engine.resumeFocusSession(paused, 420_000);
  assert.equal(paused.status, 'paused');
  assert.equal(resumed.status, 'active');
  assertProjection(resumed, 1_320_000, {
    focusedSeconds: 1200, pausedSeconds: 120, remainingSeconds: 300, progress: 0.8,
  });
});

test('CR-T04: cancelled totals stay frozen when projected later', () => {
  const session = engine.cancelFocusSession(freshSession(), 60_000);
  const snapshot = structuredClone(session);
  assert.equal(session.status, 'cancelled');
  assert.equal(session.focusedDurationSeconds, 60);
  assertProjection(session, 120_000, {
    focusedSeconds: 60, pausedSeconds: 0, remainingSeconds: 1440, progress: 0.04,
  });
  assert.deepEqual(session, snapshot, 'Projection must not mutate history');
});

test('CR-T04 regression: terminal projection preserves both stored focus and pause totals', () => {
  const paused = engine.pauseFocusSession(freshSession(), 10_000);
  const cancelled = engine.cancelFocusSession(paused, 20_000);
  assert.equal(cancelled.focusedDurationSeconds, 10);
  assert.equal(cancelled.pausedDurationSeconds, 10);
  assertProjection(cancelled, 60_000, {
    focusedSeconds: 10, pausedSeconds: 10, remainingSeconds: 1490, progress: 10 / 1500,
  });
});

test('CR-T05: a pause at epoch zero is present, not missing', () => {
  const session = engine.pauseFocusSession(freshSession(), 0);
  assert.equal(session.status, 'paused');
  assert.equal(session.lastPausedAt, '1970-01-01T00:00:00.000Z');
  assertProjection(session, 60_000, {
    focusedSeconds: 0, pausedSeconds: 60, remainingSeconds: 1500, progress: 0,
  });
});

test('CR-T05 regression: resume accounts for an epoch-zero pause span', () => {
  const paused = engine.pauseFocusSession(freshSession(), 0);
  const resumed = engine.resumeFocusSession(paused, 60_000);
  assert.equal(resumed.status, 'active');
  assert.equal(resumed.pausedDurationSeconds, 60);
  assertProjection(resumed, 120_000, {
    focusedSeconds: 60, pausedSeconds: 60, remainingSeconds: 1440, progress: 0.04,
  });
});

test('CR-T06: zero duration is explicitly rejected', () => {
  assertValidationRejected(() => engine.createFocusSession(0, undefined, 0), 'INVALID_INPUT');
});

test('CR-T07: repeated complete then cancel preserves the terminal record', () => {
  const session = engine.completeFocusSession(freshSession(), 1_500_000);
  const snapshot = structuredClone(session);
  const repeated = engine.completeFocusSession(session, 3_000_000);
  const cancelled = engine.cancelFocusSession(repeated, 3_600_000);
  assert.deepEqual(repeated, snapshot);
  assert.deepEqual(cancelled, snapshot);
  assert.deepEqual(session, snapshot);
});

test('CR-T08: invalid startedAt must not produce a successful NaN projection', () => {
  const corrupt = { ...freshSession(), startedAt: 'invalid-date' };
  const snapshot = structuredClone(corrupt);
  assertValidationRejected(() => engine.projectFocusSession(corrupt, 60_000), 'INVALID_RECORD');
  assert.deepEqual(corrupt, snapshot, 'Invalid source must be preserved for recovery');
});

test('invalid durations and clocks reject explicitly, without a fabricated session', () => {
  for (const duration of [-1, NaN, Infinity, -Infinity, Number.MAX_VALUE, 0.001]) {
    assert.throws(() => engine.createFocusSession(duration, undefined, 0), /INVALID_INPUT/);
  }
  for (const now of [NaN, Infinity, 9e15]) {
    assert.throws(() => engine.createFocusSession(25, undefined, now), /INVALID_INPUT/);
    assert.throws(() => engine.projectFocusSession(freshSession(), now), /INVALID_INPUT/);
  }
});

test('malformed record fields reject before pause, cancel or completion', () => {
  for (const fields of [
    { status: 'unknown' }, { createdAt: 'bad' }, { plannedDurationSeconds: 0 },
    { focusedDurationSeconds: NaN }, { focusedDurationSeconds: 1501 },
    { pausedDurationSeconds: -1 }, { lastResumedAt: 'bad' },
    { status: 'paused', lastPausedAt: undefined }, { lastPausedAt: 'bad' },
  ]) {
    const corrupt = { ...freshSession(), ...fields };
    const original = structuredClone(corrupt);
    assert.throws(() => engine.projectFocusSession(corrupt, 60000), /INVALID_RECORD/);
    assert.throws(() => engine.completeFocusSession(corrupt, 60000), /INVALID_RECORD/);
    assert.throws(() => engine.cancelFocusSession(corrupt, 60000), /INVALID_RECORD/);
    assert.deepEqual(corrupt, original);
  }
});

test('paused early completion remains paused and can still be cancelled', () => {
  const paused = engine.pauseFocusSession(freshSession(), 60000);
  assert.equal(engine.completeFocusSession(paused, 120000), paused);
  assert.equal(engine.cancelFocusSession(paused, 120000).status, 'cancelled');
});

test('missing pause timestamp cannot be resumed as a successful transition', () => {
  assert.throws(() => engine.resumeFocusSession({ ...freshSession(), status: 'paused' }, 60000), /INVALID_RECORD/);
});

test('clock preceding latest event rejects without changing the record', () => {
  const paused = engine.pauseFocusSession(freshSession(), 60000);
  assert.throws(() => engine.resumeFocusSession(paused, 59000), /CLOCK_UNCERTAIN/);
  const resumed = engine.resumeFocusSession(paused, 120000);
  assert.throws(() => engine.completeFocusSession(resumed, 119000), /CLOCK_UNCERTAIN/);
  assert.equal(resumed.status, 'active');
});
