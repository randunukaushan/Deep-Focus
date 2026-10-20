import assert from 'node:assert/strict';
import test from 'node:test';
import { isPlanningDate, localPlanningDate, nextPlanningDate, summarizeTaskPlan, validTaskPlanning } from '../../src/features/tasks/task-planning.ts';

test('planning dates and optional estimates validate without changing deadlines', () => {
  assert.equal(isPlanningDate('2028-02-29'), true);
  for (const value of ['2026-02-29', '2026-13-01', '2026-1-01', 'bad', null]) assert.equal(isPlanningDate(value), false);
  assert.equal(nextPlanningDate('2026-12-31'), '2027-01-01');
  assert.equal(localPlanningDate(new Date(2026, 9, 19, 23, 55)), '2026-10-19');
  assert.equal(validTaskPlanning({}), true);
  for (const estimatedMinutes of [1, 25, 480]) assert.equal(validTaskPlanning({ estimatedMinutes }), true);
  for (const estimatedMinutes of [0, -1, 481, 1.5, NaN, '25', null]) assert.equal(validTaskPlanning({ estimatedMinutes }), false);
});

test('plan summaries use planned dates, exclude archived/cancelled, and distinguish unknown estimates', () => {
  const tasks = [
    { id: 'old', status: 'pending', plannedDate: '2026-10-18', estimatedMinutes: 25 },
    { id: 'unscheduled', status: 'pending', dueAt: '2026-11-01T00:00:00.000Z' },
    { id: 'done', status: 'completed', plannedDate: '2026-10-19', estimatedMinutes: 45 },
    { id: 'later', status: 'pending', plannedDate: '2026-10-20', estimatedMinutes: 60 },
    { id: 'archived', status: 'pending', archivedAt: '2026-10-19T00:00:00.000Z' },
    { id: 'cancelled', status: 'cancelled' },
  ];
  const today = summarizeTaskPlan(tasks, 'today', '2026-10-19');
  assert.deepEqual(today.tasks.map(task => task.id), ['old', 'unscheduled', 'done']);
  assert.equal(today.pendingCount, 2);
  assert.equal(today.completedCount, 1);
  assert.equal(today.estimatedMinutes, 25);
  assert.equal(today.unestimatedCount, 1);
  const upcoming = summarizeTaskPlan(tasks, 'upcoming', '2026-10-19');
  assert.equal(upcoming.pendingCount, 1);
  assert.equal(upcoming.estimatedMinutes, 60);
});
