/** Server-only request admission. It does not authenticate or persist a request. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REQUEST_ID = /^[A-Za-z0-9_-]{1,128}$/;
const CONTROL = /[\u0000-\u001f\u007f]/;
const INVALID_JSON_CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const MAX_BODY_BYTES = 64 * 1024;
const MAX_PATH_BYTES = 512;
const METHODS = new Set(['GET', 'POST', 'PATCH', 'DELETE']);

export type GatewayAdmission = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  actorId: string;
  requestId?: string;
  idempotencyKey?: string;
  body: Record<string, unknown> | null;
};

export function admitGatewayRequest(input: {
  method: string;
  path: string;
  actorId: string;
  headers: Record<string, string | undefined>;
  bodyText?: string;
  allowedBodyKeys?: readonly string[];
}): GatewayAdmission {
  if (!METHODS.has(input.method)) throw new SafeBoundaryError(400, 'METHOD_NOT_ALLOWED');
  if (!/^\/v1\/[A-Za-z0-9/_-]{1,480}$/.test(input.path) || CONTROL.test(input.path) || new TextEncoder().encode(input.path).length > MAX_PATH_BYTES) {
    throw new SafeBoundaryError(404, 'NOT_FOUND');
  }
  if (!UUID.test(input.actorId)) throw new SafeBoundaryError(401, 'AUTH_REQUIRED');

  const requestId = input.headers['X-Request-Id'] ?? input.headers['x-request-id'];
  if (requestId !== undefined && !REQUEST_ID.test(requestId)) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');

  const isWrite = input.method !== 'GET';
  const idempotencyKey = input.headers['Idempotency-Key'] ?? input.headers['idempotency-key'];
  if (isWrite && (!idempotencyKey || !UUID.test(idempotencyKey))) {
    throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  }
  if (!isWrite && idempotencyKey !== undefined) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');

  const bodyText = input.bodyText;
  if (bodyText === undefined || bodyText === '') {
    if (isWrite) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
    return { method: input.method as GatewayAdmission['method'], path: input.path, actorId: input.actorId, ...(requestId ? { requestId } : {}), body: null };
  }
  if (new TextEncoder().encode(bodyText).length > MAX_BODY_BYTES || INVALID_JSON_CONTROL.test(bodyText)) {
    throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  }
  const contentType = input.headers['Content-Type'] ?? input.headers['content-type'];
  if (contentType !== 'application/json') throw new SafeBoundaryError(400, 'VALIDATION_FAILED');

  let parsed: unknown;
  try { parsed = JSON.parse(bodyText); } catch { throw new SafeBoundaryError(400, 'VALIDATION_FAILED'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  const body = parsed as Record<string, unknown>;
  if (input.allowedBodyKeys) {
    const allowed = new Set(input.allowedBodyKeys);
    if (Object.keys(body).some((key) => !allowed.has(key))) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  }
  return {
    method: input.method as GatewayAdmission['method'],
    path: input.path,
    actorId: input.actorId,
    ...(requestId ? { requestId } : {}),
    ...(idempotencyKey ? { idempotencyKey } : {}),
    body,
  };
}
