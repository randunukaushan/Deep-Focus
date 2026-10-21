import test from 'node:test';
import assert from 'node:assert/strict';

const { validatePlanGenerationInput } = await import('../../supabase/functions/_shared/ai-plan-generation-validation.ts');

const ID = '11111111-1111-4111-8111-111111111111';
const TASK = '22222222-2222-4222-8222-222222222222';
const BASE = { requestId: ID, taskIds: [TASK], availableStart: '2026-10-11T08:00:00.000Z', availableEnd: '2026-10-11T12:00:00.000Z', timeZone: 'Asia/Colombo', preferences: { defaultFocusMinutes: 25, defaultBreakMinutes: 5, reminderLeadMinutes: null } };

test('accepts the exact bounded generation input and returns a safe typed copy', () => {
  const result = validatePlanGenerationInput(BASE);
  assert.deepEqual(result, BASE);
  assert.notEqual(result, BASE);
  assert.notEqual(result.preferences, BASE.preferences);
});

test('accepts explicit zero break and reminder preferences', () => {
  assert.equal(validatePlanGenerationInput({ ...BASE, preferences: { defaultFocusMinutes: 1, defaultBreakMinutes: 0, reminderLeadMinutes: 0 } }).preferences.defaultBreakMinutes, 0);
});

test('rejects sparse task ID arrays before creating a generation request', () => {
  const sparse = [];
  sparse.length = 1;
  assert.throws(() => validatePlanGenerationInput({ ...BASE, taskIds: sparse }), /VALIDATION_FAILED/);
});

for (const [name, change] of [
  ['rejects unknown fields', (v) => ({ ...v, provider: 'openai' })],
  ['rejects duplicate task IDs', (v) => ({ ...v, taskIds: [TASK, TASK] })],
  ['rejects empty task IDs', (v) => ({ ...v, taskIds: [] })],
  ['rejects non-millisecond or offset instants', (v) => ({ ...v, availableStart: '2026-10-11T08:00:00Z' })],
  ['rejects reversed or overlong windows', (v) => ({ ...v, availableEnd: '2026-10-13T09:00:00.000Z' })],
  ['rejects invalid IANA zones', (v) => ({ ...v, timeZone: 'Not/AZone' })],
  ['rejects string preferences', (v) => ({ ...v, preferences: { ...v.preferences, defaultFocusMinutes: '25' } })],
  ['rejects negative preferences', (v) => ({ ...v, preferences: { ...v.preferences, defaultBreakMinutes: -1 } })],
  ['rejects unsafe integer preferences', (v) => ({ ...v, preferences: { ...v.preferences, defaultFocusMinutes: Number.MAX_SAFE_INTEGER + 1 } })],
]) {
  test(name, () => assert.throws(() => validatePlanGenerationInput(change(BASE)), /VALIDATION_FAILED/));
}
