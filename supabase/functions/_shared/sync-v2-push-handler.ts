/** Local, review-gated HTTP-shaped V2 push boundary. It is not router-wired. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { admitGatewayRequest } from './gateway-admission.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { publicBoundaryError, SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { executeSyncV2Push, type V2PushExecution, type V2PushEpochReader } from './sync-v2-push-orchestrator.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { hashGatewayMutation } from './gateway-mutation-hash.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { executeV2PushWithBatchReceipt, type V2BatchReceiptStore } from './sync-v2-batch-receipt.ts';

export type SyncV2PushHttpResult =
  | { status: 200; body: { data: { contractVersion: 2; privacyEpoch: string; outcomes: unknown[] } } }
  | { status: number; body: { error: { code: string; retryable: boolean } } };

/**
 * Reuses the common request-size/content-type/idempotency admission, then
 * delegates semantic and epoch checks to the isolated V2 orchestration layer.
 * Authentication is intentionally outside this candidate: `ownerId` must be
 * the already verified server-side actor, never a request field.
 */
export async function handleSyncV2PushRequest(input: {
  ownerId: string;
  headers: Record<string, string | undefined>;
  bodyText?: string;
  now: string;
  batchReceiptStore: V2BatchReceiptStore;
  readCurrentEpoch: V2PushEpochReader;
  executeItem: V2PushExecution;
}): Promise<SyncV2PushHttpResult> {
  try {
    const request = admitGatewayRequest({
      method: 'POST', path: '/v1/replication/v2/push', actorId: input.ownerId,
      headers: input.headers, bodyText: input.bodyText,
      allowedBodyKeys: ['contractVersion', 'privacyEpoch', 'items'],
    });
    if (!request.body) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
    if (!request.idempotencyKey) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
    const requestSha256 = await hashGatewayMutation({ operation: 'pushSyncV2', path: '/v1/replication/v2/push', body: request.body });
    const result = await executeV2PushWithBatchReceipt({
      ownerId: input.ownerId, batchId: request.idempotencyKey, requestSha256, createdAt: input.now, store: input.batchReceiptStore,
      execute: async () => ({ responseBody: await executeSyncV2Push({ ownerId: input.ownerId, value: request.body!, readCurrentEpoch: input.readCurrentEpoch, executeItem: input.executeItem }), responseStatus: 200 }),
    });
    return { status: 200, body: result.responseBody as Extract<SyncV2PushHttpResult, { status: 200 }>['body'] };
  } catch (error) {
    return publicBoundaryError(error) as SyncV2PushHttpResult;
  }
}
