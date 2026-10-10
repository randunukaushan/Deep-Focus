export type RemoteApiFetch = (input: string, init: { method: string; headers: Record<string, string>; body?: string }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

export type RemoteApiClientDependencies = {
  baseUrl: string | undefined;
  getAccessToken: () => Promise<string | null>;
  fetcher?: RemoteApiFetch;
};

export class RemoteApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message = code) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'RemoteApiError';
  }
}

function validatedBaseUrl(value: string | undefined): URL {
  if (!value) throw new RemoteApiError(0, 'API_NOT_CONFIGURED');
  let parsed: URL;
  try { parsed = new URL(value); } catch { throw new RemoteApiError(0, 'API_NOT_CONFIGURED'); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new RemoteApiError(0, 'API_NOT_CONFIGURED');
  }
  parsed.pathname = parsed.pathname.replace(/\/+$/, '');
  return parsed;
}

function safePath(base: URL, path: string): string {
  if (!path.startsWith('/v1/') || path.includes('\\') || /[\u0000-\u001f\u007f]/.test(path)) {
    throw new RemoteApiError(0, 'INVALID_API_PATH');
  }
  const target = new URL(path, base);
  const expectedPrefix = `${base.pathname || ''}/v1/`.replace(/^\/\//, '/');
  if (target.origin !== base.origin || !target.pathname.startsWith(expectedPrefix)) {
    throw new RemoteApiError(0, 'INVALID_API_PATH');
  }
  return target.toString();
}

type ParsedResponseBody =
  | { valid: true; value: Record<string, unknown> }
  | { valid: false };

async function responseBody(response: Awaited<ReturnType<RemoteApiFetch>>): Promise<ParsedResponseBody> {
  try {
    const value = await response.json();
    return value && typeof value === 'object' && !Array.isArray(value)
      ? { valid: true, value: value as Record<string, unknown> }
      : { valid: false };
  } catch {
    return { valid: false };
  }
}

function responseErrorCode(body: Record<string, unknown>, status: number): string {
  if (typeof body.code === 'string') return body.code;
  const error = body.error;
  if (error && typeof error === 'object' && !Array.isArray(error) && typeof (error as Record<string, unknown>).code === 'string') {
    return (error as Record<string, unknown>).code as string;
  }
  return `HTTP_${status}`;
}

export function createRemoteApiClient(dependencies: RemoteApiClientDependencies) {
  const fetcher = dependencies.fetcher ?? (fetch as unknown as RemoteApiFetch);
  return {
    async request<T>(path: string, options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown; idempotencyKey?: string; expectedVersion?: number } = {}): Promise<T> {
      const base = validatedBaseUrl(dependencies.baseUrl);
      const method = options.method ?? 'GET';
      if (method !== 'GET' && !options.idempotencyKey) throw new RemoteApiError(0, 'IDEMPOTENCY_KEY_REQUIRED');
      if (options.expectedVersion !== undefined && (!Number.isSafeInteger(options.expectedVersion) || options.expectedVersion < 1 || options.expectedVersion > 2_147_483_647)) {
        throw new RemoteApiError(0, 'EXPECTED_VERSION_INVALID');
      }
      const token = await dependencies.getAccessToken();
      if (!token) throw new RemoteApiError(401, 'AUTH_REQUIRED');
      const headers: Record<string, string> = {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      };
      if (options.body !== undefined) headers['Content-Type'] = 'application/json';
      if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
      if (options.expectedVersion !== undefined) headers['Expected-Version'] = String(options.expectedVersion);
      const response = await fetcher(safePath(base, path), {
        method,
        headers,
        ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
      });
      const parsedBody = await responseBody(response);
      if (!response.ok) {
        const body = parsedBody.valid ? parsedBody.value : {};
        const code = responseErrorCode(body, response.status);
        throw new RemoteApiError(response.status, code);
      }
      if (!parsedBody.valid) throw new RemoteApiError(response.status, 'REMOTE_RESPONSE_INVALID');
      return parsedBody.value as T;
    },
  };
}
