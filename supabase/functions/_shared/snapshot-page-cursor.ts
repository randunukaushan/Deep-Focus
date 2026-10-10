/** Server-only opaque cursor for immutable snapshot page fetches. */

export type SnapshotPageCursorPayload = {
  version: 1;
  ownerId: string;
  endpoint: 'snapshot-pages';
  snapshotId: string;
  pageIndex: number;
  pageCount: number;
  expiresAt: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function bytes(value: string): Uint8Array { return new TextEncoder().encode(value); }
function cryptoBytes(value: string): BufferSource { return Uint8Array.from(bytes(value)) as unknown as BufferSource; }

function base64Url(value: Uint8Array): string {
  let binary = '';
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) throw new Error('SNAPSHOT_CURSOR_INVALID');
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  try {
    return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  } catch {
    throw new Error('SNAPSHOT_CURSOR_INVALID');
  }
}

function canonicalPayload(payload: SnapshotPageCursorPayload): string {
  return JSON.stringify({
    endpoint: payload.endpoint,
    expiresAt: payload.expiresAt,
    ownerId: payload.ownerId,
    pageCount: payload.pageCount,
    pageIndex: payload.pageIndex,
    snapshotId: payload.snapshotId,
    version: payload.version,
  });
}

function validatePayload(value: unknown): asserts value is SnapshotPageCursorPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('SNAPSHOT_CURSOR_INVALID');
  const payload = value as Partial<SnapshotPageCursorPayload>;
  if (payload.version !== 1 || payload.endpoint !== 'snapshot-pages'
    || typeof payload.ownerId !== 'string' || !UUID.test(payload.ownerId)
    || typeof payload.snapshotId !== 'string' || !UUID.test(payload.snapshotId)
    || !Number.isInteger(payload.pageIndex) || (payload.pageIndex as number) < 0
    || !Number.isInteger(payload.pageCount) || (payload.pageCount as number) < 1
    || (payload.pageIndex as number) >= (payload.pageCount as number)
    || typeof payload.expiresAt !== 'string' || !Number.isFinite(Date.parse(payload.expiresAt))) {
    throw new Error('SNAPSHOT_CURSOR_INVALID');
  }
}

async function signingKey(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('SNAPSHOT_CURSOR_SECRET_INVALID');
  return crypto.subtle.importKey('raw', cryptoBytes(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usage);
}

export async function signSnapshotPageCursor(payload: SnapshotPageCursorPayload, secret: string): Promise<string> {
  validatePayload(payload);
  const encoded = base64Url(bytes(canonicalPayload(payload)));
  const key = await signingKey(secret, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, cryptoBytes(encoded));
  return `${encoded}.${base64Url(new Uint8Array(signature))}`;
}

export async function verifySnapshotPageCursor(token: string, secret: string, expected: {
  ownerId: string;
  snapshotId: string;
  now: string;
}): Promise<SnapshotPageCursorPayload> {
  if (typeof token !== 'string' || !TOKEN.test(token)
    || !UUID.test(expected.ownerId) || !UUID.test(expected.snapshotId)
    || !Number.isFinite(Date.parse(expected.now))) throw new Error('SNAPSHOT_CURSOR_INVALID');
  const [encoded, encodedSignature] = token.split('.');
  const key = await signingKey(secret, ['verify']);
  const valid = await crypto.subtle.verify('HMAC', key, fromBase64Url(encodedSignature) as unknown as BufferSource, cryptoBytes(encoded));
  if (!valid) throw new Error('SNAPSHOT_CURSOR_INVALID');
  let payload: unknown;
  try { payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))); }
  catch { throw new Error('SNAPSHOT_CURSOR_INVALID'); }
  validatePayload(payload);
  if (payload.ownerId !== expected.ownerId || payload.snapshotId !== expected.snapshotId
    || Date.parse(payload.expiresAt) <= Date.parse(expected.now)) throw new Error('SNAPSHOT_CURSOR_INVALID');
  return payload;
}
