/** One-client PostgreSQL adapter for the AI proposal apply coordinator. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { AiProposalApplyStore, AiProposalApplyTransaction } from './ai-proposal-apply-transaction.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresAiApplyReceiptTransaction } from './postgres-ai-apply-receipt-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresAiProposalTransaction } from './postgres-ai-proposal-adapter.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validRunner(value: unknown): value is PostgresTransactionRunner {
  return Boolean(value) && typeof value === 'object' && typeof (value as PostgresTransactionRunner).withTransaction === 'function';
}

export function createPostgresAiProposalApplyStore(input: { runner: PostgresTransactionRunner }): AiProposalApplyStore {
  if (!input || typeof input !== 'object' || !validRunner(input.runner)) throw new SafeBoundaryError(422, 'VALIDATION_FAILED');
  return {
    withOwnerTransaction: (ownerId, operation) => {
      if (typeof ownerId !== 'string' || !UUID.test(ownerId) || typeof operation !== 'function') throw new SafeBoundaryError(422, 'VALIDATION_FAILED');
      return input.runner.withTransaction(async (client: PostgresTransactionClient) => {
        const receipts = createPostgresAiApplyReceiptTransaction(client);
        const proposals = createPostgresAiProposalTransaction(client);
        const transaction: AiProposalApplyTransaction = {
          client,
          readReceiptByMutation: receipts.readByMutation,
          readReceiptByProposal: receipts.readByProposal,
          loadProposal: proposals.load,
          markProposalApplied: proposals.markApplied,
          writeReceipt: receipts.writeReceipt,
        };
        return operation(transaction);
      });
    },
  };
}
