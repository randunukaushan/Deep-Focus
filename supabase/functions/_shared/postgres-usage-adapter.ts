/** Local PostgreSQL candidate for server-authoritative usage reservations. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { admitServerCapability, type CapabilityAdmission, type ServerCapability } from './entitlement-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { readPostgresEntitlement } from './postgres-entitlement-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { reserveUsageAtomically, settleUsageReceipt, type UsageAllowance, type UsageReservationDecision, type UsageReservationReceipt, type UsageReservationStore, type UsageSettlementDecision, type UsageTransactionStore } from './usage-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }

function capability(value: unknown): ServerCapability {
  if (value !== 'ai' && value !== 'cloud_resources') invalid();
  return value;
}

function allowanceRow(row: Record<string, unknown>, expected: { ownerId: string; capability: ServerCapability; periodKey: string }): UsageAllowance {
  if (row.owner_id !== expected.ownerId || row.capability !== expected.capability || row.period_key !== expected.periodKey
    || typeof row.owner_id !== 'string' || !UUID.test(row.owner_id) || !['ai', 'cloud_resources'].includes(String(row.capability))
    || typeof row.period_key !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(row.period_key)
    || !Number.isInteger(row.limit_units) || !Number.isInteger(row.consumed_units) || !Number.isInteger(row.reserved_units)
    || typeof row.policy_version !== 'string') dependencyFailure();
  const limitUnits = row.limit_units as number;
  const consumedUnits = row.consumed_units as number;
  const reservedUnits = row.reserved_units as number;
  return { ownerId: row.owner_id, capability: row.capability as ServerCapability, periodKey: row.period_key, limitUnits, consumedUnits, reservedUnits, policyVersion: row.policy_version };
}

function receiptRow(row: Record<string, unknown>, expected: { ownerId: string; receiptId: string }): UsageReservationReceipt {
  if (row.receipt_id !== expected.receiptId || row.owner_id !== expected.ownerId
    || typeof row.receipt_id !== 'string' || !UUID.test(row.receipt_id) || typeof row.owner_id !== 'string' || !UUID.test(row.owner_id)
    || !['ai', 'cloud_resources'].includes(String(row.capability)) || typeof row.period_key !== 'string' || !Number.isInteger(row.units)
    || typeof row.policy_version !== 'string' || !['reserved', 'consumed', 'released'].includes(String(row.status))
    || typeof row.remaining_units !== 'number' || !Number.isInteger(row.remaining_units) || (row.remaining_units as number) < 0) dependencyFailure();
  const units = row.units as number;
  const remainingUnits = row.remaining_units as number;
  return {
    receiptId: row.receipt_id, ownerId: row.owner_id,
    decision: { allowed: true, ownerId: row.owner_id, capability: row.capability as ServerCapability, periodKey: row.period_key, units, remainingUnits, policyVersion: row.policy_version },
    status: row.status as UsageReservationReceipt['status'],
  };
}

function createStore(client: { query: <Row extends Record<string, unknown> = Record<string, unknown>>(sql: string, params: readonly unknown[]) => Promise<{ rows: Row[] }> }): UsageReservationStore {
  return {
    readReceipt: async (ownerId, receiptId) => {
      if (!UUID.test(ownerId) || !UUID.test(receiptId)) invalid();
      const result = await client.query(`select receipt_id, owner_id, capability, period_key, units, policy_version, remaining_units, status from df_private.usage_reservation_receipts where owner_id = $1 and receipt_id = $2 for update`, [ownerId, receiptId]);
      return result.rows.length === 0 ? null : receiptRow(result.rows[0], { ownerId, receiptId });
    },
    readAllowance: async (ownerId, requestedCapability, periodKey) => {
      if (!UUID.test(ownerId) || !/^\d{4}-(0[1-9]|1[0-2])$/.test(periodKey)) invalid();
      const result = await client.query(`select owner_id, capability, period_key, limit_units, consumed_units, reserved_units, policy_version from df_private.capability_allowances where owner_id = $1 and capability = $2 and period_key = $3 for update`, [ownerId, capability(requestedCapability), periodKey]);
      return result.rows.length === 0 ? null : allowanceRow(result.rows[0], { ownerId, capability: capability(requestedCapability), periodKey });
    },
    commitReservation: async (input) => {
      if (!UUID.test(input.ownerId) || !UUID.test(input.receiptId) || !Number.isSafeInteger(input.units) || input.units < 1 || input.units > 1000) invalid();
      const updated = await client.query<{ owner_id: string; capability: ServerCapability; period_key: string; limit_units: number; consumed_units: number; reserved_units: number; policy_version: string }>(
        `update df_private.capability_allowances
         set reserved_units = reserved_units + $4, updated_at = now()
         where owner_id = $1 and capability = $2 and period_key = $3
           and consumed_units + reserved_units + $4 <= limit_units
         returning owner_id, capability, period_key, limit_units, consumed_units, reserved_units, policy_version`,
        [input.ownerId, input.capability, input.periodKey, input.units],
      );
      const row = updated.rows[0];
      if (!row) throw new SafeBoundaryError(409, 'LIMIT_EXCEEDED');
      if (row.owner_id !== input.ownerId || row.capability !== input.capability || row.period_key !== input.periodKey) dependencyFailure();
      const remainingUnits = row.limit_units - row.consumed_units - row.reserved_units;
      if (remainingUnits < 0 || row.policy_version !== input.decision.policyVersion) dependencyFailure();
      const insertedReceipt = await client.query<{ receipt_id: string; owner_id: string; capability: ServerCapability; period_key: string }>(
        `insert into df_private.usage_reservation_receipts (owner_id, receipt_id, capability, period_key, units, policy_version, remaining_units, status)
         values ($1, $2, $3, $4, $5, $6, $7, 'reserved')
         returning receipt_id, owner_id, capability, period_key`,
        [input.ownerId, input.receiptId, input.capability, input.periodKey, input.units, row.policy_version, remainingUnits],
      );
      const insertedRow = insertedReceipt.rows[0];
      if (insertedReceipt.rows.length !== 1 || !insertedRow
        || insertedRow.receipt_id !== input.receiptId
        || insertedRow.owner_id !== input.ownerId
        || insertedRow.capability !== input.capability
        || insertedRow.period_key !== input.periodKey) dependencyFailure();
    },
    commitSettlement: async (input) => {
      if (!UUID.test(input.ownerId) || !UUID.test(input.receiptId)) invalid();
      const receipt = await client.query<{ owner_id: string; receipt_id: string; capability: ServerCapability; period_key: string; units: number; status: string }>(`select owner_id, receipt_id, capability, period_key, units, status from df_private.usage_reservation_receipts where owner_id = $1 and receipt_id = $2 for update`, [input.ownerId, input.receiptId]);
      const row = receipt.rows[0];
      if (!row || row.owner_id !== input.ownerId || row.receipt_id !== input.receiptId || row.status !== 'reserved') throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
      const delta = input.to === 'consumed'
        ? 'consumed_units = consumed_units + $4, reserved_units = reserved_units - $4'
        : 'reserved_units = reserved_units - $4';
      const allowance = await client.query<{ owner_id: string; capability: ServerCapability; period_key: string }>(`update df_private.capability_allowances set ${delta}, updated_at = now() where owner_id = $1 and capability = $2 and period_key = $3 and reserved_units >= $4 returning owner_id, capability, period_key`, [input.ownerId, row.capability, row.period_key, row.units]);
      if (allowance.rows.length !== 1 || allowance.rows[0]?.owner_id !== input.ownerId
        || allowance.rows[0]?.capability !== row.capability || allowance.rows[0]?.period_key !== row.period_key) dependencyFailure();
      const updatedReceipt = await client.query<{ receipt_id: string; owner_id: string; capability: ServerCapability; period_key: string; status: string }>(
        `update df_private.usage_reservation_receipts set status = $3, updated_at = now() where owner_id = $1 and receipt_id = $2 and status = 'reserved' returning receipt_id, owner_id, capability, period_key, status`,
        [input.ownerId, input.receiptId, input.to],
      );
      const updatedRow = updatedReceipt.rows[0];
      if (updatedReceipt.rows.length !== 1 || !updatedRow
        || updatedRow.receipt_id !== input.receiptId
        || updatedRow.owner_id !== input.ownerId
        || updatedRow.capability !== row.capability
        || updatedRow.period_key !== row.period_key
        || updatedRow.status !== input.to) dependencyFailure();
    },
  };
}

export function createPostgresUsageTransactionStore(input: { runner: PostgresTransactionRunner }): UsageTransactionStore {
  return { withTransaction: (operation) => input.runner.withTransaction((client) => operation(createStore(client))) };
}

export function createPostgresUsageService(input: { runner: PostgresTransactionRunner }): {
  reserve: (value: { verifiedActorId: string; capability: ServerCapability; periodKey: string; units: number; receiptId: string; now: string; sessionId: string }) => Promise<UsageReservationDecision & { replayed?: boolean }>;
  settle: (value: { verifiedActorId: string; receiptId: string; action: 'consume' | 'release'; sessionId: string }) => Promise<UsageSettlementDecision>;
} {
  return {
    reserve: (value) => input.runner.withTransaction(async (client) => {
      await recheckPostgresAppSession(client, value.verifiedActorId, value.sessionId);
      const entitlement = await readPostgresEntitlement(client, value.verifiedActorId, value.capability, value.sessionId);
      const admission = admitServerCapability({ verifiedActorId: value.verifiedActorId, capability: value.capability, entitlement, now: value.now });
      return reserveUsageAtomically({ ...value, admission, store: createStore(client) });
    }),
    settle: (value) => input.runner.withTransaction(async (client) => {
      await recheckPostgresAppSession(client, value.verifiedActorId, value.sessionId);
      return settleUsageReceipt({ ...value, store: createStore(client) });
    }),
  };
}

export function createPostgresCapabilityUsageReader(input: { runner: PostgresTransactionRunner }): {
  read: (value: { verifiedActorId: string; capability: ServerCapability; periodKey: string; now: string; sessionId: string }) => Promise<{ admission: CapabilityAdmission; allowance: UsageAllowance | null }>;
} {
  return {
    read: (value) => input.runner.withTransaction(async (client) => {
      await recheckPostgresAppSession(client, value.verifiedActorId, value.sessionId);
      const entitlement = await readPostgresEntitlement(client, value.verifiedActorId, value.capability, value.sessionId);
      const admission = admitServerCapability({ verifiedActorId: value.verifiedActorId, capability: value.capability, entitlement, now: value.now });
      if (!admission.allowed) return { admission, allowance: null };
      const allowance = await createStore(client).readAllowance(value.verifiedActorId, value.capability, value.periodKey);
      return { admission, allowance };
    }),
  };
}
