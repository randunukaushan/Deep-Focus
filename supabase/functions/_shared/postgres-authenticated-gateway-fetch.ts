/** Local Edge-compatible adapter for the authenticated gateway runtime. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { publicBoundaryError, SafeBoundaryError } from './server-boundary.ts';
import type { AuthenticatedGatewayRuntime } from './postgres-authenticated-gateway-runtime.ts';

const MAX_BODY_BYTES = 64 * 1024;

async function readBodyWithinLimit(request: Request): Promise<string> {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
      }
      chunks.push(next.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  }
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

/**
 * Converts a Web Request into the reviewed runtime shape. The runtime still
 * owns authentication, authorization, validation and error mapping; this
 * adapter only handles transport conversion and response cache protection.
 */
export function createPostgresAuthenticatedGatewayFetchHandler(runtime: AuthenticatedGatewayRuntime): (request: Request) => Promise<Response> {
  if (!runtime || typeof runtime.handle !== 'function') throw new Error('GATEWAY_RUNTIME_INVALID');
  return async (request) => {
    if (!request || typeof request.url !== 'string' || typeof request.method !== 'string') {
      return jsonResponse(400, { error: { code: 'VALIDATION_FAILED', retryable: false } });
    }
    try {
      const url = new URL(request.url);
      const headers = Object.fromEntries(request.headers.entries());
      const bodyText = request.method === 'GET' ? undefined : await readBodyWithinLimit(request);
      const result = await runtime.handle({
        method: request.method,
        path: `${url.pathname}${url.search}`,
        headers,
        ...(bodyText === undefined ? {} : { bodyText }),
      });
      return jsonResponse(result.status, result.body);
    } catch (error) {
      const safe = publicBoundaryError(error);
      return jsonResponse(safe.status, safe.body);
    }
  };
}
