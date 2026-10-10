/**
 * Local PostgreSQL adapter candidate for the domain mutation transaction.
 *
 * The database client and operation applier are injected so this module cannot
 * create a connection, choose credentials, or write to a remote project by
 * itself. A reviewed server boundary must provide both dependencies.
 */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { DomainMutationStore, DomainMutationTransaction } from './domain-mutation-transaction.ts';
import type { MutationReceipt } from './mutation-guard.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';

export type PostgresQueryResult<Row extends Record<string, unknown> = Record<string, unknown>> = { rows: Row[] };

export type PostgresTransactionClient = {
  query: <Row extends Record<string, unknown> = Record<string, unknown>>(sql: string, params: readonly unknown[]) => Promise<PostgresQueryResult<Row>>;
};

export type PostgresTransactionRunner = {
  withTransaction: <T>(run: (client: PostgresTransactionClient) => Promise<T>) => Promise<T>;
};

export type PostgresMutationApplyInput = {
  actorId: string;
  operation: string;
  mutationId: string;
  requestSha256: string;
  body: Record<string, unknown> | null;
  resourceId?: string;
};

export type PostgresMutationApplyResult = {
  responseBody: Record<string, unknown>;
  responseStatus: number;
  /** Optional response completion that needs the committed sync sequence. */
  finalizeResponse?: (committedThrough: string) => Record<string, unknown>;
};

export type PostgresMutationApplier = (
  client: PostgresTransactionClient,
  input: PostgresMutationApplyInput,
) => Promise<PostgresMutationApplyResult>;

export type PostgresSyncChangeWriter = (client: PostgresTransactionClient, input: PostgresMutationApplyInput, applied: PostgresMutationApplyResult) => Promise<string>;

type ReceiptRow = {
  owner_id: string;
  operation: string;
  mutation_id: string;
  request_sha256: string;
  response_body: unknown;
  response_status: number;
};

function asReceipt(row: ReceiptRow, expected: { ownerId: string; operation: string; mutationId: string }): MutationReceipt {
  if (!row || row.owner_id !== expected.ownerId || row.operation !== expected.operation || row.mutation_id !== expected.mutationId
    || typeof row.owner_id !== 'string' || typeof row.operation !== 'string'
    || typeof row.mutation_id !== 'string' || typeof row.request_sha256 !== 'string'
    || !row.response_body || typeof row.response_body !== 'object' || Array.isArray(row.response_body)
    || !Number.isInteger(row.response_status)) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  return {
    ownerId: row.owner_id,
    operation: row.operation,
    mutationId: row.mutation_id,
    requestSha256: row.request_sha256,
    responseBody: row.response_body as Record<string, unknown>,
    responseStatus: row.response_status,
  };
}

export function createPostgresDomainMutationStore(input: {
  runner: PostgresTransactionRunner;
  applyMutation: PostgresMutationApplier;
  writeSyncChange?: PostgresSyncChangeWriter;
}): DomainMutationStore {
  return {
    withTransaction: async <T>(operation: (transaction: DomainMutationTransaction) => Promise<T>) => input.runner.withTransaction(async (client) => {
      const transaction: DomainMutationTransaction = {
        recheckSession: async (actorId, sessionId) => {
          await recheckPostgresAppSession(client, actorId, sessionId);
        },
        lockOwnerHead: async (actorId) => {
          const profile = await client.query<{ owner_id: string; account_state: string }>(
            `select owner_id, account_state
             from df_private.profiles
             where owner_id = $1 and account_state = 'active'
             for update`,
            [actorId],
          );
          if (profile.rows.length !== 1 || profile.rows[0]?.owner_id !== actorId || profile.rows[0]?.account_state !== 'active') {
            throw new SafeBoundaryError(403, 'ACCESS_DENIED');
          }
          const result = await client.query<{ owner_id: string }>(
            'select owner_id from df_private.sync_heads where owner_id = $1 for update',
            [actorId],
          );
          if (result.rows.length !== 1 || result.rows[0]?.owner_id !== actorId) {
            throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
          }
        },
        readReceipt: async (actorId, operationName, mutationId) => {
          const result = await client.query<ReceiptRow>(
            `select owner_id, operation, mutation_id, request_sha256, response_body, response_status
             from df_private.mutation_receipts
             where owner_id = $1 and operation = $2 and mutation_id = $3`,
            [actorId, operationName, mutationId],
          );
          return result.rows.length === 0 ? null : asReceipt(result.rows[0], { ownerId: actorId, operation: operationName, mutationId });
        },
        apply: async (mutation) => {
          const applied = await input.applyMutation(client, mutation);
          let responseBody = applied.responseBody;
          if (input.writeSyncChange) {
            const committedThrough = await input.writeSyncChange(client, mutation, applied);
            if (!/^\d+$/.test(committedThrough)) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
            if (applied.finalizeResponse) responseBody = applied.finalizeResponse(committedThrough);
          }
          return { ...applied, responseBody };
        },
        writeReceipt: async (receipt) => {
          const inserted = await client.query<{ owner_id: string; operation: string; mutation_id: string }>(
            `insert into df_private.mutation_receipts
             (owner_id, operation, mutation_id, request_sha256, response_body, response_status)
             values ($1, $2, $3, $4, $5::jsonb, $6)
             returning owner_id, operation, mutation_id`,
            [receipt.ownerId, receipt.operation, receipt.mutationId, receipt.requestSha256, JSON.stringify(receipt.responseBody), receipt.responseStatus],
          );
          if (inserted.rows.length !== 1 || inserted.rows[0]?.owner_id !== receipt.ownerId || inserted.rows[0]?.operation !== receipt.operation || inserted.rows[0]?.mutation_id !== receipt.mutationId) {
            throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
          }
        },
      };
      return operation(transaction);
    }),
  };
}
