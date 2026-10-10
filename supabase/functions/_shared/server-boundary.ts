/** Server-only helpers. Do not import into the public Expo or browser bundle. */

const CONTROL = /[\u0000-\u001f\u007f]/;
const SAFE_CODE = /^[A-Z][A-Z0-9_]{0,79}$/;

export class SafeBoundaryError extends Error {
  readonly code: string;
  readonly status: 400 | 401 | 403 | 404 | 409 | 410 | 422 | 429 | 503;
  readonly retryAfterSeconds?: number;

  constructor(status: SafeBoundaryError['status'], code: string, options?: { retryAfterSeconds?: number }) {
    super(code);
    this.name = 'SafeBoundaryError';
    this.status = status;
    this.code = SAFE_CODE.test(code) ? code : 'DEPENDENCY_UNAVAILABLE';
    if (options?.retryAfterSeconds !== undefined && Number.isSafeInteger(options.retryAfterSeconds)
      && options.retryAfterSeconds >= 0 && options.retryAfterSeconds <= 86_400) {
      this.retryAfterSeconds = options.retryAfterSeconds;
    }
  }
}

export function requireServerSecret(env: Record<string, string | undefined>, name: string): string {
  if (!/^[A-Z][A-Z0-9_]*$/.test(name) || name.startsWith('EXPO_PUBLIC_') || name.startsWith('NEXT_PUBLIC_')) {
    throw new Error('SERVER_SECRET_NAME_INVALID');
  }
  const value = env[name];
  if (typeof value !== 'string' || value.length < 32 || CONTROL.test(value)) throw new Error('SERVER_SECRET_INVALID');
  return value;
}

export function requireHttpsConfig(env: Record<string, string | undefined>, name: string): URL {
  const value = env[name];
  let url: URL;
  try { url = new URL(value ?? ''); }
  catch { throw new Error('SERVER_URL_INVALID'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('SERVER_URL_INVALID');
  return url;
}

export function publicBoundaryError(error: unknown): { status: number; headers?: Record<string, string>; body: { error: { code: string; retryable: boolean } } } {
  if (error instanceof SafeBoundaryError) {
    return {
      status: error.status,
      ...(error.retryAfterSeconds === undefined ? {} : { headers: { 'Retry-After': String(error.retryAfterSeconds) } }),
      body: { error: { code: error.code, retryable: error.status >= 500 } },
    };
  }
  return { status: 503, body: { error: { code: 'DEPENDENCY_UNAVAILABLE', retryable: true } } };
}

/** Returns an allowlisted diagnostic record; never serializes an error object. */
export function safeBoundaryLog(input: {
  event: string;
  error: unknown;
  requestId?: string;
}): { event: string; status: number; code: string; retryable: boolean; requestId?: string } {
  if (!/^[a-z][a-z0-9_.-]{0,63}$/.test(input.event)) throw new RangeError('LOG_EVENT_INVALID');
  if (input.requestId !== undefined && (!/^[A-Za-z0-9_-]{1,128}$/.test(input.requestId))) throw new RangeError('LOG_REQUEST_ID_INVALID');
  const mapped = publicBoundaryError(input.error);
  return {
    event: input.event,
    status: mapped.status,
    code: mapped.body.error.code,
    retryable: mapped.body.error.retryable,
    ...(input.requestId === undefined ? {} : { requestId: input.requestId }),
  };
}
