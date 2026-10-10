import assert from 'node:assert/strict';
import test from 'node:test';

const { applyPatchSettings } = await import('../../supabase/functions/_shared/postgres-settings-applier.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SETTINGS = '77777777-7777-4777-8777-777777777777';
const MUTATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);

function input(body) { return { actorId: OWNER, operation: 'patchSettings', mutationId: MUTATION, requestSha256: HASH, body }; }
const row = { id: SETTINGS, owner_id: OWNER, theme: 'dark', ui_locale: 'si', default_focus_duration_minutes: 45, default_break_duration_minutes: 10, ai_features_enabled: false, version: 2, updated_at: '2026-10-11T00:00:00.000Z' };

test('patchSettings updates allowlisted preferences with optimistic versioning', async () => {
  let call;
  const result = await applyPatchSettings({ query: async (sql, params) => { call = { sql, params }; return { rows: [row] }; } }, input({ expectedVersion: 1, theme: 'dark', uiLocale: 'si', defaultFocusDurationMinutes: 45, defaultBreakDurationMinutes: 10 }));
  assert.deepEqual(result, { responseBody: { data: { id: SETTINGS, version: 2, theme: 'dark', uiLocale: 'si', defaultFocusDurationMinutes: 45, defaultBreakDurationMinutes: 10, aiFeaturesEnabled: false, updatedAt: '2026-10-11T00:00:00.000Z' } }, responseStatus: 200 });
  assert.match(call.sql, /update df_private\.user_settings set/);
  assert.deepEqual(call.params, [OWNER, 1, 'dark', 'si', 45, 10]);
});

test('patchSettings rejects unknown/invalid input and stale or foreign rows', async () => {
  let calls = 0;
  const client = { query: async () => { calls += 1; return { rows: [] }; } };
  await assert.rejects(applyPatchSettings(client, input({ expectedVersion: 1, ownerId: OWNER })), /VALIDATION_FAILED/);
  await assert.rejects(applyPatchSettings(client, input({ expectedVersion: 1, defaultBreakDurationMinutes: 7 })), /VALIDATION_FAILED/);
  await assert.rejects(applyPatchSettings(client, input({ expectedVersion: 1, theme: 'dark' })), /VERSION_CONFLICT/);
  assert.equal(calls, 1);
});
