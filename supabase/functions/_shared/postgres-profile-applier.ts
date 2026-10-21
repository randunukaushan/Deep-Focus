/** Local PostgreSQL candidate for the owner-bound profile update operation. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresMutationApplyInput, PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }

function version(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 1 || (value as number) > 2147483647) invalid();
  return value as number;
}

export async function applyPatchMe(client: PostgresTransactionClient, input: PostgresMutationApplyInput): Promise<{ responseBody: Record<string, unknown>; responseStatus: 200 }> {
  if (!isRecord(client) || typeof client.query !== 'function') unavailable();
  if (!isRecord(input) || input.operation !== 'patchMe' || !isRecord(input.body) || !isUuid(input.actorId)) invalid();
  const body = input.body as Record<string, unknown>;
  if (Object.keys(body).some((key) => !['expectedVersion', 'displayName'].includes(key))
    || !Object.prototype.hasOwnProperty.call(body, 'expectedVersion')
    || !Object.prototype.hasOwnProperty.call(body, 'displayName')) invalid();
  const expectedVersion = version(body.expectedVersion);
  if (typeof body.displayName !== 'string' || body.displayName.length < 1 || body.displayName.length > 100 || !/\S/.test(body.displayName)) invalid();

  const result = await client.query<{ owner_id: string; display_name: string; account_state: string; version: number }>(
    `update df_private.profiles
     set display_name = $3, version = version + 1, updated_at = now()
     where owner_id = $1 and account_state = 'active' and version = $2
     returning owner_id, display_name, account_state, version`,
    [input.actorId, expectedVersion, body.displayName],
  );
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) unavailable();
  if (result.rows.length > 1) unavailable();
  const row = result.rows[0];
  if (!row) throw new SafeBoundaryError(409, 'VERSION_CONFLICT');
  if (row.owner_id !== input.actorId || typeof row.display_name !== 'string' || row.account_state !== 'active' || !Number.isInteger(row.version) || row.version < 1) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  return { responseBody: { id: row.owner_id, displayName: row.display_name, accountState: row.account_state, version: row.version }, responseStatus: 200 };
}
