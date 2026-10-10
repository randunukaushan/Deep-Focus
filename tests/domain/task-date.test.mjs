import assert from 'node:assert/strict';
import test from 'node:test';
import { register } from 'node:module';

register('../helpers/local-database-loader.mjs', import.meta.url);
const { parseTaskDueDate, formatTaskDueDate } = await import('../../src/features/tasks/task-date.ts');

test('task date input stores a date-only deadline as UTC midnight', () => {
  assert.deepEqual(parseTaskDueDate('2026-10-20'), { valid: true, dueAt: '2026-10-20T00:00:00.000Z' });
});

test('task date input rejects malformed and impossible calendar dates', () => {
  assert.deepEqual(parseTaskDueDate('2026-02-29'), { valid: false });
  assert.deepEqual(parseTaskDueDate('20/10/2026'), { valid: false });
  assert.deepEqual(parseTaskDueDate('2026-13-01'), { valid: false });
  assert.deepEqual(parseTaskDueDate('2024-02-29'), { valid: true, dueAt: '2024-02-29T00:00:00.000Z' });
});

test('unchanged legacy deadline preserves its exact timestamp; blank input clears it', () => {
  const existing = '2026-10-20T12:34:56.000Z';
  assert.deepEqual(parseTaskDueDate('2026-10-20', existing), { valid: true });
  assert.deepEqual(parseTaskDueDate('', existing), { valid: true, dueAt: null });
  assert.deepEqual(parseTaskDueDate('', undefined), { valid: true });
});

test('deadline display formats the stored UTC calendar date with the user locale', () => {
  assert.equal(formatTaskDueDate('2026-10-20T00:00:00.000Z'), new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date('2026-10-20T00:00:00.000Z')));
});
