/** Server-only operation DTO admission. Semantic domain rules remain downstream. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { admitGatewayRequest, type GatewayAdmission } from './gateway-admission.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { routeGatewayRequest, type GatewayRoute } from './gateway-router.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { validateGatewayOperationDto } from './gateway-dto-validation.ts';

const CONTRACTS: Record<string, { allowed: readonly string[]; required: readonly string[] }> = {
  patchMe: { allowed: ['expectedVersion', 'displayName'], required: ['expectedVersion', 'displayName'] },
  createTask: { allowed: ['id', 'workspaceId', 'title', 'description', 'priority', 'goalId', 'due'], required: ['id', 'workspaceId', 'title'] },
  patchTask: { allowed: ['expectedVersion', 'title', 'description', 'priority', 'goalId', 'due'], required: ['expectedVersion'] },
  deleteTask: { allowed: ['expectedVersion'], required: ['expectedVersion'] },
  patchSettings: { allowed: ['expectedVersion', 'theme', 'uiLocale', 'defaultFocusDurationMinutes', 'defaultBreakDurationMinutes', 'aiFeaturesEnabled'], required: ['expectedVersion'] },
  patchGoal: { allowed: ['expectedVersion', 'title', 'description'], required: ['expectedVersion'] },
  deleteGoal: { allowed: ['expectedVersion'], required: ['expectedVersion'] },
  applyTaskAction: { allowed: ['id', 'expectedVersion', 'action', 'occurredAt'], required: ['id', 'expectedVersion', 'action', 'occurredAt'] },
  createGoal: { allowed: ['id', 'workspaceId', 'title', 'description', 'type', 'period', 'startsAt', 'endsAt', 'timeZone', 'targetValue', 'targetUnit'], required: ['id', 'workspaceId', 'title', 'type', 'period', 'startsAt', 'endsAt', 'timeZone', 'targetValue', 'targetUnit'] },
  startSession: { allowed: ['id', 'workspaceId', 'taskId', 'plannedMs', 'startedAt'], required: ['id', 'workspaceId', 'plannedMs', 'startedAt'] },
  applySessionEvent: { allowed: ['id', 'expectedVersion', 'type', 'occurredAt', 'clientSequence'], required: ['id', 'expectedVersion', 'type', 'occurredAt', 'clientSequence'] },
  recordBreak: { allowed: ['id', 'focusSessionId', 'startedAt', 'endedAt', 'plannedMs', 'outcome'], required: ['id', 'focusSessionId', 'startedAt', 'endedAt', 'plannedMs', 'outcome'] },
};

export type AdmittedGatewayOperation = {
  route: GatewayRoute;
  request: GatewayAdmission;
};

export function admitGatewayOperation(input: {
  method: string;
  path: string;
  actorId: string;
  headers: Record<string, string | undefined>;
  bodyText?: string;
}): AdmittedGatewayOperation {
  const route = routeGatewayRequest(input);
  const contract = CONTRACTS[route.operation];
  const request = admitGatewayRequest({ ...input, allowedBodyKeys: contract?.allowed });
  if (!contract) {
    if (request.body !== null) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
    return { route, request };
  }
  if (!request.body || contract.required.some((key) => !Object.prototype.hasOwnProperty.call(request.body, key))) {
    throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  }
  validateGatewayOperationDto(route.operation, request.body);
  if (route.operation === 'applyTaskAction' && request.body.id !== route.resourceId) {
    throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  }
  return { route, request };
}
