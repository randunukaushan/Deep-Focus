/**
 * Server-only sync cursor contract. Never import this from the public app
 * bundle and never use a publishable key as the signing secret.
 */

export type SyncCursorPayload = {
  version: 1;
  ownerId: string;
  endpoint: 'sync';
  limit: number;
  after: string;
  highWater: string;
  expiresAt: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const TOKEN = /^(?=.{1,4096}$)[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function cryptoBytes(value: string): BufferSource {
  return Uint8Array.from(bytes(value)) as unknown as BufferSource;
}

function base64Url(value: Uint8Array): string {
  let binary = '';
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) throw new Error('SYNC_CURSOR_INVALID');
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  try {
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    throw new Error('SYNC_CURSOR_INVALID');
  }
}

function canonicalPayload(payload: SyncCursorPayload): string {
  return JSON.stringify({
    after: payload.after,
    endpoint: payload.endpoint,
    expiresAt: payload.expiresAt,
    highWater: payload.highWater,
    limit: payload.limit,
    ownerId: payload.ownerId,
    version: payload.version,
  });
}

function validatePayload(payload: unknown): asserts payload is SyncCursorPayload {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('SYNC_CURSOR_INVALID');
  const value = payload as Partial<SyncCursorPayload>;
  const limit = value.limit;
  if (value.version !== 1 || value.endpoint !== 'sync' || typeof value.ownerId !== 'string' || !UUID.test(value.ownerId)
    || typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1 || limit > 100
    || typeof value.after !== 'string' || !DECIMAL.test(value.after)
    || typeof value.highWater !== 'string' || !DECIMAL.test(value.highWater)
    || BigInt(value.after) > BigInt(value.highWater)
    || typeof value.expiresAt !== 'string' || !Number.isFinite(Date.parse(value.expiresAt))) {
    throw new Error('SYNC_CURSOR_INVALID');
  }
}

async function signingKey(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('SYNC_CURSOR_SECRET_INVALID');
  return crypto.subtle.importKey('raw', cryptoBytes(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usage);
}

export async function signSyncCursor(payload: SyncCursorPayload, secret: string): Promise<string> {
  validatePayload(payload);
  const encoded = base64Url(bytes(canonicalPayload(payload)));
  const key = await signingKey(secret, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, cryptoBytes(encoded));
  return `${encoded}.${base64Url(new Uint8Array(signature))}`;
}

export async function verifySyncCursor(
  token: string,
  secret: string,
  expected: { ownerId: string; limit: number; now: string },
): Promise<SyncCursorPayload> {
  if (typeof token !== 'string' || !TOKEN.test(token)) throw new Error('SYNC_CURSOR_INVALID');
  if (!UUID.test(expected.ownerId) || !Number.isInteger(expected.limit) || !Number.isFinite(Date.parse(expected.now))) throw new Error('SYNC_CURSOR_INVALID');
  const [encoded, encodedSignature] = token.split('.');
  const key = await signingKey(secret, ['verify']);
  const valid = await crypto.subtle.verify('HMAC', key, Uint8Array.from(fromBase64Url(encodedSignature)) as unknown as BufferSource, cryptoBytes(encoded));
  if (!valid) throw new Error('SYNC_CURSOR_INVALID');
  let payload: unknown;
  try { payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))); }
  catch { throw new Error('SYNC_CURSOR_INVALID'); }
  validatePayload(payload);
  if (payload.ownerId !== expected.ownerId || payload.limit !== expected.limit || Date.parse(payload.expiresAt) <= Date.parse(expected.now)) {
    throw new Error('SYNC_CURSOR_INVALID');
  }
  return payload;
}
