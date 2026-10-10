import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import * as goalProgress from '../../src/features/goals/goal-progress.ts';
import * as goalPeriod from '../../src/features/goals/goal-period.ts';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('../../src/features/progress/progress-analytics.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const exports = {};
runInNewContext(outputText, { exports, require(name) {
  if (name === '@/features/goals/goal-progress') return goalProgress;
  if (name === '@/features/goals/goal-period') return goalPeriod;
  throw new Error(`Unexpected dependency: ${name}`);
} });
const { summarizeProgress } = exports;

const now = Date.parse('2026-10-07T12:00:00.000Z');
const session = (id, status, at, seconds) => ({
  id, status, plannedDurationSeconds: 300, focusedDurationSeconds: seconds, pausedDurationSeconds: 0,
  createdAt: at, startedAt: at, ...(status === 'completed' ? { completedAt: at } : { cancelledAt: at }),
});
const completed = session('done', 'completed', '2026-10-06T08:00:00.000Z', 120);
const cancelled = session('ended-early', 'cancelled', '2026-10-06T09:00:00.000Z', 60);
const task = { id: 'task', title: 'Read', status: 'completed', createdAt: '2026-10-06T07:00:00.000Z', updatedAt: '2026-10-06T08:00:00.000Z', completedAt: '2026-10-06T08:00:00.000Z' };
const goal = { id: 'goal', title: 'Focus', type: 'focus_time', period: 'weekly', status: 'active', targetValue: 600, startsAt: '2026-10-05T00:00:00.000Z', endsAt: '2026-10-12T00:00:00.000Z', periodTimeZone: 'UTC', createdAt: '2026-10-05T00:00:00.000Z', updatedAt: '2026-10-05T00:00:00.000Z' };
const summarize = (sessions = [completed, cancelled], tasks = [task], goals = [goal], options = {}) => summarizeProgress(sessions, tasks, goals, { window: 'week', now, timeZone: 'UTC', ...options });

test('weekly totals count actual cancelled focus time but only completed sessions as sessions', () => {
  const result = summarize();
  assert.equal(result.focusedSeconds, 180);
  assert.equal(result.completedSessions, 1);
  assert.equal(result.averageCompletedFocusSeconds, 120);
  assert.equal(result.completedTasks, 1);
  assert.equal(result.goals[0].currentValue, 180);
});

test('week window follows Monday in the selected timezone and excludes future and prior events', () => {
  const prior = session('prior', 'completed', '2026-10-04T18:29:59.000Z', 900);
  const future = session('future', 'completed', '2026-10-07T12:00:01.000Z', 900);
  const result = summarize([completed, cancelled, prior, future], [task, { ...task, id: 'future-task', completedAt: '2026-10-07T12:00:01.000Z' }], [goal], { timeZone: 'Asia/Colombo' });
  assert.equal(result.focusedSeconds, 180);
  assert.equal(result.completedSessions, 1);
  assert.equal(result.completedTasks, 1);
  assert.equal(result.goals[0].currentValue, 180);
  assert.deepEqual(Array.from(result.activityDays, (day) => day.date), ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11']);
  assert.equal(result.activityDays.find((day) => day.date === '2026-10-06').focusedSeconds, 180);
});

test('month and all windows apply inclusive start and exclude future terminal events', () => {
  const atMonthStart = session('month-start', 'completed', '2026-10-01T00:00:00.000Z', 30);
  const priorMonth = session('prior-month', 'completed', '2026-09-30T23:59:59.999Z', 40);
  const future = session('future', 'completed', '2026-11-01T00:00:00.000Z', 50);
  assert.equal(summarize([atMonthStart, priorMonth, future], [], [], { window: 'month' }).focusedSeconds, 30);
  assert.equal(summarize([atMonthStart, priorMonth, future], [], [], { window: 'all' }).focusedSeconds, 70);
});

test('duplicate identities are counted once only when their records agree; conflicts fail closed', () => {
  assert.equal(summarize([completed, { ...completed }], [task, { ...task }], []).focusedSeconds, 120);
  assert.equal(summarize([{ status: 'completed', id: 'ordered', focusedDurationSeconds: 2, completedAt: completed.completedAt }, { completedAt: completed.completedAt, focusedDurationSeconds: 2, id: 'ordered', status: 'completed' }], [], []).focusedSeconds, 2);
  assert.throws(() => summarize([completed, { ...completed, focusedDurationSeconds: 121 }]), /CONFLICTING_SESSION_ID/);
  assert.throws(() => summarize([completed], [task, { ...task, title: 'Changed' }], []), /CONFLICTING_TASK_ID/);
});

test('invalid timezones, invalid durations, invalid goals and unsafe time fail explicitly', () => {
  assert.throws(() => summarize([session('bad', 'cancelled', '2026-10-06T00:00:00.000Z', -1)], [], []), /INVALID_SESSION/);
  assert.throws(() => summarize([{ ...completed, completedAt: 'bad timestamp' }], [], []), /INVALID_SESSION/);
  assert.throws(() => summarize([], [{ ...task, completedAt: 'bad timestamp' }], []), /INVALID_TASK/);
  assert.throws(() => summarize([], [], [{ ...goal, targetValue: 0 }]), /INVALID_GOAL/);
  assert.throws(() => summarize([], [], [], { timeZone: 'Not/A_Zone' }), /INVALID_TIME_ZONE/);
  assert.throws(() => summarize([], [], [], { now: Number.NaN }), /INVALID_TIME/);
});
