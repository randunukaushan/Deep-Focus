export type GatewayEnvironment = { get: (name: string) => string | undefined };

/** Exact names that hosted Deep Focus Edge configuration must provide. */
export const DEEP_FOCUS_HOSTED_GATEWAY_ENV_NAMES = [
  'SUPABASE_DB_URL',
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEYS',
  'DEEP_FOCUS_SYNC_CURSOR_SECRET',
  'DEEP_FOCUS_LIST_CURSOR_SECRET',
  'DEEP_FOCUS_SNAPSHOT_CURSOR_SECRET',
  'DEEP_FOCUS_GATEWAY_RATE_LIMIT_WINDOW_MS',
  'DEEP_FOCUS_GATEWAY_RATE_LIMIT',
  'DEEP_FOCUS_SYNC_CURSOR_TTL_MS',
] as const;

export type DeepFocusGatewayConfig = {
  databaseUrl: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
  syncCursorSecret: string;
  listCursorSecret: string;
  snapshotCursorSecret: string;
  rateLimitWindowMs: number;
  rateLimitLimit: number;
  cursorTtlMs: number;
};

const CONTROL = /[\u0000-\u001f\u007f]/;

function required(environment: GatewayEnvironment, name: string): string {
  const value = environment.get(name)?.trim();
  if (!value || CONTROL.test(value)) throw new Error('GATEWAY_CONFIGURATION_INVALID');
  return value;
}

function httpsUrl(value: string): string {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error('GATEWAY_CONFIGURATION_INVALID'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('GATEWAY_CONFIGURATION_INVALID');
  }
  return url.toString().replace(/\/$/, '');
}

function postgresUrl(value: string): string {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error('GATEWAY_CONFIGURATION_INVALID'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || !url.username || !url.password || CONTROL.test(value)) {
    throw new Error('GATEWAY_CONFIGURATION_INVALID');
  }
  return value;
}

function integer(value: string, minimum: number, maximum: number): number {
  if (!/^(?:0|[1-9][0-9]*)$/.test(value)) throw new Error('GATEWAY_CONFIGURATION_INVALID');
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < minimum || number > maximum) throw new Error('GATEWAY_CONFIGURATION_INVALID');
  return number;
}

/**
 * Hosted Edge Functions expose named publishable keys as JSON. Local CLI
 * environments may still expose a single key, and legacy projects expose an
 * anon key. Prefer the current hosted form and fail closed if it is malformed;
 * the fallbacks only preserve explicitly configured local/legacy environments.
 */
function publishableKey(environment: GatewayEnvironment): string {
  const collection = environment.get('SUPABASE_PUBLISHABLE_KEYS')?.trim();
  if (collection) {
    let parsed: unknown;
    try { parsed = JSON.parse(collection); } catch { throw new Error('GATEWAY_CONFIGURATION_INVALID'); }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('GATEWAY_CONFIGURATION_INVALID');
    const key = (parsed as Record<string, unknown>).default;
    if (typeof key !== 'string' || !key.trim() || CONTROL.test(key)) throw new Error('GATEWAY_CONFIGURATION_INVALID');
    return key;
  }
  const localKey = environment.get('SUPABASE_PUBLISHABLE_KEY')?.trim();
  if (localKey) {
    if (CONTROL.test(localKey)) throw new Error('GATEWAY_CONFIGURATION_INVALID');
    return localKey;
  }
  return required(environment, 'SUPABASE_ANON_KEY');
}

/** Reads only server-side Edge secrets and rejects incomplete configuration. */
export function readDeepFocusGatewayConfig(environment: GatewayEnvironment): DeepFocusGatewayConfig {
  if (!environment || typeof environment.get !== 'function') throw new Error('GATEWAY_CONFIGURATION_INVALID');
  const syncCursorSecret = required(environment, 'DEEP_FOCUS_SYNC_CURSOR_SECRET');
  if (syncCursorSecret.length < 32 || syncCursorSecret.length > 512) throw new Error('GATEWAY_CONFIGURATION_INVALID');
  const listCursorSecret = required(environment, 'DEEP_FOCUS_LIST_CURSOR_SECRET');
  if (listCursorSecret.length < 32 || listCursorSecret.length > 512) throw new Error('GATEWAY_CONFIGURATION_INVALID');
  const snapshotCursorSecret = required(environment, 'DEEP_FOCUS_SNAPSHOT_CURSOR_SECRET');
  if (snapshotCursorSecret.length < 32 || snapshotCursorSecret.length > 512) throw new Error('GATEWAY_CONFIGURATION_INVALID');
  return {
    databaseUrl: postgresUrl(required(environment, 'SUPABASE_DB_URL')),
    supabaseUrl: httpsUrl(required(environment, 'SUPABASE_URL')),
    supabasePublishableKey: publishableKey(environment),
    syncCursorSecret,
    listCursorSecret,
    snapshotCursorSecret,
    rateLimitWindowMs: integer(required(environment, 'DEEP_FOCUS_GATEWAY_RATE_LIMIT_WINDOW_MS'), 1_000, 86_400_000),
    rateLimitLimit: integer(required(environment, 'DEEP_FOCUS_GATEWAY_RATE_LIMIT'), 1, 10_000),
    cursorTtlMs: integer(required(environment, 'DEEP_FOCUS_SYNC_CURSOR_TTL_MS'), 1_000, 86_400_000),
  };
}

export function gatewayIssuer(config: DeepFocusGatewayConfig): string {
  return `${config.supabaseUrl}/auth/v1`;
}
