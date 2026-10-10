/** Local PostgreSQL candidate for owner-bound ready snapshot metadata reads. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const DIGEST = /^[a-f0-9]{64}$/;
const MAX_POSTGRES_BIGINT = 9223372036854775807n;

type SnapshotMetadataRow = {
  owner_id: string;
  snapshot_id: string;
  contract_version: number;
  high_water: string | number;
  created_at: string;
  expires_at: string;
  page_count: number;
  manifest_digest: string;
  status: 'ready';
};

export type ReadySnapshotMetadata = {
  snapshotId: string;
  contractVersion: 1;
  highWater: string;
  createdAt: string;
  expiresAt: string;
  pageCount: number;
  manifestDigest: string;
  status: 'ready';
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function decimal(value: unknown): value is string {
  return typeof value === 'string' && DECIMAL.test(value) && BigInt(value) <= MAX_POSTGRES_BIGINT;
}

function metadataFromRow(row: SnapshotMetadataRow, expected: { ownerId: string; snapshotId: string }): ReadySnapshotMetadata {
  if (!row || row.owner_id !== expected.ownerId || row.snapshot_id !== expected.snapshotId
    || typeof row.snapshot_id !== 'string' || !UUID.test(row.snapshot_id)
    || row.contract_version !== 1 || !decimal(row.high_water)
    || !Number.isFinite(Date.parse(row.created_at)) || !Number.isFinite(Date.parse(row.expires_at))
    || Date.parse(row.expires_at) <= Date.parse(row.created_at)
    || !Number.isInteger(row.page_count) || row.page_count < 1
    || typeof row.manifest_digest !== 'string' || !DIGEST.test(row.manifest_digest)
    || row.status !== 'ready') unavailable();
  return {
    snapshotId: row.snapshot_id,
    contractVersion: 1,
    highWater: row.high_water,
    createdAt: new Date(row.created_at).toISOString(),
    expiresAt: new Date(row.expires_at).toISOString(),
    pageCount: row.page_count,
    manifestDigest: row.manifest_digest,
    status: 'ready',
  };
}

export async function readReadySnapshotMetadata(client: PostgresTransactionClient, input: {
  ownerId: string;
  snapshotId: string;
  now: string;
  sessionId: string;
}): Promise<ReadySnapshotMetadata | null> {
  if (!UUID.test(input.ownerId) || !UUID.test(input.snapshotId) || !Number.isFinite(Date.parse(input.now))) invalid();
  await recheckPostgresAppSession(client, input.ownerId, input.sessionId);
  const result = await client.query<SnapshotMetadataRow>(
    `select owner_id, snapshot_id, contract_version, high_water::text, created_at::text, expires_at::text,
            page_count, manifest_digest, status
     from df_private.sync_snapshots
     where owner_id = $1 and snapshot_id = $2 and status = 'ready'
       and expires_at > $3::timestamptz`,
    [input.ownerId, input.snapshotId, input.now],
  );
  return result.rows.length === 0 ? null : metadataFromRow(result.rows[0], input);
}

export function createPostgresSnapshotMetadataReader(input: { runner: PostgresTransactionRunner }): {
  read: (value: { ownerId: string; snapshotId: string; now: string; sessionId: string }) => Promise<ReadySnapshotMetadata | null>;
} {
  return { read: (value) => input.runner.withTransaction((client) => readReadySnapshotMetadata(client, value)) };
}
