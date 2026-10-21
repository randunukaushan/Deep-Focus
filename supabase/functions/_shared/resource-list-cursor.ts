/** Server-only signed cursor for owner-bound resource list pages. */

export type ReminderListCursor = {
  version: 1;
  ownerId: string;
  endpoint: 'task-reminders';
  limit: number;
  afterScheduledFor: string;
  afterId: string;
  expiresAt: string;
};

export type SessionListCursor = {
  version: 1;
  ownerId: string;
  endpoint: 'focus-sessions';
  limit: number;
  beforeStartedAt: string;
  beforeId: string;
  expiresAt: string;
};

export type AppSessionListCursor = {
  version: 1;
  ownerId: string;
  endpoint: 'account-sessions';
  limit: number;
  beforeIssuedAt: string;
  beforeId: string;
  expiresAt: string;
};

export type BreakListCursor = {
  version: 1;
  ownerId: string;
  endpoint: 'breaks';
  limit: number;
  beforeEndedAt: string;
  beforeId: string;
  expiresAt: string;
};

export type PlanListCursor = {
  version: 1;
  ownerId: string;
  endpoint: 'plans';
  limit: number;
  beforeCreatedAt: string;
  beforeId: string;
  expiresAt: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN = /^(?=.{1,4096}$)[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function bytes(value: string): Uint8Array { return new TextEncoder().encode(value); }
function cryptoBytes(value: string): BufferSource { return Uint8Array.from(bytes(value)) as unknown as BufferSource; }
function base64Url(value: Uint8Array): string {
  let binary = '';
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function fromBase64Url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) throw new Error('LIST_CURSOR_INVALID');
  try {
    const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4));
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch { throw new Error('LIST_CURSOR_INVALID'); }
}
function canonical(value: ReminderListCursor): string {
  return JSON.stringify({ afterId: value.afterId, afterScheduledFor: value.afterScheduledFor, endpoint: value.endpoint,
    expiresAt: value.expiresAt, limit: value.limit, ownerId: value.ownerId, version: value.version });
}
function validate(value: unknown): asserts value is ReminderListCursor {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('LIST_CURSOR_INVALID');
  const cursor = value as Partial<ReminderListCursor>;
  if (cursor.version !== 1 || cursor.endpoint !== 'task-reminders' || typeof cursor.ownerId !== 'string' || !UUID.test(cursor.ownerId)
    || !Number.isInteger(cursor.limit) || (cursor.limit as number) < 1 || (cursor.limit as number) > 100
    || typeof cursor.afterScheduledFor !== 'string' || Number.isNaN(Date.parse(cursor.afterScheduledFor))
    || typeof cursor.afterId !== 'string' || !UUID.test(cursor.afterId)
    || typeof cursor.expiresAt !== 'string' || Number.isNaN(Date.parse(cursor.expiresAt))) throw new Error('LIST_CURSOR_INVALID');
}
async function key(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('LIST_CURSOR_SECRET_INVALID');
  return crypto.subtle.importKey('raw', cryptoBytes(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usage);
}

export async function signReminderListCursor(value: ReminderListCursor, secret: string): Promise<string> {
  validate(value);
  const encoded = base64Url(bytes(canonical(value)));
  const signature = await crypto.subtle.sign('HMAC', await key(secret, ['sign']), cryptoBytes(encoded));
  return `${encoded}.${base64Url(new Uint8Array(signature))}`;
}

export async function verifyReminderListCursor(token: string, secret: string, expected: { ownerId: string; limit: number; now: string }): Promise<ReminderListCursor> {
  if (typeof token !== 'string' || !TOKEN.test(token) || !isUuid(expected.ownerId) || !Number.isInteger(expected.limit)
    || typeof expected.now !== 'string' || !Number.isFinite(Date.parse(expected.now))) throw new Error('LIST_CURSOR_INVALID');
  const [encoded, signature] = token.split('.');
  if (!await crypto.subtle.verify('HMAC', await key(secret, ['verify']), Uint8Array.from(fromBase64Url(signature)) as unknown as BufferSource, cryptoBytes(encoded))) throw new Error('LIST_CURSOR_INVALID');
  let value: unknown;
  try { value = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))); } catch { throw new Error('LIST_CURSOR_INVALID'); }
  validate(value);
  if (value.ownerId !== expected.ownerId || value.limit !== expected.limit || Date.parse(value.expiresAt) <= Date.parse(expected.now)) throw new Error('LIST_CURSOR_INVALID');
  return value;
}

export async function signSessionListCursor(payload: SessionListCursor, secret: string): Promise<string> {
  validateSession(payload);
  const encoded = base64Url(bytes(JSON.stringify({ beforeId: payload.beforeId, beforeStartedAt: payload.beforeStartedAt, endpoint: payload.endpoint,
    expiresAt: payload.expiresAt, limit: payload.limit, ownerId: payload.ownerId, version: payload.version })));
  const signature = await crypto.subtle.sign('HMAC', await key(secret, ['sign']), cryptoBytes(encoded));
  return `${encoded}.${base64Url(new Uint8Array(signature))}`;
}

export async function verifySessionListCursor(token: string, secret: string, expected: { ownerId: string; limit: number; now: string }): Promise<SessionListCursor> {
  if (typeof token !== 'string' || !TOKEN.test(token) || !isUuid(expected.ownerId) || !Number.isInteger(expected.limit)
    || typeof expected.now !== 'string' || !Number.isFinite(Date.parse(expected.now))) throw new Error('LIST_CURSOR_INVALID');
  const [encoded, signature] = token.split('.');
  if (!await crypto.subtle.verify('HMAC', await key(secret, ['verify']), Uint8Array.from(fromBase64Url(signature)) as unknown as BufferSource, cryptoBytes(encoded))) throw new Error('LIST_CURSOR_INVALID');
  let value: unknown;
  try { value = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))); } catch { throw new Error('LIST_CURSOR_INVALID'); }
  validateSession(value);
  const payload = value;
  if (payload.version !== 1 || payload.endpoint !== 'focus-sessions' || payload.ownerId !== expected.ownerId
    || payload.limit !== expected.limit || !UUID.test(payload.beforeId)
    || !Number.isFinite(Date.parse(payload.beforeStartedAt)) || Date.parse(payload.expiresAt) <= Date.parse(expected.now)) throw new Error('LIST_CURSOR_INVALID');
  return payload as SessionListCursor;
}

export async function signAppSessionListCursor(payload: AppSessionListCursor, secret: string): Promise<string> {
  validateAppSession(payload);
  const encoded = base64Url(bytes(JSON.stringify({ beforeId: payload.beforeId, beforeIssuedAt: payload.beforeIssuedAt, endpoint: payload.endpoint,
    expiresAt: payload.expiresAt, limit: payload.limit, ownerId: payload.ownerId, version: payload.version })));
  const signature = await crypto.subtle.sign('HMAC', await key(secret, ['sign']), cryptoBytes(encoded));
  return `${encoded}.${base64Url(new Uint8Array(signature))}`;
}

export async function verifyAppSessionListCursor(token: string, secret: string, expected: { ownerId: string; limit: number; now: string }): Promise<AppSessionListCursor> {
  if (typeof token !== 'string' || !TOKEN.test(token) || !isUuid(expected.ownerId) || !Number.isInteger(expected.limit)
    || typeof expected.now !== 'string' || !Number.isFinite(Date.parse(expected.now))) throw new Error('LIST_CURSOR_INVALID');
  const [encoded, signature] = token.split('.');
  if (!await crypto.subtle.verify('HMAC', await key(secret, ['verify']), Uint8Array.from(fromBase64Url(signature)) as unknown as BufferSource, cryptoBytes(encoded))) throw new Error('LIST_CURSOR_INVALID');
  let value: unknown;
  try { value = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))); } catch { throw new Error('LIST_CURSOR_INVALID'); }
  validateAppSession(value);
  const payload = value;
  if (payload.ownerId !== expected.ownerId || payload.limit !== expected.limit || Date.parse(payload.expiresAt) <= Date.parse(expected.now)) throw new Error('LIST_CURSOR_INVALID');
  return payload;
}

export async function signBreakListCursor(payload: BreakListCursor, secret: string): Promise<string> {
  validateBreak(payload);
  const encoded = base64Url(bytes(JSON.stringify({ beforeEndedAt: payload.beforeEndedAt, beforeId: payload.beforeId, endpoint: payload.endpoint,
    expiresAt: payload.expiresAt, limit: payload.limit, ownerId: payload.ownerId, version: payload.version })));
  const signature = await crypto.subtle.sign('HMAC', await key(secret, ['sign']), cryptoBytes(encoded));
  return `${encoded}.${base64Url(new Uint8Array(signature))}`;
}

export async function verifyBreakListCursor(token: string, secret: string, expected: { ownerId: string; limit: number; now: string }): Promise<BreakListCursor> {
  if (typeof token !== 'string' || !TOKEN.test(token) || !isUuid(expected.ownerId) || !Number.isInteger(expected.limit)
    || typeof expected.now !== 'string' || !Number.isFinite(Date.parse(expected.now))) throw new Error('LIST_CURSOR_INVALID');
  const [encoded, signature] = token.split('.');
  if (!await crypto.subtle.verify('HMAC', await key(secret, ['verify']), Uint8Array.from(fromBase64Url(signature)) as unknown as BufferSource, cryptoBytes(encoded))) throw new Error('LIST_CURSOR_INVALID');
  let value: unknown;
  try { value = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))); } catch { throw new Error('LIST_CURSOR_INVALID'); }
  validateBreak(value);
  const payload = value;
  if (payload.ownerId !== expected.ownerId || payload.limit !== expected.limit || Date.parse(payload.expiresAt) <= Date.parse(expected.now)) throw new Error('LIST_CURSOR_INVALID');
  return payload;
}

function validateSession(value: unknown): asserts value is SessionListCursor {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('LIST_CURSOR_INVALID');
  const cursor = value as Partial<SessionListCursor>;
  if (cursor.version !== 1 || cursor.endpoint !== 'focus-sessions' || typeof cursor.ownerId !== 'string' || !UUID.test(cursor.ownerId)
    || !Number.isInteger(cursor.limit) || (cursor.limit as number) < 1 || (cursor.limit as number) > 100
    || typeof cursor.beforeStartedAt !== 'string' || Number.isNaN(Date.parse(cursor.beforeStartedAt))
    || typeof cursor.beforeId !== 'string' || !UUID.test(cursor.beforeId)
    || typeof cursor.expiresAt !== 'string' || Number.isNaN(Date.parse(cursor.expiresAt))) throw new Error('LIST_CURSOR_INVALID');
}

function validateAppSession(value: unknown): asserts value is AppSessionListCursor {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('LIST_CURSOR_INVALID');
  const cursor = value as Partial<AppSessionListCursor>;
  if (cursor.version !== 1 || cursor.endpoint !== 'account-sessions' || typeof cursor.ownerId !== 'string' || !UUID.test(cursor.ownerId)
    || !Number.isInteger(cursor.limit) || (cursor.limit as number) < 1 || (cursor.limit as number) > 100
    || typeof cursor.beforeIssuedAt !== 'string' || Number.isNaN(Date.parse(cursor.beforeIssuedAt))
    || typeof cursor.beforeId !== 'string' || !UUID.test(cursor.beforeId)
    || typeof cursor.expiresAt !== 'string' || Number.isNaN(Date.parse(cursor.expiresAt))) throw new Error('LIST_CURSOR_INVALID');
}

function validateBreak(value: unknown): asserts value is BreakListCursor {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('LIST_CURSOR_INVALID');
  const cursor = value as Partial<BreakListCursor>;
  if (cursor.version !== 1 || cursor.endpoint !== 'breaks' || typeof cursor.ownerId !== 'string' || !UUID.test(cursor.ownerId)
    || !Number.isInteger(cursor.limit) || (cursor.limit as number) < 1 || (cursor.limit as number) > 100
    || typeof cursor.beforeEndedAt !== 'string' || Number.isNaN(Date.parse(cursor.beforeEndedAt))
    || typeof cursor.beforeId !== 'string' || !UUID.test(cursor.beforeId)
    || typeof cursor.expiresAt !== 'string' || Number.isNaN(Date.parse(cursor.expiresAt))) throw new Error('LIST_CURSOR_INVALID');
}

function validatePlan(value: unknown): asserts value is PlanListCursor {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('LIST_CURSOR_INVALID');
  const cursor = value as Partial<PlanListCursor>;
  if (cursor.version !== 1 || cursor.endpoint !== 'plans' || typeof cursor.ownerId !== 'string' || !UUID.test(cursor.ownerId)
    || !Number.isInteger(cursor.limit) || (cursor.limit as number) < 1 || (cursor.limit as number) > 100
    || typeof cursor.beforeCreatedAt !== 'string' || Number.isNaN(Date.parse(cursor.beforeCreatedAt))
    || typeof cursor.beforeId !== 'string' || !UUID.test(cursor.beforeId)
    || typeof cursor.expiresAt !== 'string' || Number.isNaN(Date.parse(cursor.expiresAt))) throw new Error('LIST_CURSOR_INVALID');
}

export async function signPlanListCursor(payload: PlanListCursor, secret: string): Promise<string> {
  validatePlan(payload);
  const encoded = base64Url(bytes(JSON.stringify({ beforeCreatedAt: payload.beforeCreatedAt, beforeId: payload.beforeId, endpoint: payload.endpoint, expiresAt: payload.expiresAt, limit: payload.limit, ownerId: payload.ownerId, version: payload.version })));
  const signature = await crypto.subtle.sign('HMAC', await key(secret, ['sign']), cryptoBytes(encoded));
  return `${encoded}.${base64Url(new Uint8Array(signature))}`;
}

export async function verifyPlanListCursor(token: string, secret: string, expected: { ownerId: string; limit: number; now: string }): Promise<PlanListCursor> {
  if (typeof token !== 'string' || !TOKEN.test(token) || !isUuid(expected.ownerId) || !Number.isInteger(expected.limit)
    || typeof expected.now !== 'string' || !Number.isFinite(Date.parse(expected.now))) throw new Error('LIST_CURSOR_INVALID');
  const [encoded, signature] = token.split('.');
  if (!await crypto.subtle.verify('HMAC', await key(secret, ['verify']), Uint8Array.from(fromBase64Url(signature)) as unknown as BufferSource, cryptoBytes(encoded))) throw new Error('LIST_CURSOR_INVALID');
  let value: unknown;
  try { value = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))); } catch { throw new Error('LIST_CURSOR_INVALID'); }
  validatePlan(value);
  if (value.ownerId !== expected.ownerId || value.limit !== expected.limit || Date.parse(value.expiresAt) <= Date.parse(expected.now)) throw new Error('LIST_CURSOR_INVALID');
  return value;
}
