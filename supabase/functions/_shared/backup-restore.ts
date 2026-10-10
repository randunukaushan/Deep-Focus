/** Server-side backup admission and isolated atomic-restore candidate. */

export type BackupManifest = {
  version: 1;
  ownerId: string;
  schemaVersion: number;
  createdAt: string;
  recordCount: number;
  payloadSha256: string;
};

export type RestoreDecision =
  | { allowed: true; ownerId: string; schemaVersion: number }
  | { allowed: false; reason: 'invalid_manifest' | 'owner_mismatch' | 'future_schema' | 'payload_mismatch' | 'overwrite_requires_confirmation' };

export type BackupRecord = {
  kind: 'profile' | 'workspace' | 'goal' | 'task' | 'focus_session' | 'focus_event' | 'mutation_receipt' | 'sync_head' | 'sync_change';
  id: string;
  ownerId: string;
  data: Record<string, unknown>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/** Computes the manifest digest without uploading or persisting the payload. */
export async function computeBackupPayloadSha256(payload: unknown): Promise<string> {
  const encoded = new TextEncoder().encode(canonicalJson(payload));
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function validateBackupManifest(value: unknown): value is BackupManifest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const manifest = value as Partial<BackupManifest>;
  return manifest.version === 1
    && typeof manifest.ownerId === 'string' && UUID.test(manifest.ownerId)
    && typeof manifest.schemaVersion === 'number' && Number.isSafeInteger(manifest.schemaVersion) && manifest.schemaVersion > 0
    && typeof manifest.createdAt === 'string' && Number.isFinite(Date.parse(manifest.createdAt))
    && typeof manifest.recordCount === 'number' && Number.isSafeInteger(manifest.recordCount) && manifest.recordCount >= 0
    && typeof manifest.payloadSha256 === 'string' && SHA256.test(manifest.payloadSha256);
}

export function decideBackupRestore(input: {
  manifest: unknown;
  verifiedOwnerId: string;
  currentSchemaVersion: number;
  computedPayloadSha256: string;
  targetHasData: boolean;
}): RestoreDecision {
  if (!validateBackupManifest(input.manifest) || !UUID.test(input.verifiedOwnerId)
    || !Number.isSafeInteger(input.currentSchemaVersion) || input.currentSchemaVersion < 1
    || !SHA256.test(input.computedPayloadSha256)) return { allowed: false, reason: 'invalid_manifest' };
  const manifest = input.manifest;
  if (manifest.ownerId !== input.verifiedOwnerId) return { allowed: false, reason: 'owner_mismatch' };
  if (manifest.schemaVersion > input.currentSchemaVersion) return { allowed: false, reason: 'future_schema' };
  if (manifest.payloadSha256 !== input.computedPayloadSha256) return { allowed: false, reason: 'payload_mismatch' };
  if (input.targetHasData) return { allowed: false, reason: 'overwrite_requires_confirmation' };
  return { allowed: true, ownerId: manifest.ownerId, schemaVersion: manifest.schemaVersion };
}

function validBackupRecord(value: unknown, ownerId: string): value is BackupRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Partial<BackupRecord>;
  return typeof record.kind === 'string'
    && ['profile', 'workspace', 'goal', 'task', 'focus_session', 'focus_event', 'mutation_receipt', 'sync_head', 'sync_change'].includes(record.kind)
    && typeof record.id === 'string' && UUID.test(record.id)
    && record.ownerId === ownerId
    && !!record.data && typeof record.data === 'object' && !Array.isArray(record.data);
}

export type AtomicRestoreResult = { restored: number; ownerId: string; schemaVersion: number };

export type BackupArtifact = { manifest: BackupManifest; payload: BackupRecord[] };

export type BackupSource = {
  readRecords: (ownerId: string) => Promise<unknown[]>;
};

/** Reads only verified-owner records and creates an immutable, digest-bound artifact. */
export async function createBackupArtifact(input: {
  verifiedOwnerId: string;
  schemaVersion: number;
  createdAt: string;
  source: BackupSource;
}): Promise<BackupArtifact> {
  if (!UUID.test(input.verifiedOwnerId) || !Number.isSafeInteger(input.schemaVersion) || input.schemaVersion < 1
    || typeof input.createdAt !== 'string' || !Number.isFinite(Date.parse(input.createdAt))) throw new Error('BACKUP_EXPORT_INVALID');
  const payload = await input.source.readRecords(input.verifiedOwnerId);
  if (!Array.isArray(payload) || payload.length > 10_000) throw new Error('BACKUP_EXPORT_INVALID');
  const records = payload.map((record) => {
    if (!validBackupRecord(record, input.verifiedOwnerId)) throw new Error('BACKUP_EXPORT_INVALID');
    return record;
  });
  const identities = new Set(records.map((record) => `${record.kind}:${record.id}`));
  if (identities.size !== records.length) throw new Error('BACKUP_EXPORT_DUPLICATE');
  const payloadSha256 = await computeBackupPayloadSha256(records);
  return {
    manifest: {
      version: 1, ownerId: input.verifiedOwnerId, schemaVersion: input.schemaVersion,
      createdAt: input.createdAt, recordCount: records.length, payloadSha256,
    },
    payload: records,
  };
}

/**
 * Validates the complete payload before handing it to one caller-owned
 * transaction. The transaction must provide all-or-nothing semantics; this
 * helper never deletes or overwrites existing data.
 */
export async function restoreBackupAtomically(input: {
  manifest: unknown;
  verifiedOwnerId: string;
  currentSchemaVersion: number;
  targetHasData: boolean;
  payload: unknown;
  computedPayloadSha256: string;
  transaction: (records: BackupRecord[]) => Promise<void>;
}): Promise<AtomicRestoreResult> {
  if (!Array.isArray(input.payload)) throw new Error('BACKUP_PAYLOAD_INVALID');
  const actualPayloadSha256 = await computeBackupPayloadSha256(input.payload);
  if (actualPayloadSha256 !== input.computedPayloadSha256) throw new Error('BACKUP_PAYLOAD_DIGEST_INVALID');
  const decision = decideBackupRestore(input);
  if (!decision.allowed) throw new Error(`BACKUP_RESTORE_${decision.reason.toUpperCase()}`);
  const manifest = input.manifest as BackupManifest;
  if (input.payload.length !== manifest.recordCount || input.payload.length > 10_000) {
    throw new Error('BACKUP_PAYLOAD_INVALID');
  }
  const records = input.payload.map((record) => {
    if (!validBackupRecord(record, decision.ownerId)) throw new Error('BACKUP_PAYLOAD_INVALID');
    return record;
  });
  const identities = new Set(records.map((record) => `${record.kind}:${record.id}`));
  if (identities.size !== records.length) throw new Error('BACKUP_DUPLICATE_RECORD');
  await input.transaction(records);
  return { restored: records.length, ownerId: decision.ownerId, schemaVersion: decision.schemaVersion };
}
