/** Local PostgreSQL candidate for server-authoritative usage reservations. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { admitServerCapability, type CapabilityAdmission, type ServerCapability } from './entitlement-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { readPostgresEntitlement } from './postgres-entitlement-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { reserveUsageAtomically, settleUsageReceipt, type UsageAllowance, type UsageReservationDecision, type UsageReservationReceipt, type UsageReservationStore, type UsageSettlementDecision, type UsageTransactionStore } from './usage-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
type AllowedUsageDecision = Extract<UsageReservationDecision, { allowed: true }>;
function requireAllowedDecision(decision: UsageReservationDecision): AllowedUsageDecision {
  if (!decision.allowed) dependencyFailure();
  return decision;
}
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function resultRows(result: unknown): unknown[] {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) dependencyFailure();
  return result.rows;
}
function isNonNegativeSafeInteger(value: unknown): value is number { return Number.isSafeInteger(value) && (value as number) >= 0; }
function validClient(value: unknown): value is { query: Function } {
  return Boolean(value) && typeof value === 'object' && typeof (value as { query?: unknown }).query === 'function';
}
function requireClient(value: unknown): asserts value is PostgresTransactionClient {
  if (!validClient(value)) dependencyFailure();
}
function validRunner(value: unknown): value is PostgresTransactionRunner {
  return Boolean(value) && typeof value === 'object' && typeof (value as PostgresTransactionRunner).withTransaction === 'function';
}
function validInstant(value: unknown): value is string { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }
function validateReserveInput(value: unknown): asserts value is { verifiedActorId: string; capability: ServerCapability; periodKey: string; units: number; receiptId: string; now: string; sessionId: string } {
  if (!isRecord(value) || !UUID.test(String(value.verifiedActorId)) || typeof value.verifiedActorId !== 'string'
    || !UUID.test(String(value.receiptId)) || typeof value.receiptId !== 'string' || !UUID.test(String(value.sessionId)) || typeof value.sessionId !== 'string'
    || (value.capability !== 'ai' && value.capability !== 'cloud_resources') || typeof value.periodKey !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value.periodKey)
    || !Number.isSafeInteger(value.units) || (value.units as number) < 1 || (value.units as number) > 1000 || !validInstant(value.now)) invalid();
}
function validateSettleInput(value: unknown): asserts value is { verifiedActorId: string; receiptId: string; action: 'consume' | 'release'; sessionId: string } {
  if (!isRecord(value) || typeof value.verifiedActorId !== 'string' || !UUID.test(value.verifiedActorId)
    || typeof value.receiptId !== 'string' || !UUID.test(value.receiptId) || (value.action !== 'consume' && value.action !== 'release')
    || typeof value.sessionId !== 'string' || !UUID.test(value.sessionId)) invalid();
}
function validateReaderInput(value: unknown): asserts value is { verifiedActorId: string; capability: ServerCapability; periodKey: string; now: string; sessionId: string } {
  if (!isRecord(value) || typeof value.verifiedActorId !== 'string' || !UUID.test(value.verifiedActorId)
    || (value.capability !== 'ai' && value.capability !== 'cloud_resources') || typeof value.periodKey !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value.periodKey)
    || !validInstant(value.now) || typeof value.sessionId !== 'string' || !UUID.test(value.sessionId)) invalid();
}

function capability(value: unknown): ServerCapability {
  if (value !== 'ai' && value !== 'cloud_resources') invalid();
  return value;
}

function allowanceRow(row: unknown, expected: { ownerId: string; capability: ServerCapability; periodKey: string }): UsageAllowance {
  if (!isRecord(row) || row.owner_id !== expected.ownerId || row.capability !== expected.capability || row.period_key !== expected.periodKey
    || typeof row.owner_id !== 'string' || !UUID.test(row.owner_id) || !['ai', 'cloud_resources'].includes(String(row.capability))
    || typeof row.period_key !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(row.period_key)
    || !Number.isSafeInteger(row.limit_units) || (row.limit_units as number) < 0
    || !Number.isSafeInteger(row.consumed_units) || (row.consumed_units as number) < 0
    || !Number.isSafeInteger(row.reserved_units) || (row.reserved_units as number) < 0
    || (row.consumed_units as number) + (row.reserved_units as number) > (row.limit_units as number)
    || typeof row.policy_version !== 'string' || row.policy_version.length < 1 || row.policy_version.length > 64) dependencyFailure();
  const limitUnits = row.limit_units as number;
  const consumedUnits = row.consumed_units as number;
  const reservedUnits = row.reserved_units as number;
  return { ownerId: row.owner_id, capability: row.capability as ServerCapability, periodKey: row.period_key, limitUnits, consumedUnits, reservedUnits, policyVersion: row.policy_version };
}

function receiptRow(row: unknown, expected: { ownerId: string; receiptId: string }): UsageReservationReceipt {
  if (!isRecord(row) || row.receipt_id !== expected.receiptId || row.owner_id !== expected.ownerId
    || typeof row.receipt_id !== 'string' || !UUID.test(row.receipt_id) || typeof row.owner_id !== 'string' || !UUID.test(row.owner_id)
    || !['ai', 'cloud_resources'].includes(String(row.capability)) || typeof row.period_key !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(row.period_key)
    || !Number.isSafeInteger(row.units) || (row.units as number) < 1 || (row.units as number) > 1000
    || typeof row.policy_version !== 'string' || row.policy_version.length < 1 || row.policy_version.length > 64
    || !['reserved', 'consumed', 'released'].includes(String(row.status))
    || !Number.isSafeInteger(row.remaining_units) || (row.remaining_units as number) < 0) dependencyFailure();
  const units = row.units as number;
  const remainingUnits = row.remaining_units as number;
  return {
    receiptId: row.receipt_id, ownerId: row.owner_id,
    decision: { allowed: true, ownerId: row.owner_id, capability: row.capability as ServerCapability, periodKey: row.period_key, units, remainingUnits, policyVersion: row.policy_version },
    status: row.status as UsageReservationReceipt['status'],
  };
}

export function createPostgresUsageStore(client: { query: <Row extends Record<string, unknown> = Record<string, unknown>>(sql: string, params: readonly unknown[]) => Promise<{ rows: Row[] }> }): UsageReservationStore {
  if (!validClient(client)) invalid();
  return {
    readReceipt: async (ownerId, receiptId) => {
      if (typeof ownerId !== 'string' || typeof receiptId !== 'string' || !UUID.test(ownerId) || !UUID.test(receiptId)) invalid();
      const result = await client.query(`select receipt_id, owner_id, capability, period_key, units, policy_version, remaining_units, status from df_private.usage_reservation_receipts where owner_id = $1 and receipt_id = $2 for update`, [ownerId, receiptId]);
      const rows = resultRows(result);
      if (rows.length === 0) return null;
      if (rows.length !== 1) dependencyFailure();
      return receiptRow(rows[0], { ownerId, receiptId });
    },
    readAllowance: async (ownerId, requestedCapability, periodKey) => {
      if (typeof ownerId !== 'string' || !UUID.test(ownerId) || typeof periodKey !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(periodKey)) invalid();
      const result = await client.query(`select owner_id, capability, period_key, limit_units, consumed_units, reserved_units, policy_version from df_private.capability_allowances where owner_id = $1 and capability = $2 and period_key = $3 for update`, [ownerId, capability(requestedCapability), periodKey]);
      const rows = resultRows(result);
      if (rows.length === 0) return null;
      if (rows.length !== 1) dependencyFailure();
      return allowanceRow(rows[0], { ownerId, capability: capability(requestedCapability), periodKey });
    },
    commitReservation: async (input) => {
      if (typeof input.ownerId !== 'string' || typeof input.receiptId !== 'string' || !UUID.test(input.ownerId) || !UUID.test(input.receiptId) || !Number.isSafeInteger(input.units) || input.units < 1 || input.units > 1000) invalid();
      const updated = await client.query<{ owner_id: string; capability: ServerCapability; period_key: string; limit_units: number; consumed_units: number; reserved_units: number; policy_version: string }>(
        `update df_private.capability_allowances
         set reserved_units = reserved_units + $4, updated_at = now()
         where owner_id = $1 and capability = $2 and period_key = $3
           and consumed_units + reserved_units + $4 <= limit_units
         returning owner_id, capability, period_key, limit_units, consumed_units, reserved_units, policy_version`,
        [input.ownerId, input.capability, input.periodKey, input.units],
      );
      const updatedRows = resultRows(updated);
      if (updatedRows.length === 0) throw new SafeBoundaryError(409, 'LIMIT_EXCEEDED');
      if (updatedRows.length !== 1 || !isRecord(updatedRows[0])) dependencyFailure();
      const row = updatedRows[0];
      if (row.owner_id !== input.ownerId || row.capability !== input.capability || row.period_key !== input.periodKey) dependencyFailure();
      if (!isNonNegativeSafeInteger(row.limit_units) || !isNonNegativeSafeInteger(row.consumed_units) || !isNonNegativeSafeInteger(row.reserved_units)) dependencyFailure();
      const remainingUnits = row.limit_units - row.consumed_units - row.reserved_units;
      const reservationDecision = input.decision;
      if (!reservationDecision.allowed) dependencyFailure();
      if (remainingUnits < 0 || row.policy_version !== reservationDecision.policyVersion) dependencyFailure();
      const insertedReceipt = await client.query(
        `insert into df_private.usage_reservation_receipts (owner_id, receipt_id, capability, period_key, units, policy_version, remaining_units, status)
         values ($1, $2, $3, $4, $5, $6, $7, 'reserved')
         returning receipt_id, owner_id, capability, period_key, units, policy_version, remaining_units, status`,
        [input.ownerId, input.receiptId, input.capability, input.periodKey, input.units, row.policy_version, remainingUnits],
      );
      const insertedRows = resultRows(insertedReceipt);
      if (insertedRows.length !== 1 || !isRecord(insertedRows[0])) dependencyFailure();
      const insertedRow = receiptRow(insertedRows[0], { ownerId: input.ownerId, receiptId: input.receiptId });
      const insertedDecision = requireAllowedDecision(insertedRow.decision);
      if (insertedRow.status !== 'reserved'
        || insertedDecision.capability !== reservationDecision.capability
        || insertedDecision.periodKey !== reservationDecision.periodKey
        || insertedDecision.units !== reservationDecision.units
        || insertedDecision.policyVersion !== reservationDecision.policyVersion
        || insertedDecision.remainingUnits !== remainingUnits) dependencyFailure();
    },
    commitSettlement: async (input) => {
      if (typeof input.ownerId !== 'string' || typeof input.receiptId !== 'string' || !UUID.test(input.ownerId) || !UUID.test(input.receiptId)) invalid();
      if (input.from !== 'reserved' || (input.to !== 'consumed' && input.to !== 'released')) invalid();
      const receipt = await client.query(`select owner_id, receipt_id, capability, period_key, units, policy_version, remaining_units, status from df_private.usage_reservation_receipts where owner_id = $1 and receipt_id = $2 for update`, [input.ownerId, input.receiptId]);
      const receiptRows = resultRows(receipt);
      if (receiptRows.length === 0) throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
      if (receiptRows.length !== 1) dependencyFailure();
      const stored = receiptRow(receiptRows[0], { ownerId: input.ownerId, receiptId: input.receiptId });
      if (stored.status !== 'reserved') throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
      const storedDecision = requireAllowedDecision(stored.decision);
      const row = { capability: storedDecision.capability, period_key: storedDecision.periodKey, units: storedDecision.units };
      const delta = input.to === 'consumed'
        ? 'consumed_units = consumed_units + $4, reserved_units = reserved_units - $4'
        : 'reserved_units = reserved_units - $4';
      const allowance = await client.query<{ owner_id: string; capability: ServerCapability; period_key: string }>(`update df_private.capability_allowances set ${delta}, updated_at = now() where owner_id = $1 and capability = $2 and period_key = $3 and reserved_units >= $4 returning owner_id, capability, period_key`, [input.ownerId, row.capability, row.period_key, row.units]);
      const allowanceRows = resultRows(allowance);
      if (allowanceRows.length !== 1 || !isRecord(allowanceRows[0]) || allowanceRows[0].owner_id !== input.ownerId
        || allowanceRows[0].capability !== row.capability || allowanceRows[0].period_key !== row.period_key) dependencyFailure();
      const updatedReceipt = await client.query(
        `update df_private.usage_reservation_receipts set status = $3, updated_at = now() where owner_id = $1 and receipt_id = $2 and status = 'reserved' returning receipt_id, owner_id, capability, period_key, units, policy_version, remaining_units, status`,
        [input.ownerId, input.receiptId, input.to],
      );
      const updatedRows = resultRows(updatedReceipt);
      if (updatedRows.length !== 1 || !isRecord(updatedRows[0])) dependencyFailure();
      const updatedRow = receiptRow(updatedRows[0], { ownerId: input.ownerId, receiptId: input.receiptId });
      const updatedDecision = requireAllowedDecision(updatedRow.decision);
      if (updatedRow.status !== input.to
        || updatedDecision.capability !== storedDecision.capability
        || updatedDecision.periodKey !== storedDecision.periodKey
        || updatedDecision.units !== storedDecision.units
        || updatedDecision.policyVersion !== storedDecision.policyVersion
        || updatedDecision.remainingUnits !== storedDecision.remainingUnits) dependencyFailure();
    },
  };
}

export function createPostgresUsageTransactionStore(input: { runner: PostgresTransactionRunner }): UsageTransactionStore {
  if (!input || typeof input !== 'object' || !validRunner(input.runner)) invalid();
  return { withTransaction: (operation) => {
    if (typeof operation !== 'function') invalid();
    return input.runner.withTransaction((client) => {
      requireClient(client);
      return operation(createPostgresUsageStore(client));
    });
  } };
}

export function createPostgresUsageService(input: { runner: PostgresTransactionRunner }): {
  reserve: (value: { verifiedActorId: string; capability: ServerCapability; periodKey: string; units: number; receiptId: string; now: string; sessionId: string }) => Promise<UsageReservationDecision & { replayed?: boolean }>;
  settle: (value: { verifiedActorId: string; receiptId: string; action: 'consume' | 'release'; sessionId: string }) => Promise<UsageSettlementDecision>;
} {
  if (!input || typeof input !== 'object' || !validRunner(input.runner)) invalid();
  return {
    reserve: async (value) => { validateReserveInput(value); return input.runner.withTransaction(async (client) => {
      requireClient(client);
      await recheckPostgresAppSession(client, value.verifiedActorId, value.sessionId);
      const entitlement = await readPostgresEntitlement(client, value.verifiedActorId, value.capability, value.sessionId);
      const admission = admitServerCapability({ verifiedActorId: value.verifiedActorId, capability: value.capability, entitlement, now: value.now });
      return reserveUsageAtomically({ ...value, admission, store: createPostgresUsageStore(client) });
    }); },
    settle: async (value) => { validateSettleInput(value); return input.runner.withTransaction(async (client) => {
      requireClient(client);
      await recheckPostgresAppSession(client, value.verifiedActorId, value.sessionId);
      return settleUsageReceipt({ ...value, store: createPostgresUsageStore(client) });
    }); },
  };
}

export function createPostgresCapabilityUsageReader(input: { runner: PostgresTransactionRunner }): {
  read: (value: { verifiedActorId: string; capability: ServerCapability; periodKey: string; now: string; sessionId: string }) => Promise<{ admission: CapabilityAdmission; allowance: UsageAllowance | null }>;
} {
  if (!input || typeof input !== 'object' || !validRunner(input.runner)) invalid();
  return {
    read: async (value) => { validateReaderInput(value); return input.runner.withTransaction(async (client) => {
      requireClient(client);
      await recheckPostgresAppSession(client, value.verifiedActorId, value.sessionId);
      const entitlement = await readPostgresEntitlement(client, value.verifiedActorId, value.capability, value.sessionId);
      const admission = admitServerCapability({ verifiedActorId: value.verifiedActorId, capability: value.capability, entitlement, now: value.now });
      if (!admission.allowed) return { admission, allowance: null };
      const allowance = await createPostgresUsageStore(client).readAllowance(value.verifiedActorId, value.capability, value.periodKey);
      return { admission, allowance };
    }); },
  };
}
