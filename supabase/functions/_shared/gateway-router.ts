/** Server-only allowlist for the approved personal-core operation slice. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

export type GatewayOperation =
  | 'getMe' | 'patchMe' | 'listTasks' | 'createTask' | 'getTask' | 'patchTask'
  | 'applyTaskAction' | 'deleteTask' | 'listGoals' | 'createGoal' | 'getGoal' | 'getGoalProgress' | 'getAnalyticsSummary' | 'getAiProposal' | 'createAiGeneration' | 'getAiGenerationRequest' | 'cancelAiGeneration' | 'getPrivacyJob' | 'createPrivacyExport' | 'patchGoal' | 'deleteGoal' | 'getSettings' | 'patchSettings' | 'listSessions' | 'listAccountSessions' | 'listBreaks' | 'listReminders' | 'getPlan' | 'listPlans' | 'applyPlanAction' | 'patchPlan'
  | 'applyAiProposal' | 'getAiUsage' | 'getBillingEntitlements' | 'getBillingCatalog' | 'revokeAccountSessions' | 'signOut'
  | 'startSession' | 'getSession' | 'applySessionEvent' | 'recordBreak' | 'createReminder' | 'patchReminder' | 'deleteReminder' | 'pullSync' | 'pushSync' | 'getSyncSnapshot' | 'getSyncSnapshotPage' | 'createSyncSnapshot';

/**
 * `bootstrapAccount` is deliberately not a normal routed operation: it runs
 * before an app-session row exists. It is still owner-bound after provider
 * claim verification and must use the same server-side rate-limit counter.
 */
export type GatewayRateLimitOperation = GatewayOperation | 'bootstrapAccount';

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
  { method: 'GET', pattern: /^\/v1\/goals\/([^/]+)\/progress$/, operation: 'getGoalProgress', capture: 1 },
  { method: 'PATCH', pattern: /^\/v1\/goals\/([^/]+)$/, operation: 'patchGoal', capture: 1 },
  { method: 'DELETE', pattern: /^\/v1\/goals\/([^/]+)$/, operation: 'deleteGoal', capture: 1 },
  { method: 'GET', pattern: /^\/v1\/settings$/, operation: 'getSettings' },
  { method: 'PATCH', pattern: /^\/v1\/settings$/, operation: 'patchSettings' },
  { method: 'GET', pattern: /^\/v1\/focus-sessions$/, operation: 'listSessions' },
  { method: 'GET', pattern: /^\/v1\/account\/sessions$/, operation: 'listAccountSessions' },
  { method: 'GET', pattern: /^\/v1\/breaks$/, operation: 'listBreaks' },
  { method: 'GET', pattern: /^\/v1\/analytics\/summary$/, operation: 'getAnalyticsSummary' },
  { method: 'GET', pattern: /^\/v1\/ai\/proposals\/([0-9a-f-]+)$/, operation: 'getAiProposal', capture: 1 },
  { method: 'POST', pattern: /^\/v1\/ai\/plan-my-day$/, operation: 'createAiGeneration' },
  { method: 'GET', pattern: /^\/v1\/ai\/requests\/([0-9a-f-]+)$/, operation: 'getAiGenerationRequest', capture: 1 },
  { method: 'GET', pattern: /^\/v1\/plans\/([0-9a-f-]+)$/, operation: 'getPlan', capture: 1 },
  { method: 'GET', pattern: /^\/v1\/plans$/, operation: 'listPlans' },
  { method: 'POST', pattern: /^\/v1\/plans\/([^/]+)\/actions$/, operation: 'applyPlanAction', capture: 1 },
  { method: 'PATCH', pattern: /^\/v1\/plans\/([^/]+)$/, operation: 'patchPlan', capture: 1 },
  { method: 'POST', pattern: /^\/v1\/ai\/requests\/([0-9a-f-]+)\/cancel$/, operation: 'cancelAiGeneration', capture: 1 },
  { method: 'POST', pattern: /^\/v1\/ai\/proposals\/([0-9a-f-]+)\/apply$/, operation: 'applyAiProposal', capture: 1 },
  { method: 'GET', pattern: /^\/v1\/ai\/usage$/, operation: 'getAiUsage' },
  { method: 'GET', pattern: /^\/v1\/billing\/entitlements$/, operation: 'getBillingEntitlements' },
  { method: 'GET', pattern: /^\/v1\/billing\/catalog$/, operation: 'getBillingCatalog' },
  { method: 'POST', pattern: /^\/v1\/account\/sessions\/revoke$/, operation: 'revokeAccountSessions' },
  { method: 'POST', pattern: /^\/v1\/auth\/sign-out$/, operation: 'signOut' },
  { method: 'GET', pattern: /^\/v1\/privacy\/jobs\/([0-9a-f-]+)$/, operation: 'getPrivacyJob', capture: 1 },
  { method: 'POST', pattern: /^\/v1\/privacy\/exports$/, operation: 'createPrivacyExport' },
  { method: 'GET', pattern: /^\/v1\/sync\/pull$/, operation: 'pullSync' },
  { method: 'POST', pattern: /^\/v1\/sync\/push$/, operation: 'pushSync' },
  { method: 'POST', pattern: /^\/v1\/sync\/snapshots$/, operation: 'createSyncSnapshot' },
  { method: 'GET', pattern: /^\/v1\/sync\/snapshots\/([^/]+)$/, operation: 'getSyncSnapshot', capture: 1 },
  { method: 'GET', pattern: /^\/v1\/sync\/snapshots\/([^/]+)\/pages$/, operation: 'getSyncSnapshotPage', capture: 1 },
  { method: 'GET', pattern: /^\/v1\/task-reminders$/, operation: 'listReminders' },
  { method: 'POST', pattern: /^\/v1\/focus-sessions$/, operation: 'startSession' },
  { method: 'GET', pattern: /^\/v1\/focus-sessions\/([^/]+)$/, operation: 'getSession', capture: 1 },
  { method: 'POST', pattern: /^\/v1\/focus-sessions\/([^/]+)\/events$/, operation: 'applySessionEvent', capture: 1 },
  { method: 'POST', pattern: /^\/v1\/breaks$/, operation: 'recordBreak' },
  { method: 'POST', pattern: /^\/v1\/task-reminders$/, operation: 'createReminder' },
  { method: 'PATCH', pattern: /^\/v1\/task-reminders\/([^/]+)$/, operation: 'patchReminder', capture: 1 },
  { method: 'DELETE', pattern: /^\/v1\/task-reminders\/([^/]+)$/, operation: 'deleteReminder', capture: 1 },
];

export function routeGatewayRequest(input: { method: string; path: string }): GatewayRoute {
  if (typeof input.method !== 'string' || typeof input.path !== 'string') throw new SafeBoundaryError(404, 'NOT_FOUND');
  const route = ROUTES.find((candidate) => candidate.method === input.method && candidate.pattern.test(input.path));
  if (!route) throw new SafeBoundaryError(404, 'NOT_FOUND');
  const match = route.pattern.exec(input.path);
  const resourceId = route.capture === undefined ? undefined : match?.[route.capture];
  if (resourceId !== undefined && !isUuid(resourceId)) throw new SafeBoundaryError(404, 'NOT_FOUND');
  return { operation: route.operation, ...(resourceId === undefined ? {} : { resourceId }) };
}
