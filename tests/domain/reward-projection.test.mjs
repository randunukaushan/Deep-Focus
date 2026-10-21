import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync(new URL('../../src/features/progress/reward-projection.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const exports = {};
runInNewContext(outputText, { exports, Date });
const { deriveLocalAchievementProjection } = exports;

function session(id, status, at, seconds) {
  return { id, status, plannedDurationSeconds: 1800, focusedDurationSeconds: seconds, pausedDurationSeconds: 0, createdAt: at, startedAt: at, ...(status === 'completed' ? { completedAt: at } : { cancelledAt: at }) };
}

test('existing milestones are derived from durable completed sessions only', () => {
  const sessions = [session('one', 'completed', '2026-10-01T01:00:00.000Z', 1200), ...Array.from({ length: 4 }, (_, index) => session(`more-${index}`, 'completed', `2026-10-0${2 + index}T01:00:00.000Z`, 600)), session('cancelled', 'cancelled', '2026-10-10T01:00:00.000Z', 3600)];
  assert.deepEqual(Array.from(deriveLocalAchievementProjection(sessions), (item) => [item.id, item.unlocked]), [['first_focus_session', true], ['five_focus_sessions', true], ['one_hour_focus', true]]);
});

test('empty and duplicate reads do not create a new reward side effect', () => {
  const one = session('one', 'completed', '2026-10-01T01:00:00.000Z', 1200);
  const first = deriveLocalAchievementProjection([one]);
  const replay = deriveLocalAchievementProjection([one, { ...one }]);
  assert.deepEqual(Array.from(replay, (item) => [item.id, item.unlockedAt]), Array.from(first, (item) => [item.id, item.unlockedAt]));
});
