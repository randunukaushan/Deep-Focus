/** Server-only domain handler execution boundary. No handler is a database adapter by itself. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { publicBoundaryError, safeBoundaryLog, SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { hashGatewayMutation } from './gateway-mutation-hash.ts';
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
};

export type GatewayHandlerResult = { status: 200 | 201; body: Record<string, unknown> };
export type GatewayHandler = (context: GatewayHandlerContext) => Promise<GatewayHandlerResult>;
export type GatewayResponse = GatewayHandlerResult | { status: number; body: { error: { code: string; retryable: boolean } } };

const CREATED = new Set<GatewayOperation>(['createTask', 'createGoal', 'startSession', 'recordBreak']);
const MAX_RESPONSE_BYTES = 256 * 1024;

function hasUndefined(value: unknown): boolean {
  if (value === undefined) return true;
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(hasUndefined);
  return Object.entries(value).some(([key, entry]) => key.length === 0 || hasUndefined(entry));
}

function validateHandlerResult(operation: GatewayOperation, result: unknown): asserts result is GatewayHandlerResult {
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  const candidate = result as { status?: unknown; body?: unknown };
  const expectedStatus = CREATED.has(operation) ? 201 : 200;
  if (candidate.status !== expectedStatus || !candidate.body || typeof candidate.body !== 'object' || Array.isArray(candidate.body) || hasUndefined(candidate.body)) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  try {
    if (new TextEncoder().encode(JSON.stringify(candidate.body)).length > MAX_RESPONSE_BYTES) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  } catch { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
}

export async function executeGatewayOperation(input: {
  admitted: AdmittedGatewayOperation;
  authorize: () => Promise<void>;
  handlers: Partial<Record<GatewayOperation, GatewayHandler>>;
  sessionId?: string;
  logger?: (record: ReturnType<typeof safeBoundaryLog>) => void;
}): Promise<GatewayResponse> {
  const operation = input.admitted.route.operation;
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
