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
  applyPlanAction: { allowed: ['action', 'expectedVersion', 'reminderVersions'], required: ['action', 'expectedVersion', 'reminderVersions'] },
  patchPlan: { allowed: ['expectedVersion', 'plan', 'taskVersions', 'reminderActions'], required: ['expectedVersion', 'plan', 'taskVersions', 'reminderActions'] },
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
  createReminder: { allowed: ['id', 'taskId', 'scheduledFor', 'timeZone', 'delivery'], required: ['id', 'taskId', 'scheduledFor', 'timeZone', 'delivery'] },
  patchReminder: { allowed: ['expectedVersion', 'scheduledFor', 'timeZone', 'enabled'], required: ['expectedVersion'] },
  createPrivacyExport: { allowed: ['format', 'scope'], required: ['format', 'scope'] },
  createSyncSnapshot: { allowed: [], required: [] },
  pushSync: { allowed: ['cursorLastSequence', 'nextCursor', 'changes'], required: ['cursorLastSequence', 'nextCursor', 'changes'] },
  deleteReminder: { allowed: ['expectedVersion'], required: ['expectedVersion'] },
  applyAiProposal: { allowed: ['expectedProposalVersion', 'reviewDigest', 'selectedOperationIds'], required: ['expectedProposalVersion', 'reviewDigest', 'selectedOperationIds'] },
  createAiGeneration: { allowed: ['requestId', 'taskIds', 'availableStart', 'availableEnd', 'timeZone', 'preferences'], required: ['requestId', 'taskIds', 'availableStart', 'availableEnd', 'timeZone', 'preferences'] },
  revokeAccountSessions: { allowed: ['scope', 'sessionId'], required: ['scope'] },
  signOut: { allowed: [], required: [] },
  cancelAiGeneration: { allowed: [], required: [] },
};

export type AdmittedGatewayOperation = {
  route: GatewayRoute;
  request: GatewayAdmission;
};

// Only list handlers with an implemented signed cursor contract accept query
// parameters. Other list candidates reject them instead of silently ignoring.
const LIST_OPERATIONS = new Set(['listReminders', 'listSessions', 'listAccountSessions', 'listBreaks', 'listPlans', 'pullSync']);
const SNAPSHOT_PAGE_OPERATIONS = new Set(['getSyncSnapshotPage']);
const ANALYTICS_OPERATIONS = new Set(['getAnalyticsSummary']);

function pathname(path: string): string {
  const value = path.split('?')[0];
  return value;
}

function queryFor(path: string, operation: string): GatewayAdmission['query'] {
  const raw = path.includes('?') ? path.slice(path.indexOf('?') + 1) : '';
  if (ANALYTICS_OPERATIONS.has(operation)) {
    const parsed = new URLSearchParams(raw); const keys = [...parsed.keys()];
    if (keys.length !== 3 || new Set(keys).size !== 3 || keys.some((key) => !['start', 'end', 'timeZone'].includes(key))) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
    const values = Object.fromEntries(keys.map((key) => [key, parsed.get(key)]));
    if (Object.values(values).some((value) => value === null || value.length < 1 || value.length > 128)) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
    return values as GatewayAdmission['query'];
  }
  if (SNAPSHOT_PAGE_OPERATIONS.has(operation)) {
    const parsed = new URLSearchParams(raw); const keys = [...parsed.keys()];
    if (keys.length !== 1 || keys[0] !== 'cursor') throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
    const cursor = parsed.get('cursor');
    if (cursor === null || cursor.length < 1 || cursor.length > 4096) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
    return { cursor };
  }
  if (!raw) return {};
  if (!LIST_OPERATIONS.has(operation)) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  const parsed = new URLSearchParams(raw);
  const keys = [...parsed.keys()];
  if (keys.some((key) => key !== 'cursor' && key !== 'limit') || keys.some((key) => keys.filter((item) => item === key).length > 1)) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  const cursor = parsed.get('cursor'); const limit = parsed.get('limit');
  if (cursor !== null && (cursor.length < 1 || cursor.length > 4096)) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  if (limit !== null && !/^(?:[1-9][0-9]?|100)$/.test(limit)) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  return { ...(cursor === null ? {} : { cursor }), ...(limit === null ? {} : { limit: Number(limit) }) };
}

export function admitGatewayOperation(input: {
  method: string;
  path: string;
  actorId: string;
  headers: Record<string, string | undefined>;
  bodyText?: string;
}): AdmittedGatewayOperation {
  const route = routeGatewayRequest({ ...input, path: pathname(input.path) });
  if (route.operation === 'getPlan') {
    const version = input.headers['Plan-Contract-Version'] ?? input.headers['plan-contract-version'];
    if (version !== '2') throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  }
  const contract = CONTRACTS[route.operation];
  const request = admitGatewayRequest({ ...input, path: pathname(input.path), allowedBodyKeys: contract?.allowed });
  if (!contract) {
    if (request.body !== null) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
    return { route, request: { ...request, query: queryFor(input.path, route.operation) } };
  }
  if (!request.body || contract.required.some((key) => !Object.prototype.hasOwnProperty.call(request.body, key))) {
    throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  }
  validateGatewayOperationDto(route.operation, request.body);
  if (route.operation === 'applyTaskAction' && request.body.id !== route.resourceId) {
    throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  }
  const editablePlan = request.body.plan;
  if (route.operation === 'patchPlan' && (!editablePlan || typeof editablePlan !== 'object' || Array.isArray(editablePlan) || (editablePlan as Record<string, unknown>).id !== route.resourceId)) {
    throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  }
  return { route, request: { ...request, query: queryFor(input.path, route.operation) } };
}
