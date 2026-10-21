/** Builds a deterministic, non-executing manifest from local SQL migration text. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { assertMigrationReceipt, type MigrationReceipt } from './migration-receipt-validation.ts';

const NAME = /^([0-9]{14}_[a-z0-9_]{1,96})\.sql$/;
// Migration candidates are intentionally additive. Keep this conservative:
// ownership-policy clauses such as `ON DELETE RESTRICT` and RLS DELETE policies
// are valid, but schema/data removal or ALTER ... DROP must be rejected before
// a caller-supplied transaction is opened. Existing additive contract migrations
// may deliberately replace a constraint, so DROP CONSTRAINT is not blanket-
// rejected here; it remains covered by the migration's own contract tests.
const DESTRUCTIVE = /\b(?:drop\s+(?:schema|table|type|column)|truncate(?:\s+table)?|delete\s+from|alter\s+table\s+(?:if\s+exists\s+)?[a-z0-9_."]+\s+drop\s+column)\b/i;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }

function isInputObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Validates structure and returns sorted receipts; it never runs or writes SQL. */
export async function buildMigrationManifest(input: {
  files: { name: string; text: string }[];
  schemaVersion: number;
  appliedBy?: MigrationReceipt['appliedBy'];
}): Promise<MigrationReceipt[]> {
  if (!isInputObject(input)) invalid();
  const appliedBy = input.appliedBy ?? 'manual_review';
  if (!Array.isArray(input.files) || input.files.length === 0 || input.files.length > 500
    || !Number.isSafeInteger(input.schemaVersion) || input.schemaVersion < 1
    || !['migration_runner', 'manual_review'].includes(appliedBy)) invalid();
  const names = new Set<string>();
  const results: MigrationReceipt[] = [];
  for (const file of input.files) {
    if (!file || typeof file.name !== 'string' || typeof file.text !== 'string') invalid();
    const match = NAME.exec(file.name);
    if (!match || names.has(match[1]) || !/\bbegin\s*;/i.test(file.text) || !/commit\s*;\s*$/i.test(file.text) || DESTRUCTIVE.test(file.text)) invalid();
    names.add(match[1]);
    const receipt = { migrationId: match[1], checksumSha256: await sha256(file.text), schemaVersion: input.schemaVersion, appliedBy } as MigrationReceipt;
    assertMigrationReceipt(receipt);
    results.push(receipt);
  }
  return results.sort((left, right) => left.migrationId.localeCompare(right.migrationId));
}
