const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type SessionOwnerResult =
  | { status: 'verified'; userId: string }
  | { status: 'offline'; userId: string }
  | { status: 'denied' };

export async function resolveSessionOwner(
  userId: unknown,
  dependencies: {
    getClaims(): Promise<{ claims?: { sub?: unknown } | null; error?: unknown }>;
    readPreviouslyVerifiedOwner(): Promise<string | null>;
    rememberVerifiedOwner(userId: string): Promise<void>;
    isCurrent?(): boolean;
  },
): Promise<SessionOwnerResult> {
  if (typeof userId !== 'string' || !UUID.test(userId)) return { status: 'denied' };
  if (dependencies.isCurrent && !dependencies.isCurrent()) return { status: 'denied' };
  const normalizedId = userId.toLowerCase();

  let verified: Awaited<ReturnType<typeof dependencies.getClaims>>;
  try {
    verified = await dependencies.getClaims();
  } catch {
    verified = { error: true };
  }

  if (!verified.error) {
    const subject = typeof verified.claims?.sub === 'string' ? verified.claims.sub.toLowerCase() : null;
    if (subject !== normalizedId) return { status: 'denied' };
    if (dependencies.isCurrent && !dependencies.isCurrent()) return { status: 'denied' };
    try {
      await dependencies.rememberVerifiedOwner(normalizedId);
    } catch {
      return { status: 'denied' };
    }
    return { status: 'verified', userId: normalizedId };
  }

  try {
    const previousOwner = await dependencies.readPreviouslyVerifiedOwner();
    if (previousOwner?.toLowerCase() === normalizedId && (!dependencies.isCurrent || dependencies.isCurrent())) {
      return { status: 'offline', userId: normalizedId };
    }
  } catch {
    // A missing/unreadable binding must never grant account-local access.
  }
  return { status: 'denied' };
}
