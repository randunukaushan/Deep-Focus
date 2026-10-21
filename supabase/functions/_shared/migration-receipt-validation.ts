/** Fail-closed validation for versioned migration identity/checksum receipts. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const MIGRATION_ID = /^[0-9]{14}_[a-z0-9_]{1,96}$/;
const SHA256 = /^[a-f0-9]{64}$/;

export type MigrationReceipt = {
  migrationId: string;
  checksumSha256: string;
  schemaVersion: number;
  appliedBy: 'migration_runner' | 'manual_review';
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }

export function validateMigrationReceipt(value: unknown): value is MigrationReceipt {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const receipt = value as Partial<MigrationReceipt>;
  const keys = Object.keys(receipt);
  return keys.every((key) => ['migrationId', 'checksumSha256', 'schemaVersion', 'appliedBy'].includes(key))
    && typeof receipt.migrationId === 'string' && MIGRATION_ID.test(receipt.migrationId)
    && typeof receipt.checksumSha256 === 'string' && SHA256.test(receipt.checksumSha256)
    && Number.isSafeInteger(receipt.schemaVersion) && (receipt.schemaVersion as number) > 0
    && ['migration_runner', 'manual_review'].includes(String(receipt.appliedBy));
}

export function assertMigrationReceipt(value: unknown): asserts value is MigrationReceipt {
  if (!validateMigrationReceipt(value)) invalid();
}
