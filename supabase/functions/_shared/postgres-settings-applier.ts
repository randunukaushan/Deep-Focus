/** Local owner-bound PostgreSQL candidate for account settings updates. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresMutationApplyInput, PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';

const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const THEMES = new Set(['system', 'light', 'dark']);
const ALLOWED = new Set(['expectedVersion', 'theme', 'uiLocale', 'defaultFocusDurationMinutes', 'defaultBreakDurationMinutes', 'aiFeaturesEnabled']);

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function version(value: unknown): number { if (!Number.isSafeInteger(value) || (value as number) < 1 || (value as number) > 2147483647) invalid(); return value as number; }
function settingsRow(row: Record<string, unknown>, ownerId: string): Record<string, unknown> {
  if (row.owner_id !== ownerId || typeof row.id !== 'string' || typeof row.theme !== 'string' || !THEMES.has(row.theme)
    || typeof row.ui_locale !== 'string' || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(row.ui_locale)
    || !Number.isSafeInteger(row.default_focus_duration_minutes) || (row.default_focus_duration_minutes as number) < 1 || (row.default_focus_duration_minutes as number) > 1440
    || ![5, 10, 15].includes(row.default_break_duration_minutes as number) || typeof row.ai_features_enabled !== 'boolean'
    || !Number.isInteger(row.version) || (row.version as number) < 1 || typeof row.updated_at !== 'string' || !INSTANT.test(row.updated_at) || Number.isNaN(Date.parse(row.updated_at))) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  return { id: row.id, version: row.version, theme: row.theme, uiLocale: row.ui_locale, defaultFocusDurationMinutes: row.default_focus_duration_minutes, defaultBreakDurationMinutes: row.default_break_duration_minutes, aiFeaturesEnabled: row.ai_features_enabled, updatedAt: row.updated_at };
}

export async function applyPatchSettings(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 200 }> {
  if (input.operation !== 'patchSettings' || !input.body || Array.isArray(input.body)) invalid();
  const body = input.body as Record<string, unknown>;
  if (Object.keys(body).some((key) => !ALLOWED.has(key)) || !Object.prototype.hasOwnProperty.call(body, 'expectedVersion') || Object.keys(body).length < 2) invalid();
  const expectedVersion = version(body.expectedVersion);
  const params: unknown[] = [input.actorId, expectedVersion];
  const updates: string[] = [];
  const add = (column: string, value: unknown) => { params.push(value); updates.push(`${column} = $${params.length}`); };
  if ('theme' in body) { if (typeof body.theme !== 'string' || !THEMES.has(body.theme)) invalid(); add('theme', body.theme); }
  if ('uiLocale' in body) { if (typeof body.uiLocale !== 'string' || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(body.uiLocale)) invalid(); add('ui_locale', body.uiLocale); }
  if ('defaultFocusDurationMinutes' in body) { if (!Number.isSafeInteger(body.defaultFocusDurationMinutes) || (body.defaultFocusDurationMinutes as number) < 1 || (body.defaultFocusDurationMinutes as number) > 1440) invalid(); add('default_focus_duration_minutes', body.defaultFocusDurationMinutes); }
  if ('defaultBreakDurationMinutes' in body) { if (![5, 10, 15].includes(body.defaultBreakDurationMinutes as number)) invalid(); add('default_break_duration_minutes', body.defaultBreakDurationMinutes); }
  if ('aiFeaturesEnabled' in body) { if (typeof body.aiFeaturesEnabled !== 'boolean') invalid(); add('ai_features_enabled', body.aiFeaturesEnabled); }
  if (updates.length === 0) invalid();
  updates.push('version = version + 1', 'updated_at = now()');
  const result = await client.query(
    `update df_private.user_settings set ${updates.join(', ')}
     where owner_id = $1 and version = $2
     returning id, owner_id, theme, ui_locale, default_focus_duration_minutes, default_break_duration_minutes, ai_features_enabled, version, updated_at`,
    params,
  );
  const row = result.rows[0];
  if (!row) throw new SafeBoundaryError(409, 'VERSION_CONFLICT');
  return { responseBody: { data: settingsRow(row, input.actorId) }, responseStatus: 200 };
}
