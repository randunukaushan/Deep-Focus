import assert from 'node:assert/strict';
import test from 'node:test';

const { validateAnalyticsQuery } = await import('../../supabase/functions/_shared/analytics-query-validation.ts');

const QUERY = { start: '2026-10-01T00:00:00.000Z', end: '2026-10-02T00:00:00.000Z', timeZone: 'Asia/Colombo' };
const DAY = 24 * 60 * 60 * 1000;

test('analytics query requires exactly start, end and a valid IANA timezone', () => {
  assert.deepEqual(validateAnalyticsQuery(QUERY, DAY), { ...QUERY, startMs: Date.parse(QUERY.start), endMs: Date.parse(QUERY.end), rangeMs: DAY });
  assert.throws(() => validateAnalyticsQuery({ ...QUERY, extra: true }, DAY), /VALIDATION_FAILED/);
  assert.throws(() => validateAnalyticsQuery({ ...QUERY, timeZone: 'not/a-timezone' }, DAY), /VALIDATION_FAILED/);
});

test('analytics query enforces a half-open positive range and reviewed maximum', () => {
  assert.throws(() => validateAnalyticsQuery({ ...QUERY, start: QUERY.end }, DAY), /VALIDATION_FAILED/);
  assert.throws(() => validateAnalyticsQuery({ ...QUERY, end: '2026-10-03T00:00:00.000Z' }, DAY), /VALIDATION_FAILED/);
  assert.throws(() => validateAnalyticsQuery(QUERY, 0), /VALIDATION_FAILED/);
});

test('analytics validation preserves the requested timestamps without inventing freshness', () => {
  const result = validateAnalyticsQuery({ start: '2026-10-01T05:30:00+05:30', end: '2026-10-01T06:30:00+05:30', timeZone: 'Asia/Colombo' }, 2 * 60 * 60 * 1000);
  assert.equal(result.rangeMs, 60 * 60 * 1000);
  assert.equal(result.start, '2026-10-01T05:30:00+05:30');
  assert.equal(result.end, '2026-10-01T06:30:00+05:30');
});
