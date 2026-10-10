/** Local composition candidate for the server gateway request lifecycle. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { admitGatewayOperation } from './gateway-operation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { authorizeGatewayOperation, type GatewayAuthorizationStore } from './gateway-authorization.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { executeGatewayOperation, type GatewayHandler, type GatewayResponse } from './gateway-execution.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { publicBoundaryError, safeBoundaryLog, SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { authorizeRequestSession, type ProviderSessionVerifier } from './request-session.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { enforceGatewayRateLimit, type RateLimitCounter } from './gateway-rate-limit.ts';

type GatewayRateLimitConfig = { counter: RateLimitCounter; nowMs: number; windowMs: number; limit: number };
type GatewayDiagnosticLog = ReturnType<typeof safeBoundaryLog>;

export async function handleGatewayRequest(input: {
  method: string;
  path: string;
  actorId: string;
  sessionId?: string;
  headers: Record<string, string | undefined>;
  bodyText?: string;
  ownerStore: GatewayAuthorizationStore;
  handlers: Partial<Record<Parameters<typeof executeGatewayOperation>[0]['admitted']['route']['operation'], GatewayHandler>>;
  rateLimit?: GatewayRateLimitConfig;
  logger?: (record: GatewayDiagnosticLog) => void;
}): Promise<GatewayResponse> {
  try {
    const admitted = admitGatewayOperation(input);
    if (input.rateLimit) await enforceGatewayRateLimit({
      actorId: input.actorId,
      operation: admitted.route.operation,
      counter: input.rateLimit.counter,
      nowMs: input.rateLimit.nowMs,
      windowMs: input.rateLimit.windowMs,
      limit: input.rateLimit.limit,
    });
    return await executeGatewayOperation({
      admitted,
      ...(input.sessionId === undefined ? {} : { sessionId: input.sessionId }),
      authorize: () => authorizeGatewayOperation({ admitted, store: input.ownerStore }),
      handlers: input.handlers,
      logger: input.logger,
    });
  } catch (error) {
    if (input.logger) {
      try {
        input.logger(safeBoundaryLog({ event: 'gateway.request_failed', error, requestId: input.headers['X-Request-Id'] }));
      } catch {
        // Diagnostics must never change the public failure boundary.
      }
    }
    return publicBoundaryError(error);
  }
}

/** Authenticated gateway boundary: provider verification and app-session recheck precede actor binding. */
export async function handleAuthenticatedGatewayRequest(input: {
  method: string;
  path: string;
  headers: Record<string, string | undefined>;
  bodyText?: string;
  verifyProviderToken: ProviderSessionVerifier;
  expectedIssuer: string;
  expectedAudience: string;
  now: string;
  loadSession: Parameters<typeof authorizeRequestSession>[0]['loadSession'];
  ownerStore: GatewayAuthorizationStore;
  handlers: Parameters<typeof handleGatewayRequest>[0]['handlers'];
  rateLimit: GatewayRateLimitConfig;
  logger?: (record: GatewayDiagnosticLog) => void;
}): Promise<GatewayResponse> {
  const decision = await authorizeRequestSession({
    headers: input.headers,
    verifyProviderToken: input.verifyProviderToken,
    expectedIssuer: input.expectedIssuer,
    expectedAudience: input.expectedAudience,
    now: input.now,
    loadSession: input.loadSession,
  });
  if (!decision.allowed) return publicBoundaryError(new SafeBoundaryError(401, 'AUTH_REQUIRED'));
  return handleGatewayRequest({
    method: input.method,
    path: input.path,
    actorId: decision.ownerId,
    sessionId: decision.sessionId,
    headers: input.headers,
    ...(input.bodyText === undefined ? {} : { bodyText: input.bodyText }),
    ownerStore: input.ownerStore,
    handlers: input.handlers,
    rateLimit: input.rateLimit,
    logger: input.logger,
  });
}
