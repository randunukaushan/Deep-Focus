/** Server-only app-session revoke plus durable provider-revocation outbox contract. */

import type { AppSessionRecord, AppSessionMutation } from './app-session.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { revokeAppSession } from './app-session.ts';

export type SessionRevocationOutbox = {
  loadSession: (ownerId: string, sessionId: string) => Promise<AppSessionRecord | null>;
  revokeSession: (input: { ownerId: string; sessionId: string; revokedAt: string }) => Promise<void>;
  enqueueProviderRevocation: (input: { revocationId: string; ownerId: string; sessionId: string }) => Promise<'created' | 'existing'>;
};

export type SessionRevocationTransactionStore = {
  withTransaction: <T>(operation: (store: SessionRevocationOutbox) => Promise<T>) => Promise<T>;
};

export type RevocationResult = AppSessionMutation & {
  outbox: 'created' | 'existing' | 'not_queued';
};

export async function revokeAndQueueProviderRevocation(input: {
  verifiedOwnerId: string;
  sessionId: string;
  revocationId: string;
  now: string;
  store: SessionRevocationTransactionStore;
}): Promise<RevocationResult> {
  return input.store.withTransaction(async (transaction) => {
    const record = await transaction.loadSession(input.verifiedOwnerId, input.sessionId);
    const mutation = revokeAppSession({ verifiedOwnerId: input.verifiedOwnerId, record, now: input.now });
    if (!mutation.ok) return { ...mutation, outbox: 'not_queued' };
    const outbox = await transaction.enqueueProviderRevocation({
      revocationId: input.revocationId,
      ownerId: mutation.record.ownerId,
      sessionId: mutation.record.sessionId,
    });
    await transaction.revokeSession({ ownerId: mutation.record.ownerId, sessionId: mutation.record.sessionId, revokedAt: mutation.record.revokedAt as string });
    return { ...mutation, outbox };
  });
}
