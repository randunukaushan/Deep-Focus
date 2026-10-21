/** Local, review-gated atomic boundary for complete v2 transaction groups. */

export type V2LocalChange = { sequence: string; entityKind: 'profile' | 'goal' | 'task' | 'focus_session' | 'settings' | 'break' | 'reminder' | 'plan'; entityId: string; operation: 'upsert' | 'delete'; payload: Record<string, unknown> | null };
export type V2LocalGroup = { transactionId: string; committedThrough: string; changeCount: number; groupDigest: string; changes: V2LocalChange[] };
export type V2LocalPullPage = { contractVersion: 2; privacyEpoch: string; highWater: string; nextCursor: string; caughtUp: boolean; groups: V2LocalGroup[] };
export type V2PullApplyDependencies = { applyPageAtomically: (ownerId: string, page: V2LocalPullPage) => Promise<void> };

const OWNER = /^account:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const SHA256 = /^[a-f0-9]{64}$/;
const CURSOR = /^(?=.{1,4096}$)[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const KINDS = new Set(['profile', 'goal', 'task', 'focus_session', 'settings', 'break', 'reminder', 'plan']);
const MAX_PAGE_BYTES = 65_536;

function invalid(): never { throw new Error('SYNC_V2_PAGE_INVALID'); }
function boundedPage(value: unknown): boolean {
  try {
    const serialized = JSON.stringify(value, (_key, child) => {
      if (typeof child === 'number' && !Number.isFinite(child)) invalid();
      return child;
    });
    return typeof serialized === 'string' && new TextEncoder().encode(serialized).byteLength <= MAX_PAGE_BYTES;
  } catch {
    return false;
  }
}
function canonical(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') { if (!Number.isFinite(value)) invalid(); return JSON.stringify(value); }
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (!value || typeof value !== 'object') invalid();
  return `{${Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`).join(',')}}`;
}
async function digest(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(canonical(value));
  const result = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(result), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
function validChange(value: unknown): value is V2LocalChange {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const change = value as Partial<V2LocalChange>;
  return typeof change.sequence === 'string' && DECIMAL.test(change.sequence) && change.sequence !== '0'
    && typeof change.entityKind === 'string' && KINDS.has(change.entityKind)
    && typeof change.entityId === 'string' && UUID.test(change.entityId)
    && (change.operation === 'upsert' || change.operation === 'delete')
    && (change.operation === 'delete' ? change.payload === null : Boolean(change.payload && typeof change.payload === 'object' && !Array.isArray(change.payload)));
}

export async function validateV2PullPage(page: unknown): Promise<V2LocalPullPage> {
  if (!page || typeof page !== 'object' || Array.isArray(page)) invalid();
  if (!boundedPage(page)) invalid();
  const value = page as Partial<V2LocalPullPage>;
  if (value.contractVersion !== 2 || typeof value.privacyEpoch !== 'string' || !DECIMAL.test(value.privacyEpoch) || BigInt(value.privacyEpoch) < 1n
    || typeof value.highWater !== 'string' || !DECIMAL.test(value.highWater) || typeof value.nextCursor !== 'string' || !CURSOR.test(value.nextCursor)
    || typeof value.caughtUp !== 'boolean' || !Array.isArray(value.groups) || value.groups.length > 100) invalid();
  const groups: V2LocalGroup[] = [];
  let previousBoundary = 0n;
  let totalChanges = 0;
  for (const rawGroup of value.groups) {
    if (!rawGroup || typeof rawGroup !== 'object' || Array.isArray(rawGroup)) invalid();
    const group = rawGroup as Partial<V2LocalGroup>;
    if (typeof group.transactionId !== 'string' || !UUID.test(group.transactionId) || typeof group.committedThrough !== 'string' || !DECIMAL.test(group.committedThrough)
      || typeof group.changeCount !== 'number' || !Number.isInteger(group.changeCount) || group.changeCount < 1 || group.changeCount > 500
      || typeof group.groupDigest !== 'string' || !SHA256.test(group.groupDigest) || !Array.isArray(group.changes) || group.changes.length !== group.changeCount) invalid();
    const changes: V2LocalChange[] = [];
    let previousSequence = previousBoundary;
    for (const rawChange of group.changes) {
      if (!validChange(rawChange)) invalid();
      const sequence = BigInt(rawChange.sequence);
      if (sequence <= previousSequence || sequence > BigInt(group.committedThrough)) invalid();
      changes.push(rawChange);
      previousSequence = sequence;
    }
    if (changes.at(-1)?.sequence !== group.committedThrough) invalid();
    const expectedDigest = await digest({ contractVersion: 2, privacyEpoch: value.privacyEpoch, transactionId: group.transactionId, committedThrough: group.committedThrough, changes });
    if (expectedDigest !== group.groupDigest) invalid();
    groups.push({ transactionId: group.transactionId, committedThrough: group.committedThrough, changeCount: group.changeCount, groupDigest: group.groupDigest, changes });
    previousBoundary = BigInt(group.committedThrough);
    totalChanges += changes.length;
    if (totalChanges > 500) invalid();
  }
  if (groups.length > 0 && BigInt(groups.at(-1)?.committedThrough ?? '0') > BigInt(value.highWater)) invalid();
  return { contractVersion: 2, privacyEpoch: value.privacyEpoch, highWater: value.highWater, nextCursor: value.nextCursor, caughtUp: value.caughtUp, groups };
}

export async function applyAuthorizedV2SyncPage(ownerId: string, page: unknown, dependencies: V2PullApplyDependencies): Promise<void> {
  if (!OWNER.test(ownerId)) throw new Error('SYNC_OWNER_INVALID');
  const validated = await validateV2PullPage(page);
  await dependencies.applyPageAtomically(ownerId, validated);
}
