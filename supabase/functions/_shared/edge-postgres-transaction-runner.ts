/**
 * Adapts one Edge-runtime Postgres pool connection to the server-only
 * transaction contract. The caller owns pool creation and all credentials.
 */

import type { PostgresQueryResult, PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';

type QueryResult<Row extends Record<string, unknown> = Record<string, unknown>> = { rows: Row[] };

type EdgeTransaction = {
  begin: () => Promise<void>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
  queryObject: <Row extends Record<string, unknown> = Record<string, unknown>>(sql: string, params?: readonly unknown[]) => Promise<QueryResult<Row>>;
};

export type EdgePostgresConnection = {
  createTransaction: (name: string, options?: { isolation_level?: 'read_committed' | 'repeatable_read' | 'serializable' }) => EdgeTransaction;
  release: () => void;
};

export type EdgePostgresPool = {
  connect: () => Promise<EdgePostgresConnection>;
};

function unavailable(): never { throw new Error('EDGE_POSTGRES_UNAVAILABLE'); }

function validPool(value: unknown): value is EdgePostgresPool {
  return Boolean(value) && typeof value === 'object' && typeof (value as EdgePostgresPool).connect === 'function';
}

function validTransaction(value: unknown): value is EdgeTransaction {
  return Boolean(value) && typeof value === 'object'
    && typeof (value as EdgeTransaction).begin === 'function'
    && typeof (value as EdgeTransaction).commit === 'function'
    && typeof (value as EdgeTransaction).rollback === 'function'
    && typeof (value as EdgeTransaction).queryObject === 'function';
}

/**
 * Every callback receives one pinned database connection. A failed callback is
 * rolled back before the connection is returned to the pool; a rollback error
 * never replaces the original application failure.
 */
export function createEdgePostgresTransactionRunner(input: { pool: EdgePostgresPool }): PostgresTransactionRunner {
  if (!input || typeof input !== 'object' || !validPool(input.pool)) unavailable();
  return {
    withTransaction: async <T>(run: (client: PostgresTransactionClient) => Promise<T>): Promise<T> => {
      if (typeof run !== 'function') unavailable();
      const connection = await input.pool.connect();
      if (!connection || typeof connection.createTransaction !== 'function' || typeof connection.release !== 'function') unavailable();
      const transaction = connection.createTransaction('deep_focus_gateway', { isolation_level: 'serializable' });
      if (!validTransaction(transaction)) {
        connection.release();
        unavailable();
      }
      let committed = false;
      try {
        await transaction.begin();
        const result = await run({
          query: async <Row extends Record<string, unknown> = Record<string, unknown>>(sql: string, params: readonly unknown[] = []): Promise<PostgresQueryResult<Row>> => {
            const queryResult = await transaction.queryObject<Row>(sql, params);
            if (!queryResult || !Array.isArray(queryResult.rows)) unavailable();
            return { rows: queryResult.rows };
          },
        });
        await transaction.commit();
        committed = true;
        return result;
      } catch (error) {
        if (!committed) {
          try { await transaction.rollback(); } catch { /* Preserve the original failure. */ }
        }
        throw error;
      } finally {
        connection.release();
      }
    },
  };
}
