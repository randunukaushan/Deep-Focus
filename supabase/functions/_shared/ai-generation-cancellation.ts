/** Server-only cancellation transition for an owner-bound AI generation request. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { validateAiGenerationRequestStatus, type AiGenerationRequestStatus } from './ai-generation-request-response-validation.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export type AiGenerationCancellationInput = {
  request: AiGenerationRequestStatus;
  reservationId: string;
  now: string;
};

export type AiGenerationCancellationResult = {
  outcome: 'cancelled' | 'already_cancelled' | 'already_terminal';
  request: AiGenerationRequestStatus;
  releaseReservation: boolean;
  reservationId: string;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

export function cancelAiGenerationRequest(input: AiGenerationCancellationInput): AiGenerationCancellationResult {
  if (!input || typeof input !== 'object' || typeof input.reservationId !== 'string'
    || !UUID.test(input.reservationId) || typeof input.now !== 'string'
    || !INSTANT.test(input.now) || !Number.isFinite(Date.parse(input.now))) invalid();
  const request = validateAiGenerationRequestStatus(input.request);
  if (Date.parse(input.now) < Date.parse(request.createdAt) || Date.parse(input.now) < Date.parse(request.updatedAt)) invalid();
  if (request.status === 'pending') {
    const cancelled: AiGenerationRequestStatus = {
      requestId: request.requestId, actionType: 'plan_my_day', version: request.version + 1,
      createdAt: request.createdAt, updatedAt: input.now, deadlineAt: request.deadlineAt,
      status: 'cancelled', completedAt: input.now, result: null, failureCode: null, reservedActions: 0, consumedActions: 0,
    };
    return { outcome: 'cancelled', request: cancelled, releaseReservation: true, reservationId: input.reservationId };
  }
  if (request.status === 'cancelled') return { outcome: 'already_cancelled', request, releaseReservation: false, reservationId: input.reservationId };
  if (request.status === 'completed' || request.status === 'failed') return { outcome: 'already_terminal', request, releaseReservation: false, reservationId: input.reservationId };
  dependencyFailure();
}
