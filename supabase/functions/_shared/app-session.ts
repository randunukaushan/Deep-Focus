export type VerifiedSessionClaims = {
  sub: string;
  sessionId: string;
  exp: number;
  iss: string;
  aud: string;
};

export type AppSessionRecord = {
  ownerId: string;
  sessionId: string;
  issuedAt: string;
  status: 'active' | 'revoked';
  expiresAt: string;
  revokedAt: string | null;
};

export type AppSessionDecision =
  | { allowed: true; ownerId: string; sessionId: string }
  | { allowed: false; reason: 'invalid_claims' | 'session_not_found' | 'owner_mismatch' | 'revoked' | 'expired' };

export type AppSessionMutation =
  | { ok: true; record: AppSessionRecord }
  | { ok: false; reason: 'invalid_input' | 'owner_mismatch' | 'already_revoked' | 'expired' };

export type AppSessionStore = {
  insertSession: (record: AppSessionRecord) => Promise<void>;
  loadSession: (ownerId: string, sessionId: string) => Promise<AppSessionRecord | null>;
  revokeSession: (input: { ownerId: string; sessionId: string; revokedAt: string }) => Promise<void>;
};

export type AppSessionTransactionStore = {
  withTransaction: <T>(operation: (store: AppSessionStore) => Promise<T>) => Promise<T>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validClaims(value: unknown, expectedIssuer: string, expectedAudience: string, now: string): value is VerifiedSessionClaims {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const claims = value as Partial<VerifiedSessionClaims>;
  return typeof claims.sub === 'string' && UUID.test(claims.sub)
    && typeof claims.sessionId === 'string' && UUID.test(claims.sessionId)
    && typeof claims.exp === 'number' && Number.isSafeInteger(claims.exp) && claims.exp > Math.floor(Date.parse(now) / 1000)
    && claims.iss === expectedIssuer && claims.aud === expectedAudience;
}

function validRegistryRecord(value: unknown): value is AppSessionRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Partial<AppSessionRecord>;
  if (typeof record.ownerId !== 'string' || !UUID.test(record.ownerId)
    || typeof record.sessionId !== 'string' || !UUID.test(record.sessionId)
    || !['active', 'revoked'].includes(String(record.status))
    || typeof record.issuedAt !== 'string' || typeof record.expiresAt !== 'string'
    || (record.revokedAt !== null && typeof record.revokedAt !== 'string')) return false;
  const issuedAt = Date.parse(record.issuedAt);
  const expiresAt = Date.parse(record.expiresAt);
  const revokedAt = record.revokedAt === null ? null : Date.parse(record.revokedAt);
  return Number.isFinite(issuedAt) && Number.isFinite(expiresAt) && expiresAt > issuedAt
    && ((record.status === 'revoked') === (record.revokedAt !== null))
    && (revokedAt === null || (Number.isFinite(revokedAt) && revokedAt >= issuedAt));
}

/**
 * The caller must obtain claims from a real provider verifier. This helper
 * never decodes an unverified JWT and still rechecks the app-session registry.
 */
export async function authorizeAppSession(input: {
  claims: unknown;
  expectedIssuer: string;
  expectedAudience: string;
  now: string;
  loadSession: (ownerId: string, sessionId: string) => Promise<AppSessionRecord | null>;
}): Promise<AppSessionDecision> {
  if (!Number.isFinite(Date.parse(input.now)) || typeof input.expectedIssuer !== 'string' || !input.expectedIssuer
    || typeof input.expectedAudience !== 'string' || !input.expectedAudience
    || !validClaims(input.claims, input.expectedIssuer, input.expectedAudience, input.now)) return { allowed: false, reason: 'invalid_claims' };
  const claims = input.claims;
  const record = await input.loadSession(claims.sub, claims.sessionId);
  if (!validRegistryRecord(record)) return { allowed: false, reason: 'session_not_found' };
  if (record.ownerId !== claims.sub || record.sessionId !== claims.sessionId) return { allowed: false, reason: 'owner_mismatch' };
  if (record.status !== 'active' || record.revokedAt !== null) return { allowed: false, reason: 'revoked' };
  if (!Number.isFinite(Date.parse(record.expiresAt)) || Date.parse(record.expiresAt) <= Date.parse(input.now)) return { allowed: false, reason: 'expired' };
  return { allowed: true, ownerId: claims.sub, sessionId: claims.sessionId };
}

/** Builds an owner-bound registry row; persistence belongs to the server transaction. */
export function issueAppSession(input: {
  ownerId: string;
  sessionId: string;
  issuedAt: string;
  expiresAt: string;
}): AppSessionMutation {
  if (!UUID.test(input.ownerId) || !UUID.test(input.sessionId)
    || !Number.isFinite(Date.parse(input.issuedAt)) || !Number.isFinite(Date.parse(input.expiresAt))
    || Date.parse(input.expiresAt) <= Date.parse(input.issuedAt)) return { ok: false, reason: 'invalid_input' };
  return {
    ok: true,
    record: { ownerId: input.ownerId, sessionId: input.sessionId, issuedAt: input.issuedAt, status: 'active', expiresAt: input.expiresAt, revokedAt: null },
  };
}

/** Produces a revocation transition without silently reviving or changing ownership. */
export function revokeAppSession(input: {
  verifiedOwnerId: string;
  record: AppSessionRecord | null;
  now: string;
}): AppSessionMutation {
  if (!UUID.test(input.verifiedOwnerId) || !Number.isFinite(Date.parse(input.now)) || !validRegistryRecord(input.record)) return { ok: false, reason: 'invalid_input' };
  if (input.record.ownerId !== input.verifiedOwnerId) return { ok: false, reason: 'owner_mismatch' };
  if (input.record.status === 'revoked' || input.record.revokedAt !== null) return { ok: false, reason: 'already_revoked' };
  if (!Number.isFinite(Date.parse(input.record.expiresAt)) || Date.parse(input.record.expiresAt) <= Date.parse(input.now)) return { ok: false, reason: 'expired' };
  return { ok: true, record: { ...input.record, status: 'revoked', revokedAt: input.now } };
}

/** Persistence boundary; the store must commit the row transition atomically. */
export async function issueAppSessionAtomically(input: {
  ownerId: string;
  sessionId: string;
  issuedAt: string;
  expiresAt: string;
  store: Pick<AppSessionStore, 'insertSession'>;
}): Promise<AppSessionMutation> {
  const mutation = issueAppSession(input);
  if (!mutation.ok) return mutation;
  await input.store.insertSession(mutation.record);
  return mutation;
}

export async function revokeAppSessionAtomically(input: {
  verifiedOwnerId: string;
  sessionId: string;
  now: string;
  store: Pick<AppSessionStore, 'loadSession' | 'revokeSession'>;
}): Promise<AppSessionMutation> {
  if (!UUID.test(input.sessionId)) return { ok: false, reason: 'invalid_input' };
  const record = await input.store.loadSession(input.verifiedOwnerId, input.sessionId);
  const mutation = revokeAppSession({ verifiedOwnerId: input.verifiedOwnerId, record, now: input.now });
  if (!mutation.ok) return mutation;
  await input.store.revokeSession({ ownerId: mutation.record.ownerId, sessionId: mutation.record.sessionId, revokedAt: mutation.record.revokedAt as string });
  return mutation;
}

/** Uses one caller-owned transaction for the registry read and revoke transition. */
export async function revokeAppSessionTransactionally(input: {
  verifiedOwnerId: string;
  sessionId: string;
  now: string;
  store: AppSessionTransactionStore;
}): Promise<AppSessionMutation> {
  if (!UUID.test(input.sessionId)) return { ok: false, reason: 'invalid_input' };
  return input.store.withTransaction(async (transaction) => {
    const record = await transaction.loadSession(input.verifiedOwnerId, input.sessionId);
    const mutation = revokeAppSession({ verifiedOwnerId: input.verifiedOwnerId, record, now: input.now });
    if (!mutation.ok) return mutation;
    await transaction.revokeSession({ ownerId: mutation.record.ownerId, sessionId: mutation.record.sessionId, revokedAt: mutation.record.revokedAt as string });
    return mutation;
  });
}

/** Persists a new registry row through one caller-owned transaction boundary. */
export async function issueAppSessionTransactionally(input: {
  ownerId: string;
  sessionId: string;
  issuedAt: string;
  expiresAt: string;
  store: AppSessionTransactionStore;
}): Promise<AppSessionMutation> {
  const mutation = issueAppSession(input);
  if (!mutation.ok) return mutation;
  return input.store.withTransaction(async (transaction) => {
    await transaction.insertSession(mutation.record);
    return mutation;
  });
}
