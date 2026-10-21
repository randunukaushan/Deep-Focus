/** Local PostgreSQL owner lookup for gateway preflight authorization. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { GatewayAuthorizationStore, OwnedResourceKind } from './gateway-authorization.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TABLES: Record<OwnedResourceKind, string> = {
  workspace: 'workspaces',
  task: 'tasks',
  goal: 'goals',
  session: 'focus_sessions',
  reminder: 'task_reminders',
  plan: 'ai_plans',
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function requireClient(value: unknown): asserts value is { query: (sql: string, params?: unknown[]) => Promise<unknown> } {
  if (!value || typeof value !== 'object' || typeof (value as { query?: unknown }).query !== 'function') dependencyFailure();
}

function validRunner(value: unknown): value is PostgresTransactionRunner {
  return Boolean(value) && typeof value === 'object' && typeof (value as PostgresTransactionRunner).withTransaction === 'function';
}

/**
 * This is a preflight lookup only. Mutation appliers still repeat ownership
 * checks inside their own transaction, so a lookup cannot become authority by
 * itself if the row changes between authorization and execution.
 */
export function createPostgresGatewayAuthorizationStore(input: { runner: PostgresTransactionRunner }): GatewayAuthorizationStore {
  if (!input || typeof input !== 'object' || !validRunner(input.runner)) invalid();
  return {
    loadOwnerId: async (kind, id) => {
      if (!Object.prototype.hasOwnProperty.call(TABLES, kind) || typeof id !== 'string' || !UUID.test(id)) invalid();
      const table = TABLES[kind];
      return input.runner.withTransaction(async (client) => {
        requireClient(client);
        const result = await client.query(`select id, owner_id from df_private.${table} where id = $1`, [id]) as { rows?: unknown };
        if (!result || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) dependencyFailure();
        if (result.rows.length === 0) return null;
        if (result.rows.length !== 1 || result.rows[0]?.id !== id || typeof result.rows[0]?.owner_id !== 'string' || !UUID.test(result.rows[0].owner_id)) dependencyFailure();
        return result.rows[0].owner_id;
      });
    },
  };
}
