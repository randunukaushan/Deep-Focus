/** Server-only allowlist for the approved personal-core operation slice. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type GatewayOperation =
  | 'getMe' | 'patchMe' | 'listTasks' | 'createTask' | 'getTask' | 'patchTask'
  | 'applyTaskAction' | 'deleteTask' | 'listGoals' | 'createGoal' | 'getGoal' | 'patchGoal' | 'deleteGoal' | 'getSettings' | 'patchSettings' | 'listSessions'
  | 'startSession' | 'getSession' | 'applySessionEvent' | 'recordBreak';

export type GatewayRoute = {
  operation: GatewayOperation;
  resourceId?: string;
};

const ROUTES: readonly { method: string; pattern: RegExp; operation: GatewayOperation; capture?: number }[] = [
  { method: 'GET', pattern: /^\/v1\/me$/, operation: 'getMe' },
  { method: 'PATCH', pattern: /^\/v1\/me$/, operation: 'patchMe' },
  { method: 'GET', pattern: /^\/v1\/tasks$/, operation: 'listTasks' },
  { method: 'POST', pattern: /^\/v1\/tasks$/, operation: 'createTask' },
  { method: 'GET', pattern: /^\/v1\/tasks\/([^/]+)$/, operation: 'getTask', capture: 1 },
  { method: 'PATCH', pattern: /^\/v1\/tasks\/([^/]+)$/, operation: 'patchTask', capture: 1 },
  { method: 'DELETE', pattern: /^\/v1\/tasks\/([^/]+)$/, operation: 'deleteTask', capture: 1 },
  { method: 'POST', pattern: /^\/v1\/tasks\/([^/]+)\/actions$/, operation: 'applyTaskAction', capture: 1 },
  { method: 'GET', pattern: /^\/v1\/goals$/, operation: 'listGoals' },
  { method: 'POST', pattern: /^\/v1\/goals$/, operation: 'createGoal' },
  { method: 'GET', pattern: /^\/v1\/goals\/([^/]+)$/, operation: 'getGoal', capture: 1 },
  { method: 'PATCH', pattern: /^\/v1\/goals\/([^/]+)$/, operation: 'patchGoal', capture: 1 },
  { method: 'DELETE', pattern: /^\/v1\/goals\/([^/]+)$/, operation: 'deleteGoal', capture: 1 },
  { method: 'GET', pattern: /^\/v1\/settings$/, operation: 'getSettings' },
  { method: 'PATCH', pattern: /^\/v1\/settings$/, operation: 'patchSettings' },
  { method: 'GET', pattern: /^\/v1\/focus-sessions$/, operation: 'listSessions' },
  { method: 'POST', pattern: /^\/v1\/focus-sessions$/, operation: 'startSession' },
  { method: 'GET', pattern: /^\/v1\/focus-sessions\/([^/]+)$/, operation: 'getSession', capture: 1 },
  { method: 'POST', pattern: /^\/v1\/focus-sessions\/([^/]+)\/events$/, operation: 'applySessionEvent', capture: 1 },
  { method: 'POST', pattern: /^\/v1\/breaks$/, operation: 'recordBreak' },
];

export function routeGatewayRequest(input: { method: string; path: string }): GatewayRoute {
  const route = ROUTES.find((candidate) => candidate.method === input.method && candidate.pattern.test(input.path));
  if (!route) throw new SafeBoundaryError(404, 'NOT_FOUND');
  const match = route.pattern.exec(input.path);
  const resourceId = route.capture === undefined ? undefined : match?.[route.capture];
  if (resourceId !== undefined && !UUID.test(resourceId)) throw new SafeBoundaryError(404, 'NOT_FOUND');
  return { operation: route.operation, ...(resourceId === undefined ? {} : { resourceId }) };
}
