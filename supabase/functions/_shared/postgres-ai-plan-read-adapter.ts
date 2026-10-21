/** Local PostgreSQL candidate for an owner-bound saved Plan My Day read. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner, PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const PLAN_COLUMNS = 'owner_id, id, workspace_id, generation_request_id, proposal_id, contract_version, version, local_date, time_zone, available_start, available_end, explanation, state, deleted_at, confirmed_at, created_at, updated_at';
const BLOCK_COLUMNS = 'owner_id, plan_id, id, kind, task_id, after_block_id, starts_at, ends_at, reminder_id, version';

export type AiPlanBlock = {
  id: string; kind: 'focus' | 'break'; taskId: string | null; afterBlockId: string | null;
  startsAt: string; endsAt: string; reminderId: string | null; version: number;
};

export type AiPlanRecord = {
  ownerId: string; id: string; workspaceId: string; generationRequestId: string; proposalId: string;
  contractVersion: 2; version: number; localDate: string; timeZone: string; availableStart: string;
  availableEnd: string; explanation: string | null; state: 'active' | 'archived';
  confirmedAt: string; createdAt: string; updatedAt: string; blocks: AiPlanBlock[];
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function validRunner(value: unknown): value is PostgresTransactionRunner { return isRecord(value) && typeof value.withTransaction === 'function'; }
function validClient(value: unknown): value is PostgresTransactionClient { return isRecord(value) && typeof value.query === 'function'; }
function validInstant(value: unknown): value is string { return typeof value === 'string' && INSTANT.test(value) && Number.isFinite(Date.parse(value)); }
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }

function rows(result: unknown): Record<string, unknown>[] {
  if (!result || typeof result !== 'object' || Array.isArray(result)
    || !Array.isArray((result as { rows?: unknown }).rows)
    || !isPlainJsonValueForBoundary((result as { rows: unknown[] }).rows)) unavailable();
  return (result as { rows: Record<string, unknown>[] }).rows;
}

function ids(values: unknown[]): boolean { return values.every(isUuid); }

function mapBlock(row: Record<string, unknown>, expected: { ownerId: string; planId: string }): AiPlanBlock {
  if (!isRecord(row) || row.owner_id !== expected.ownerId || row.plan_id !== expected.planId
    || !ids([row.owner_id, row.plan_id, row.id]) || !['focus', 'break'].includes(String(row.kind))
    || (row.task_id !== null && !isUuid(row.task_id))
    || (row.after_block_id !== null && !isUuid(row.after_block_id))
    || !validInstant(row.starts_at) || !validInstant(row.ends_at) || Date.parse(row.ends_at) <= Date.parse(row.starts_at)
    || (row.reminder_id !== null && !isUuid(row.reminder_id))
    || !Number.isSafeInteger(row.version) || (row.version as number) < 1
    || (row.kind === 'focus' && (row.task_id === null || row.after_block_id !== null))
    || (row.kind === 'break' && (row.task_id !== null || row.after_block_id === null))
    || (row.reminder_id !== null && row.kind !== 'focus')) unavailable();
  return { id: row.id as string, kind: row.kind as 'focus' | 'break', taskId: row.task_id as string | null, afterBlockId: row.after_block_id as string | null, startsAt: row.starts_at as string, endsAt: row.ends_at as string, reminderId: row.reminder_id as string | null, version: row.version as number };
}

function mapPlan(row: Record<string, unknown>, expected: { ownerId: string; planId: string }): AiPlanRecord {
  if (!isRecord(row) || row.owner_id !== expected.ownerId || row.id !== expected.planId
    || !ids([row.owner_id, row.id, row.generation_request_id, row.proposal_id])
    || row.contract_version !== 2 || !Number.isSafeInteger(row.version) || (row.version as number) < 1
    || !isUuid(row.workspace_id) || typeof row.local_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.local_date)
    || typeof row.time_zone !== 'string' || row.time_zone.length < 1 || row.time_zone.length > 100
    || !validInstant(row.available_start) || !validInstant(row.available_end) || Date.parse(row.available_end) <= Date.parse(row.available_start)
    || (row.explanation !== null && (typeof row.explanation !== 'string' || row.explanation.length < 1 || row.explanation.length > 500))
    || (typeof row.state !== 'string' || !['active', 'archived'].includes(row.state))
    || !validInstant(row.confirmed_at) || !validInstant(row.created_at) || !validInstant(row.updated_at)
    || Date.parse(row.confirmed_at) < Date.parse(row.created_at) || Date.parse(row.updated_at) < Date.parse(row.created_at)) unavailable();
  return { ownerId: row.owner_id as string, id: row.id as string, workspaceId: row.workspace_id as string, generationRequestId: row.generation_request_id as string, proposalId: row.proposal_id as string, contractVersion: 2, version: row.version as number, localDate: row.local_date, timeZone: row.time_zone, availableStart: row.available_start, availableEnd: row.available_end, explanation: row.explanation as string | null, state: row.state as AiPlanRecord['state'], confirmedAt: row.confirmed_at, createdAt: row.created_at, updatedAt: row.updated_at, blocks: [] };
}

function validateBlocks(plan: AiPlanRecord, blocks: AiPlanBlock[]): AiPlanBlock[] {
  if (blocks.length < 1 || blocks.length > 100) unavailable();
  const seen = new Set<string>(); const known = new Set<string>(); let previousEnd = -1;
  for (const block of blocks) {
    if (seen.has(block.id) || block.startsAt < plan.availableStart || block.endsAt > plan.availableEnd || Date.parse(block.startsAt) < previousEnd) unavailable();
    if (block.afterBlockId !== null && !known.has(block.afterBlockId)) unavailable();
    seen.add(block.id); known.add(block.id); previousEnd = Date.parse(block.endsAt);
  }
  return blocks;
}

export function createPostgresAiPlanReader(input: { runner: PostgresTransactionRunner }): {
  load: (ownerId: string, planId: string) => Promise<AiPlanRecord | null>;
} {
  if (!isRecord(input) || !validRunner(input.runner)) invalid();
  return {
    load: async (ownerId, planId) => {
      if (!isUuid(ownerId) || !isUuid(planId)) invalid();
      return input.runner.withTransaction((client) => readPostgresAiPlanWithClient(client, ownerId, planId));
    },
  };
}

export async function readPostgresAiPlanWithClient(client: PostgresTransactionClient, ownerId: string, planId: string): Promise<AiPlanRecord | null> {
  if (!validClient(client)) unavailable();
  if (!isUuid(ownerId) || !isUuid(planId)) invalid();
  const planResult = await client.query(`select ${PLAN_COLUMNS} from df_private.ai_plans where owner_id = $1 and id = $2 and deleted_at is null`, [ownerId, planId]);
  const planRows = rows(planResult);
  if (planRows.length === 0) return null;
  if (planRows.length !== 1) unavailable();
  const plan = mapPlan(planRows[0], { ownerId, planId });
  const blockResult = await client.query(`select ${BLOCK_COLUMNS} from df_private.ai_plan_blocks where owner_id = $1 and plan_id = $2 order by starts_at, id`, [ownerId, planId]);
  const blocks = rows(blockResult).map((row) => mapBlock(row, { ownerId, planId }));
  return { ...plan, blocks: validateBlocks(plan, blocks) };
}
