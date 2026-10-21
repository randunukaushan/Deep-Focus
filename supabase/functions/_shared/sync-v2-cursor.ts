/** Server-only, owner/epoch-bound cursor for the review-gated v2 pull wire. */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const TOKEN = /^(?=.{1,4096}$)[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const MAX_BIGINT = 9223372036854775807n;

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

export type SyncV2CursorPayload = {
  version: 2;
  endpoint: 'replication-v2-pull';
  ownerId: string;
  privacyEpoch: string;
  limit: number;
  after: string;
  highWater: string;
  expiresAt: string;
};

function bytes(value: string): Uint8Array { return new TextEncoder().encode(value); }
function cryptoBytes(value: string): BufferSource { return Uint8Array.from(bytes(value)) as unknown as BufferSource; }
function base64Url(value: Uint8Array): string {
  let binary = '';
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function fromBase64Url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) throw new Error('SYNC_V2_CURSOR_INVALID');
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
    return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  } catch { throw new Error('SYNC_V2_CURSOR_INVALID'); }
}
function canonicalPayload(value: SyncV2CursorPayload): string {
  return JSON.stringify({ after: value.after, endpoint: value.endpoint, expiresAt: value.expiresAt, highWater: value.highWater, limit: value.limit, ownerId: value.ownerId, privacyEpoch: value.privacyEpoch, version: value.version });
}
function validate(value: unknown): asserts value is SyncV2CursorPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('SYNC_V2_CURSOR_INVALID');
  const candidate = value as Partial<SyncV2CursorPayload>;
  if (candidate.version !== 2 || candidate.endpoint !== 'replication-v2-pull' || typeof candidate.ownerId !== 'string' || !UUID.test(candidate.ownerId)
    || typeof candidate.privacyEpoch !== 'string' || !DECIMAL.test(candidate.privacyEpoch) || BigInt(candidate.privacyEpoch) < 1n || BigInt(candidate.privacyEpoch) > MAX_BIGINT
    || typeof candidate.after !== 'string' || !DECIMAL.test(candidate.after) || BigInt(candidate.after) > MAX_BIGINT
    || typeof candidate.highWater !== 'string' || !DECIMAL.test(candidate.highWater) || BigInt(candidate.highWater) > MAX_BIGINT
    || BigInt(candidate.after) > BigInt(candidate.highWater)
    || typeof candidate.limit !== 'number' || !Number.isInteger(candidate.limit) || candidate.limit < 1 || candidate.limit > 100
    || typeof candidate.expiresAt !== 'string' || !Number.isFinite(Date.parse(candidate.expiresAt))) throw new Error('SYNC_V2_CURSOR_INVALID');
}
async function key(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('SYNC_V2_CURSOR_SECRET_INVALID');
  return crypto.subtle.importKey('raw', cryptoBytes(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usage);
}

export async function signSyncV2Cursor(payload: SyncV2CursorPayload, secret: string): Promise<string> {
  validate(payload);
  const encoded = base64Url(bytes(canonicalPayload(payload)));
  const signature = await crypto.subtle.sign('HMAC', await key(secret, ['sign']), cryptoBytes(encoded));
  return `${encoded}.${base64Url(new Uint8Array(signature))}`;
}

export async function verifySyncV2Cursor(token: string, secret: string, expected: { ownerId: string; limit: number; now: string }): Promise<SyncV2CursorPayload> {
  if (typeof token !== 'string' || !TOKEN.test(token) || !isUuid(expected.ownerId)
    || !Number.isInteger(expected.limit) || typeof expected.now !== 'string'
    || !Number.isFinite(Date.parse(expected.now))) throw new Error('SYNC_V2_CURSOR_INVALID');
  const [encoded, signature] = token.split('.');
  const valid = await crypto.subtle.verify('HMAC', await key(secret, ['verify']), Uint8Array.from(fromBase64Url(signature)) as unknown as BufferSource, cryptoBytes(encoded));
  if (!valid) throw new Error('SYNC_V2_CURSOR_INVALID');
  let decoded: unknown;
  try { decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))); } catch { throw new Error('SYNC_V2_CURSOR_INVALID'); }
  validate(decoded);
  if (decoded.ownerId !== expected.ownerId || decoded.limit !== expected.limit || Date.parse(decoded.expiresAt) <= Date.parse(expected.now)) throw new Error('SYNC_V2_CURSOR_INVALID');
  return decoded;
}
