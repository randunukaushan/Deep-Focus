// Supabase Edge Functions resolve these pinned imports through this directory's deno.json.
// @ts-expect-error The mobile TypeScript program does not resolve Edge-only JSR imports.
import { Pool } from '@db/postgres';
import { createClient } from '@supabase/supabase-js';
// @ts-expect-error The mobile TypeScript program does not allow Edge Runtime .ts imports.
import { createEdgePostgresTransactionRunner } from '../_shared/edge-postgres-transaction-runner.ts';
// @ts-expect-error The mobile TypeScript program does not allow Edge Runtime .ts imports.
import { createPostgresAuthenticatedGatewayFetchHandler } from '../_shared/postgres-authenticated-gateway-fetch.ts';
// @ts-expect-error The mobile TypeScript program does not allow Edge Runtime .ts imports.
import { createPostgresAuthenticatedGatewayRuntime } from '../_shared/postgres-authenticated-gateway-runtime.ts';
// @ts-expect-error The mobile TypeScript program does not allow Edge Runtime .ts imports.
import { createPostgresRateLimitCounter } from '../_shared/postgres-rate-limit-adapter.ts';
// @ts-expect-error The mobile TypeScript program does not allow Edge Runtime .ts imports.
import { createPostgresGatewayHandlers } from '../_shared/postgres-gateway-handlers.ts';
// @ts-expect-error The mobile TypeScript program does not allow Edge Runtime .ts imports.
import { createAccountBootstrapHttpHandler } from '../_shared/account-bootstrap-http.ts';
// @ts-expect-error The mobile TypeScript program does not allow Edge Runtime .ts imports.
import { bootstrapAuthenticatedAccount } from '../_shared/postgres-authenticated-account-bootstrap.ts';
// @ts-expect-error The mobile TypeScript program does not allow Edge Runtime .ts imports.
import { gatewayIssuer, readDeepFocusGatewayConfig, type DeepFocusGatewayConfig } from './config.ts';

declare const Deno: { env: { get: (name: string) => string | undefined }; serve: (handler: (request: Request) => Promise<Response>) => void };

type RequestHandler = (request: Request) => Promise<Response>;

function unavailable(): Response {
  return new Response(JSON.stringify({ error: { code: 'DEPENDENCY_UNAVAILABLE', retryable: true } }), {
    status: 503,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function jsonResponse(status: number, body: Record<string, unknown>, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extraHeaders },
  });
}

async function readBodyWithinLimit(request: Request, limit: number): Promise<string | undefined> {
  const contentLength = request.headers.get('content-length');
  if (contentLength !== null && (!/^[0-9]+$/.test(contentLength) || Number(contentLength) > limit)) return undefined;
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > limit) { await reader.cancel(); return undefined; }
      chunks.push(next.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { return undefined; }
}

function gatewayPath(request: Request): Request | null {
  const url = new URL(request.url);
  const prefix = '/deep-focus-gateway';
  if (url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)) {
    url.pathname = url.pathname.slice(prefix.length) || '/';
  }
  if (!url.pathname.startsWith('/v1/')) return null;
  return new Request(url, request);
}

function createHandler(config: DeepFocusGatewayConfig): RequestHandler {
  // A small per-isolate pool prevents the Edge runtime from sharing a mutable
  // transaction across requests. The selected shared pooler transaction URL is
  // stored only in SUPABASE_DB_URL.
  const pool = new Pool(config.databaseUrl, 1, true);
  const runner = createEdgePostgresTransactionRunner({ pool });
  const providerClient = createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const bootstrap = createAccountBootstrapHttpHandler({
    bootstrap: ({ accessToken, displayName }) => {
      // An Edge isolate can outlive a session or rate-limit window. Capture its
      // clocks when this request is admitted, never when the shared handler is
      // constructed.
      const now = new Date();
      return bootstrapAuthenticatedAccount({
        providerClient,
        accessToken,
        displayName,
        expectedIssuer: gatewayIssuer(config),
        expectedAudience: 'authenticated',
        now: now.toISOString(),
        rateLimit: {
          counter: createPostgresRateLimitCounter({ runner }),
          windowMs: config.rateLimitWindowMs,
          limit: config.rateLimitLimit,
          nowMs: now.getTime(),
        },
        createWorkspaceId: () => crypto.randomUUID(),
        runner,
      });
    },
  });
  const gatewayHandlers = createPostgresGatewayHandlers({
    runner,
    listCursorSecret: config.listCursorSecret,
    syncCursorSecret: config.syncCursorSecret,
    snapshotCursorSecret: config.snapshotCursorSecret,
    syncCursorTtlMs: config.cursorTtlMs,
    cursorTtlMs: config.cursorTtlMs,
    now: () => new Date().toISOString(),
  });
  const runtime = createPostgresAuthenticatedGatewayRuntime({
    providerClient,
    expectedIssuer: gatewayIssuer(config),
    expectedAudience: 'authenticated',
    runner,
    handlers: gatewayHandlers,
    rateLimit: {
      counter: createPostgresRateLimitCounter({ runner }),
      windowMs: config.rateLimitWindowMs,
      limit: config.rateLimitLimit,
    },
  });
  const protectedGateway = createPostgresAuthenticatedGatewayFetchHandler(runtime);
  return async (request) => {
    const url = new URL(request.url);
    if (url.pathname === '/v1/account/bootstrap') {
      const bodyText = await readBodyWithinLimit(request, 4 * 1024);
      if (bodyText === undefined) return jsonResponse(400, { error: { code: 'VALIDATION_FAILED', retryable: false } });
      const result = await bootstrap({
        method: request.method,
        path: url.pathname,
        headers: Object.fromEntries(request.headers.entries()),
        bodyText,
      });
      return jsonResponse(result.status, result.body, result.headers);
    }
    return protectedGateway(request);
  };
}

let handler: RequestHandler | null = null;

Deno.serve(async (request) => {
  const normalized = gatewayPath(request);
  if (!normalized) return unavailable();
  try {
    handler ??= createHandler(readDeepFocusGatewayConfig(Deno.env));
    return await handler(normalized);
  } catch {
    return unavailable();
  }
});
