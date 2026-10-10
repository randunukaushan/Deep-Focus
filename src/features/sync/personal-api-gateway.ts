export type GatewayRequest = {
  method: 'GET' | 'POST' | 'PATCH';
  path: string;
  headers: Record<string, string | undefined>;
  body?: unknown;
};

export type GatewayActor = { userId: string };

export type GatewayDispatchInput = {
  actor: GatewayActor;
  operation: string;
  resourceId?: string;
  body?: Record<string, unknown>;
  idempotencyKey?: string;
  requestSha256?: string;
  query?: { cursor?: string; limit?: number };
};

export type GatewayDispatchResult = { status: 200 | 201; body: Record<string, unknown> };

export type PersonalApiGatewayDependencies = {
  resolveUser: (accessToken: string) => Promise<GatewayActor | null>;
  dispatch: (input: GatewayDispatchInput) => Promise<GatewayDispatchResult>;
};

export type GatewayResponse = { status: number; body: Record<string, unknown> };

const IDEMPOTENCY_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RESOURCE_ID = IDEMPOTENCY_KEY;
const AUTH_USER_ID = IDEMPOTENCY_KEY;
const CONTROL = /[\u0000-\u001f\u007f]/;
const BODY_LIMIT = 64 * 1024;

function response(status: number, code: string): GatewayResponse {
  return { status, body: { error: { code, messageKey: `errors.${code.toLowerCase()}`, retryable: status >= 500 } } };
}

function bearer(headers: Record<string, string | undefined>): string | null {
  const value = headers.Authorization ?? headers.authorization;
  if (!value || !/^Bearer\s+\S+$/.test(value) || CONTROL.test(value)) return null;
  const token = value.slice(value.indexOf(' ') + 1);
  return token.startsWith('sb_') ? null : token;
}

function safeBody(value: unknown): Record<string, unknown> | null | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (Object.keys(body).some((key) => ['ownerId', 'userId', 'serviceRole'].includes(key))) return null;
  return body;
}

function bodyBytes(value: unknown): number {
  try {
    const json = JSON.stringify(value ?? '');
    return new TextEncoder().encode(json).byteLength;
  } catch {
    return BODY_LIMIT + 1;
  }
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (!value || typeof value !== 'object') throw new TypeError('UNHASHABLE_BODY');
  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`).join(',')}}`;
}

async function requestSha256(value: unknown): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalJson(value ?? null)));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function resourceId(value: string): string | null {
  return RESOURCE_ID.test(value) ? value : null;
}

function validSyncMutationBatch(body: Record<string, unknown> | null | undefined): boolean {
  if (!body || !Array.isArray(body.mutations) || body.mutations.length > 25) return false;
  return body.mutations.every((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const mutation = item as Record<string, unknown>;
    if (!RESOURCE_ID.test(String(mutation.mutationId ?? '')) || typeof mutation.command !== 'string'
      || mutation.command.length < 1 || mutation.command.length > 120
      || !RESOURCE_ID.test(String(mutation.targetId ?? ''))
      || !mutation.body || typeof mutation.body !== 'object' || Array.isArray(mutation.body)) return false;
    const payload = mutation.body as Record<string, unknown>;
    return !['ownerId', 'userId', 'serviceRole'].some((key) => key in payload);
  });
}

function route(request: GatewayRequest): { operation: string; resourceId?: string; mutation: boolean } | null {
  const path = request.path.split('?')[0];
  const parts = path.split('/').filter(Boolean);
  if (parts[0] !== 'v1' || parts.some((part) => CONTROL.test(part))) return null;
  if (parts.length === 2 && parts[1] === 'sync' && request.method === 'GET') return { operation: 'pullSync', mutation: false };
  if (parts.length === 3 && parts[1] === 'sync' && parts[2] === 'mutations' && request.method === 'POST') return { operation: 'pushSync', mutation: true };
  if (parts.length === 2 && parts[1] === 'me') return request.method === 'GET'
    ? { operation: 'getMe', mutation: false } : request.method === 'PATCH' ? { operation: 'patchMe', mutation: true } : null;
  if (parts.length === 2 && ['tasks', 'goals', 'focus-sessions'].includes(parts[1])) {
    if (request.method === 'GET') return { operation: `list${parts[1] === 'focus-sessions' ? 'Sessions' : parts[1][0].toUpperCase() + parts[1].slice(1)}`, mutation: false };
    if (request.method !== 'POST') return null;
    return { operation: parts[1] === 'tasks' ? 'createTask' : parts[1] === 'goals' ? 'createGoal' : 'startSession', mutation: true };
  }
  if (parts.length === 3 && ['tasks', 'goals', 'focus-sessions'].includes(parts[1])) {
    if (request.method !== 'GET') return null;
    const id = resourceId(parts[2]);
    return id ? { operation: `get${parts[1] === 'tasks' ? 'Task' : parts[1] === 'goals' ? 'Goal' : 'Session'}`, resourceId: id, mutation: false } : null;
  }
  if (parts.length === 3 && parts[1] === 'tasks' && request.method === 'PATCH') return resourceId(parts[2]) ? { operation: 'patchTask', resourceId: parts[2], mutation: true } : null;
  if (parts.length === 4 && parts[1] === 'tasks' && parts[3] === 'actions' && request.method === 'POST') return resourceId(parts[2]) ? { operation: 'applyTaskAction', resourceId: parts[2], mutation: true } : null;
  if (parts.length === 4 && parts[1] === 'focus-sessions' && parts[3] === 'events' && request.method === 'POST') return resourceId(parts[2]) ? { operation: 'applySessionEvent', resourceId: parts[2], mutation: true } : null;
  return null;
}

function query(path: string, operation: string): { cursor?: string; limit?: number } | null {
  const raw = path.includes('?') ? path.slice(path.indexOf('?') + 1) : '';
  if (!raw) return {};
  const parsed = new URLSearchParams(raw);
  const keys = [...parsed.keys()];
  if (keys.some((key) => key !== 'cursor' && key !== 'limit') || keys.some((key) => keys.filter((item) => item === key).length > 1)) return null;
  const cursor = parsed.get('cursor');
  const limitValue = parsed.get('limit');
  if (operation !== 'pullSync' || (cursor !== null && (cursor.length < 1 || cursor.length > 2048)) || (limitValue !== null && !/^(?:[1-9][0-9]?|100)$/.test(limitValue))) return null;
  return {
    ...(cursor === null ? {} : { cursor }),
    ...(limitValue === null ? {} : { limit: Number(limitValue) }),
  };
}

/**
 * Server-side contract boundary. It derives ownership from a verified token
 * resolver and never accepts owner identity from a request body or path alone.
 */
export function createPersonalApiGateway(dependencies: PersonalApiGatewayDependencies) {
  return async function handle(request: GatewayRequest): Promise<GatewayResponse> {
    const token = bearer(request.headers);
    if (!token) return response(401, 'AUTH_REQUIRED');
    const selected = route(request);
    if (!selected) return response(404, 'NOT_FOUND');
    const requestQuery = query(request.path, selected.operation);
    if (requestQuery === null) return response(400, 'VALIDATION_FAILED');
    const body = safeBody(request.body);
    if (body === null) return response(400, 'VALIDATION_FAILED');
    if (bodyBytes(request.body) > BODY_LIMIT) return response(400, 'VALIDATION_FAILED');
    if (selected.operation === 'pushSync' && !validSyncMutationBatch(body)) return response(400, 'VALIDATION_FAILED');
    const idempotencyKey = request.headers['Idempotency-Key'] ?? request.headers['idempotency-key'];
    if (selected.mutation && (!idempotencyKey || !IDEMPOTENCY_KEY.test(idempotencyKey))) return response(400, 'IDEMPOTENCY_KEY_REQUIRED');
    if (selected.mutation && body === undefined) return response(400, 'VALIDATION_FAILED');
    let actor: GatewayActor | null;
    try {
      actor = await dependencies.resolveUser(token);
    } catch {
      return response(503, 'DEPENDENCY_UNAVAILABLE');
    }
    if (!actor || !AUTH_USER_ID.test(actor.userId)) return response(401, 'AUTH_REQUIRED');
    try {
      const requestHash = selected.mutation ? await requestSha256(body) : undefined;
      return await dependencies.dispatch({
        actor,
        operation: selected.operation,
        ...(selected.resourceId === undefined ? {} : { resourceId: selected.resourceId }),
        ...(body === undefined ? {} : { body }),
        ...(idempotencyKey === undefined ? {} : { idempotencyKey }),
        ...(requestHash === undefined ? {} : { requestSha256: requestHash }),
        ...(Object.keys(requestQuery).length === 0 ? {} : { query: requestQuery }),
      });
    } catch {
      return response(503, 'DEPENDENCY_UNAVAILABLE');
    }
  };
}
