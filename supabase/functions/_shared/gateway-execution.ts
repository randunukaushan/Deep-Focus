/** Server-only domain handler execution boundary. No handler is a database adapter by itself. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { publicBoundaryError, safeBoundaryLog, SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { hashGatewayMutation } from './gateway-mutation-hash.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isBoundedJsonResponse } from './json-response-boundary.ts';
import type { GatewayOperation } from './gateway-router.ts';
import type { AdmittedGatewayOperation } from './gateway-operation.ts';

export type GatewayHandlerContext = {
  actorId: string;
  sessionId?: string;
  operation: GatewayOperation;
  resourceId?: string;
  idempotencyKey?: string;
  requestId?: string;
  requestSha256: string;
  body: Record<string, unknown> | null;
  query?: { cursor?: string; limit?: number; start?: string; end?: string; timeZone?: string };
};

export type GatewayHandlerResult = { status: 200 | 201 | 202; body: Record<string, unknown> };
export type GatewayHandler = (context: GatewayHandlerContext) => Promise<GatewayHandlerResult>;
export type GatewayResponse = GatewayHandlerResult | { status: number; body: { error: { code: string; retryable: boolean } } };

const CREATED = new Set<GatewayOperation>(['createTask', 'createGoal', 'startSession', 'recordBreak', 'createReminder']);
const ACCEPTED = new Set<GatewayOperation>(['createPrivacyExport', 'createSyncSnapshot']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateHandlerResult(operation: GatewayOperation, result: unknown): asserts result is GatewayHandlerResult {
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  const candidate = result as { status?: unknown; body?: unknown };
  const expectedStatus = ACCEPTED.has(operation) ? 202 : CREATED.has(operation) ? 201 : 200;
  if (candidate.status !== expectedStatus || !isBoundedJsonResponse(candidate.body)) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
}

export async function executeGatewayOperation(input: {
  admitted: AdmittedGatewayOperation;
  authorize: () => Promise<void>;
  handlers: Partial<Record<GatewayOperation, GatewayHandler>>;
  sessionId?: string;
  logger?: (record: ReturnType<typeof safeBoundaryLog>) => void;
}): Promise<GatewayResponse> {
  if (!isRecord(input) || !isRecord(input.admitted) || !isRecord(input.admitted.route)
    || !isRecord(input.admitted.request) || !isRecord(input.handlers)
    || typeof input.authorize !== 'function'
    || (input.logger !== undefined && typeof input.logger !== 'function')) {
    return publicBoundaryError(new SafeBoundaryError(400, 'VALIDATION_FAILED'));
  }
  const operation = input.admitted.route.operation;
  if (typeof operation !== 'string') return publicBoundaryError(new SafeBoundaryError(400, 'VALIDATION_FAILED'));
  const handler = input.handlers[operation];
  const request = input.admitted.request;
  try {
    await input.authorize();
    if (!handler) return publicBoundaryError(new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'));
    const requestSha256 = await hashGatewayMutation({
      operation,
      path: request.path,
      body: request.body,
    });
    const result = await handler({
      actorId: request.actorId,
      ...(input.sessionId === undefined ? {} : { sessionId: input.sessionId }),
      operation,
      ...(input.admitted.route.resourceId ? { resourceId: input.admitted.route.resourceId } : {}),
      ...(request.idempotencyKey ? { idempotencyKey: request.idempotencyKey } : {}),
      ...(request.requestId ? { requestId: request.requestId } : {}),
      requestSha256,
      body: request.body,
      ...(request.query && Object.keys(request.query).length > 0 ? { query: request.query } : {}),
    });
    validateHandlerResult(operation, result);
    return result;
  } catch (error) {
    if (input.logger) {
      try {
        input.logger(safeBoundaryLog({ event: 'gateway.request_failed', error, requestId: request.requestId }));
      } catch {
        // Diagnostics must never change the public failure boundary.
      }
    }
    return publicBoundaryError(error);
  }
}
