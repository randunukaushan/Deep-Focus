/** Safe HTTP admission for first authenticated account bootstrap. */

const CONTROL = /[\u0000-\u001f\u007f]/;
const MAX_BODY_BYTES = 4 * 1024;

export type AccountBootstrapHttpResult = { status: number; headers?: Record<string, string>; body: Record<string, unknown> };

export type AccountBootstrapHttpDependencies = {
  bootstrap: (input: { accessToken: string; displayName: string }) => Promise<
    | { ok: true; account: { profile: Record<string, unknown>; workspace: Record<string, unknown>; syncHead: Record<string, unknown> } }
    | { ok: false; reason: string; retryAfterSeconds?: number }
  >;
};

function response(status: number, code: string, retryable = false, retryAfterSeconds?: number): AccountBootstrapHttpResult {
  return {
    status,
    ...(retryAfterSeconds === undefined ? {} : { headers: { 'retry-after': String(retryAfterSeconds) } }),
    body: { error: { code, retryable } },
  };
}

function bearer(headers: Record<string, string | undefined>): string | null {
  const value = headers.authorization ?? headers.Authorization;
  if (typeof value !== 'string' || CONTROL.test(value) || !/^Bearer\s+\S+$/.test(value)) return null;
  const token = value.slice(value.indexOf(' ') + 1);
  return token.length > 0 && token.length <= 8192 && !/\s/.test(token) ? token : null;
}

function displayName(bodyText: string | undefined): string | null {
  if (typeof bodyText !== 'string' || new TextEncoder().encode(bodyText).byteLength > MAX_BODY_BYTES) return null;
  let body: unknown;
  try { body = JSON.parse(bodyText); } catch { return null; }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const entries = Object.entries(body as Record<string, unknown>);
  if (entries.length !== 1 || entries[0][0] !== 'displayName') return null;
  const value = entries[0][1];
  return typeof value === 'string' && value.length >= 1 && value.length <= 100 && /\S/.test(value) && !CONTROL.test(value) ? value : null;
}

/**
 * This endpoint intentionally verifies only the provider token: it creates the
 * app-session record that subsequent protected gateway requests must recheck.
 */
export function createAccountBootstrapHttpHandler(dependencies: AccountBootstrapHttpDependencies) {
  if (!dependencies || typeof dependencies.bootstrap !== 'function') throw new Error('BOOTSTRAP_HANDLER_INVALID');
  return async (request: { method: string; path: string; headers: Record<string, string | undefined>; bodyText?: string }): Promise<AccountBootstrapHttpResult> => {
    if (!request || request.method !== 'POST' || request.path !== '/v1/account/bootstrap') return response(404, 'NOT_FOUND');
    const accessToken = bearer(request.headers);
    const name = displayName(request.bodyText);
    if (!accessToken) return response(401, 'AUTH_REQUIRED');
    if (!name) return response(400, 'VALIDATION_FAILED');
    try {
      const result = await dependencies.bootstrap({ accessToken, displayName: name });
      const retryAfterSeconds = result.ok ? undefined : result.retryAfterSeconds;
      if (!result.ok && result.reason === 'rate_limited' && typeof retryAfterSeconds === 'number' && Number.isSafeInteger(retryAfterSeconds)
        && retryAfterSeconds >= 0 && retryAfterSeconds <= 86_400) {
        return response(429, 'RATE_LIMITED', false, retryAfterSeconds);
      }
      if (!result.ok) return response(401, 'AUTH_REQUIRED');
      return { status: 200, body: { data: result.account } };
    } catch {
      return response(503, 'DEPENDENCY_UNAVAILABLE', true);
    }
  };
}
