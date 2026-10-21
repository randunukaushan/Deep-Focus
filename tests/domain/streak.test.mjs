import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync(new URL('../../src/features/progress/streak.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const exports = {};
runInNewContext(outputText, { exports, Intl, Date });
const { calculateStreak } = exports;

function completed(id, at) {
  return { id, status: 'completed', plannedDurationSeconds: 1500, focusedDurationSeconds: 1200, pausedDurationSeconds: 0, createdAt: at, startedAt: at, completedAt: at };
}

test('streak counts one local day once and preserves longest run after a missed day', () => {
  const sessions = [
    completed('a', '2026-10-05T02:00:00.000Z'),
    completed('b', '2026-10-05T08:00:00.000Z'),
    completed('c', '2026-10-06T02:00:00.000Z'),
    completed('d', '2026-10-08T02:00:00.000Z'),
  ];
  const result = calculateStreak(sessions, { now: Date.parse('2026-10-08T12:00:00.000Z'), timeZone: 'Asia/Colombo' });
  assert.deepEqual(Array.from(result.qualifyingDates), ['2026-10-05', '2026-10-06', '2026-10-08']);
  assert.equal(result.currentStreakDays, 1);
  assert.equal(result.longestStreakDays, 2);
});

test('streak uses the local calendar boundary and ignores cancelled/future activity', () => {
  const sessions = [
    completed('before-midnight', '2026-10-06T18:29:59.000Z'),
    completed('after-midnight', '2026-10-06T18:30:01.000Z'),
    { ...completed('cancelled', '2026-10-07T02:00:00.000Z'), status: 'cancelled', completedAt: undefined, cancelledAt: '2026-10-07T02:00:00.000Z' },
    completed('future', '2026-10-09T02:00:00.000Z'),
  ];
  const result = calculateStreak(sessions, { now: Date.parse('2026-10-07T12:00:00.000Z'), timeZone: 'Asia/Colombo' });
  assert.deepEqual(Array.from(result.qualifyingDates), ['2026-10-06', '2026-10-07']);
  assert.equal(result.currentStreakDays, 2);
});

test('replayed identical terminal records are idempotent and conflicting duplicates fail closed', () => {
  const session = completed('same', '2026-10-07T02:00:00.000Z');
  assert.equal(calculateStreak([session, { ...session }], { now: Date.parse('2026-10-07T12:00:00.000Z'), timeZone: 'UTC' }).currentStreakDays, 1);
  assert.throws(() => calculateStreak([session, { ...session, focusedDurationSeconds: 900 }], { now: Date.parse('2026-10-07T12:00:00.000Z'), timeZone: 'UTC' }), /CONFLICTING_SESSION_ID/);
});
