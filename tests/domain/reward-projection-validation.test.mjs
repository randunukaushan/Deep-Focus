import assert from 'node:assert/strict';
import test from 'node:test';

const { validateRewardProjection } = await import('../../supabase/functions/_shared/reward-projection-validation.ts');

const meta = { status: 'current', asOf: '2026-10-11T00:00:00.000Z', sourceSequence: '7', ruleVersion: 'reward-policy-v1' };
const summary = { totalXp: 12, level: 2, currentStreakDays: 2, longestStreakDays: 4, lastQualifyingDate: '2026-10-10', timeZone: 'Asia/Colombo', achievementCount: 1 };

test('reward projection accepts a typed available summary without calculating policy values', () => {
  assert.deepEqual(validateRewardProjection({ meta, summary }), { meta, summary });
});

test('unavailable reward projection is explicit and cannot fabricate zero values', () => {
  assert.deepEqual(validateRewardProjection({ meta: { status: 'unavailable', asOf: null, sourceSequence: null, ruleVersion: null }, summary: null }), { meta: { status: 'unavailable', asOf: null, sourceSequence: null, ruleVersion: null }, summary: null });
  assert.throws(() => validateRewardProjection({ meta: { status: 'unavailable', asOf: null, sourceSequence: null, ruleVersion: null }, summary: { ...summary, totalXp: 0 } }), /INVALID_REWARD_PROJECTION/);
});

test('reward projection rejects inconsistent streaks, dates, timezones and unsafe counts', () => {
  assert.throws(() => validateRewardProjection({ meta, summary: { ...summary, currentStreakDays: 5 } }), /current streak/);
  assert.throws(() => validateRewardProjection({ meta, summary: { ...summary, lastQualifyingDate: '2026-02-30' } }), /lastQualifyingDate/);
  assert.throws(() => validateRewardProjection({ meta, summary: { ...summary, timeZone: 'not-a-zone' } }), /timeZone/);
  assert.throws(() => validateRewardProjection({ meta, summary: { ...summary, totalXp: Number.MAX_SAFE_INTEGER + 1 } }), /totalXp/);
});
