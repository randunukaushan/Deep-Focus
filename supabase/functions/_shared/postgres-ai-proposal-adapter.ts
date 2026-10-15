/** Local PostgreSQL candidate for owner-bound, versioned AI proposal state. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const MAX_ITEMS = 100;

export type AiProposalRecord = {
  ownerId: string;
  id: string;
  contractVersion: 1 | 2;
  version: number;
  generationRequestId: string;
  actionType: 'plan_my_day' | 'break_down_task';
  expiresAt: string;
  reviewDigest: string;
  state: 'ready' | 'applied' | 'expired';
  inputVersions: Record<string, unknown>[];
  operations: Record<string, unknown>[];
  selectedOperationIds: string[] | null;
  appliedAt: string | null;
};

export type AiProposalTransaction = {
  create: (record: AiProposalRecord, now: string) => Promise<AiProposalRecord>;
  load: (ownerId: string, proposalId: string) => Promise<AiProposalRecord | null>;
  markApplied: (input: { ownerId: string; proposalId: string; expectedVersion: number; reviewDigest: string; selectedOperationIds: string[]; appliedAt: string; now: string }) => Promise<AiProposalRecord>;
};

export type AiProposalStore = {
  withOwnerTransaction: <T>(ownerId: string, operation: (transaction: AiProposalTransaction) => Promise<T>) => Promise<T>;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function conflict(): never { throw new SafeBoundaryError(409, 'AI_PROPOSAL_MISMATCH'); }
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function isSha256(value: unknown): value is string { return typeof value === 'string' && SHA256.test(value); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function resultRows(result: unknown): unknown[] {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) dependencyFailure();
  return result.rows;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('AI_PROPOSAL_UNHASHABLE');
    return JSON.stringify(value);
  }
  if (typeof value !== 'object') throw new Error('AI_PROPOSAL_UNHASHABLE');
  if (Array.isArray(value)) {
    const keys = Object.keys(value);
    if (Object.getOwnPropertySymbols(value).length > 0
      || keys.length !== value.length
      || keys.some((key) => !/^(?:0|[1-9][0-9]*)$/.test(key) || Number(key) >= value.length)) throw new Error('AI_PROPOSAL_UNHASHABLE');
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  const record = value as Record<string, unknown>;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new Error('AI_PROPOSAL_UNHASHABLE');
  if (Object.getOwnPropertySymbols(value).length > 0) throw new Error('AI_PROPOSAL_UNHASHABLE');
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

function validateRecord(record: AiProposalRecord, now: string): void {
  if (!record || typeof record !== 'object' || !isSha256(record.reviewDigest)
    || typeof now !== 'string') invalid();
  validateIds(record.ownerId, record.id);
  if (!Number.isSafeInteger(record.version) || record.version < 1
    || !isUuid(record.generationRequestId)
    || ![1, 2].includes(record.contractVersion)
    || !['plan_my_day', 'break_down_task'].includes(record.actionType)
    || !Number.isFinite(Date.parse(record.expiresAt)) || !Number.isFinite(Date.parse(now))
    || Date.parse(record.expiresAt) <= Date.parse(now)
    || !isSha256(record.reviewDigest)
    || record.state !== 'ready'
    || record.selectedOperationIds !== null || record.appliedAt !== null
    || !jsonObjects(record.inputVersions) || !jsonObjects(record.operations) || record.operations.length < 1 || record.operations.length > 25
    || (record.contractVersion === 2 && record.actionType !== 'plan_my_day')) invalid();
}

function sameCreateIntent(left: AiProposalRecord, right: AiProposalRecord): boolean {
  return left.ownerId === right.ownerId && left.id === right.id
    && left.contractVersion === right.contractVersion && left.version === right.version
    && left.generationRequestId === right.generationRequestId && left.actionType === right.actionType
    && left.expiresAt === right.expiresAt && left.reviewDigest === right.reviewDigest
    && canonicalJson(left.inputVersions) === canonicalJson(right.inputVersions)
    && canonicalJson(left.operations) === canonicalJson(right.operations);
}

function validateIds(ownerId: unknown, proposalId: unknown): asserts ownerId is string {
  if (!isUuid(ownerId) || !isUuid(proposalId)) invalid();
}

function jsonObjects(value: unknown): value is Record<string, unknown>[] {
  if (!Array.isArray(value) || value.length > MAX_ITEMS || value.some((item) => item === null || typeof item !== 'object' || Array.isArray(item))) return false;
  try { value.forEach((item) => canonicalJson(item)); return true; } catch { return false; }
}

function asRecord(row: unknown, expected: { ownerId: string; proposalId: string }): AiProposalRecord {
  if (!isRecord(row)) dependencyFailure();
  const rowRecord = row;
  const inputVersions = rowRecord.input_versions;
  const operations = rowRecord.operations;
  const selected = rowRecord.selected_operation_ids;
  const validSelected = selected === null || (Array.isArray(selected) && isPlainJsonValueForBoundary(selected) && selected.length >= 1 && selected.length <= 25 && selected.every((item) => typeof item === 'string' && UUID.test(item)));
  if (rowRecord.owner_id !== expected.ownerId || rowRecord.id !== expected.proposalId
    || !isUuid(rowRecord.owner_id) || !isUuid(rowRecord.id)
    || typeof rowRecord.contract_version !== 'number' || ![1, 2].includes(rowRecord.contract_version)
    || typeof rowRecord.version !== 'number' || !Number.isSafeInteger(rowRecord.version) || rowRecord.version < 1
    || !isUuid(rowRecord.generation_request_id)
    || (typeof rowRecord.action_type !== 'string' || !['plan_my_day', 'break_down_task'].includes(rowRecord.action_type))
    || typeof rowRecord.expires_at !== 'string' || !Number.isFinite(Date.parse(rowRecord.expires_at))
    || !isSha256(rowRecord.review_digest)
    || (typeof rowRecord.state !== 'string' || !['ready', 'applied', 'expired'].includes(rowRecord.state))
    || !jsonObjects(inputVersions) || !jsonObjects(operations) || !validSelected
    || (rowRecord.state === 'ready' && (selected !== null || rowRecord.applied_at !== null))
    || (rowRecord.state === 'applied' && (selected === null || typeof rowRecord.applied_at !== 'string' || !Number.isFinite(Date.parse(rowRecord.applied_at))))
    || (rowRecord.state === 'expired' && rowRecord.applied_at !== null)) dependencyFailure();
  if (rowRecord.contract_version === 2 && rowRecord.action_type !== 'plan_my_day') dependencyFailure();
  return {
    ownerId: rowRecord.owner_id as string,
    id: rowRecord.id as string,
    contractVersion: rowRecord.contract_version as 1 | 2,
    version: rowRecord.version as number,
    generationRequestId: rowRecord.generation_request_id as string,
    actionType: rowRecord.action_type as AiProposalRecord['actionType'],
    expiresAt: rowRecord.expires_at as string,
    reviewDigest: rowRecord.review_digest as string,
    state: rowRecord.state as AiProposalRecord['state'],
    inputVersions,
    operations,
    selectedOperationIds: selected as string[] | null,
    appliedAt: rowRecord.applied_at as string | null,
  };
}

export function createPostgresAiProposalTransaction(client: PostgresTransactionClient): AiProposalTransaction {
  if (!client || typeof client !== 'object' || typeof client.query !== 'function') dependencyFailure();
  const columns = 'owner_id, id, contract_version, version, generation_request_id, action_type, expires_at, review_digest, state, input_versions, operations, selected_operation_ids, applied_at';
  return {
    create: async (record, now) => {
      validateRecord(record, now);
      const inserted = await client.query(`insert into df_private.ai_proposals
        (owner_id, id, contract_version, version, generation_request_id, action_type, expires_at, review_digest, state, input_versions, operations, selected_operation_ids, applied_at)
        values ($1, $2, $3, $4, $5, $6, $7, $8, 'ready', $9::jsonb, $10::jsonb, null, null)
        on conflict (owner_id, generation_request_id, version) do nothing
        returning ${columns}`, [record.ownerId, record.id, record.contractVersion, record.version, record.generationRequestId, record.actionType, record.expiresAt, record.reviewDigest, JSON.stringify(record.inputVersions), JSON.stringify(record.operations)]);
      const insertedRows = resultRows(inserted);
      if (insertedRows.length === 1) return asRecord(insertedRows[0], { ownerId: record.ownerId, proposalId: record.id });
      const existing = await client.query(`select ${columns} from df_private.ai_proposals where owner_id = $1 and generation_request_id = $2 and version = $3 for update`, [record.ownerId, record.generationRequestId, record.version]);
      const existingRows = resultRows(existing);
      if (existingRows.length !== 1 || !isRecord(existingRows[0])) dependencyFailure();
      const existingId = existingRows[0].id;
      if (typeof existingId !== 'string') dependencyFailure();
      const canonical = asRecord(existingRows[0], { ownerId: record.ownerId, proposalId: existingId });
      if (!sameCreateIntent(canonical, record)) conflict();
      return canonical;
    },
    load: async (ownerId, proposalId) => {
      validateIds(ownerId, proposalId);
      const result = await client.query(`select ${columns} from df_private.ai_proposals where owner_id = $1 and id = $2 for update`, [ownerId, proposalId]);
      const rows = resultRows(result);
      return rows.length === 0 ? null : asRecord(rows[0], { ownerId, proposalId });
    },
    markApplied: async (input) => {
      validateIds(input.ownerId, input.proposalId);
      if (!Number.isSafeInteger(input.expectedVersion) || input.expectedVersion < 1 || !isSha256(input.reviewDigest)
        || !Array.isArray(input.selectedOperationIds) || input.selectedOperationIds.length < 1 || input.selectedOperationIds.length > 25
        || !isPlainJsonValueForBoundary(input.selectedOperationIds) || !input.selectedOperationIds.every((id) => isUuid(id))
        || typeof input.appliedAt !== 'string' || typeof input.now !== 'string'
        || !Number.isFinite(Date.parse(input.appliedAt)) || !Number.isFinite(Date.parse(input.now))) invalid();
      const result = await client.query(`update df_private.ai_proposals
        set state = 'applied', selected_operation_ids = $6::jsonb, applied_at = $7, updated_at = now()
        where owner_id = $1 and id = $2 and version = $3 and review_digest = $4 and state = 'ready' and expires_at > $5
        returning ${columns}`, [input.ownerId, input.proposalId, input.expectedVersion, input.reviewDigest, input.now, JSON.stringify(input.selectedOperationIds), input.appliedAt]);
      const rows = resultRows(result);
      if (rows.length !== 1) conflict();
      return asRecord(rows[0], { ownerId: input.ownerId, proposalId: input.proposalId });
    },
  };
}

export function createPostgresAiProposalStore(input: { runner: PostgresTransactionRunner }): AiProposalStore {
  if (!input || typeof input !== 'object' || !input.runner || typeof input.runner !== 'object' || typeof input.runner.withTransaction !== 'function') invalid();
  return {
    withOwnerTransaction: (ownerId, operation) => {
      if (!isUuid(ownerId) || typeof operation !== 'function') invalid();
      return input.runner.withTransaction((client) => operation(createPostgresAiProposalTransaction(client)));
    },
  };
}
