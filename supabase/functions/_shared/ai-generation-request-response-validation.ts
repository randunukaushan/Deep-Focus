/** Strict public status DTO validation for the canonical Plan My Day request. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const FAILURE_CODES = new Set(['PROVIDER_UNAVAILABLE', 'INVALID_OUTPUT', 'DEADLINE_EXCEEDED', 'ACCESS_REVOKED', 'INTERNAL_FAILURE', 'INPUT_STALE']);

export type AiGenerationRequestStatus = {
  requestId: string;
  actionType: 'plan_my_day';
  version: number;
  createdAt: string;
  updatedAt: string;
  deadlineAt: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  completedAt: string | null;
  result: { proposalId: string; contractVersion: 2 } | null;
  failureCode: string | null;
  reservedActions: 0 | 1;
  consumedActions: 0 | 1;
};

function invalid(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function object(value: unknown): Record<string, unknown> { if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(); return value as Record<string, unknown>; }
function id(value: unknown): string { if (typeof value !== 'string' || !UUID.test(value)) invalid(); return value; }
function instant(value: unknown): string { if (typeof value !== 'string' || !INSTANT.test(value) || !Number.isFinite(Date.parse(value))) invalid(); return value; }
function version(value: unknown): number { if (!Number.isSafeInteger(value) || (value as number) < 1) invalid(); return value as number; }

export function validateAiGenerationRequestStatus(value: unknown): AiGenerationRequestStatus {
  const body = object(value);
  const expected = 'actionType,completedAt,consumedActions,createdAt,deadlineAt,failureCode,requestId,reservedActions,result,status,updatedAt,version';
  if (Object.keys(body).sort().join(',') !== expected || body.actionType !== 'plan_my_day') invalid();
  const requestId = id(body.requestId);
  const versionNumber = version(body.version);
  const createdAt = instant(body.createdAt);
  const updatedAt = instant(body.updatedAt);
  const deadlineAt = instant(body.deadlineAt);
  if (Date.parse(updatedAt) < Date.parse(createdAt) || Date.parse(deadlineAt) <= Date.parse(createdAt)) invalid();
  const status = body.status;
  if (!['pending', 'completed', 'failed', 'cancelled'].includes(String(status))) invalid();
  const normalizedStatus = status as AiGenerationRequestStatus['status'];
  if (normalizedStatus === 'pending') {
    if (body.completedAt !== null || body.result !== null || body.failureCode !== null || body.reservedActions !== 1 || body.consumedActions !== 0) invalid();
  } else {
    const completedAt = instant(body.completedAt);
    if (Date.parse(completedAt) < Date.parse(createdAt) || Date.parse(updatedAt) < Date.parse(completedAt)
      || body.reservedActions !== 0 || (normalizedStatus === 'completed' ? body.consumedActions !== 1 : body.consumedActions !== 0)) invalid();
    if (normalizedStatus === 'completed') {
      const result = object(body.result);
      if (Object.keys(result).sort().join(',') !== 'contractVersion,proposalId' || result.contractVersion !== 2) invalid();
      const failureCode = body.failureCode;
      if (failureCode !== null) invalid();
      return { requestId, actionType: 'plan_my_day', version: versionNumber, createdAt, updatedAt, deadlineAt, status: normalizedStatus, completedAt, result: { proposalId: id(result.proposalId), contractVersion: 2 }, failureCode: null, reservedActions: 0, consumedActions: 1 };
    }
    if (body.result !== null || (normalizedStatus === 'failed'
      ? (typeof body.failureCode !== 'string' || !FAILURE_CODES.has(body.failureCode))
      : body.failureCode !== null)) invalid();
    return { requestId, actionType: 'plan_my_day', version: versionNumber, createdAt, updatedAt, deadlineAt, status: normalizedStatus, completedAt, result: null, failureCode: normalizedStatus === 'failed' ? body.failureCode as string : null, reservedActions: 0, consumedActions: 0 };
  }
  return { requestId, actionType: 'plan_my_day', version: versionNumber, createdAt, updatedAt, deadlineAt, status: 'pending', completedAt: null, result: null, failureCode: null, reservedActions: 1, consumedActions: 0 };
}
