/** Local owner-bound PostgreSQL read handlers for the gateway candidate. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner, PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';
import type { GatewayHandler, GatewayHandlerContext } from './gateway-execution.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { signReminderListCursor, verifyReminderListCursor, signSessionListCursor, verifySessionListCursor, signAppSessionListCursor, verifyAppSessionListCursor, signBreakListCursor, verifyBreakListCursor, signPlanListCursor, verifyPlanListCursor } from './resource-list-cursor.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { validateAnalyticsQuery } from './analytics-query-validation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresAiProposalTransaction } from './postgres-ai-proposal-adapter.ts';
import type { AiProposalRecord } from './postgres-ai-proposal-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresAiGenerationRequestReader } from './postgres-ai-generation-request-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { validatePrivacyJobResponse } from './privacy-job-validation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { readPostgresAiPlanWithClient } from './postgres-ai-plan-read-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function resultRows(result: unknown): Record<string, unknown>[] {
  if (!result || typeof result !== 'object' || Array.isArray(result)
    || !Array.isArray((result as { rows?: unknown }).rows)
    || !isPlainJsonValueForBoundary((result as { rows: unknown[] }).rows)) dependencyFailure();
  const rows = (result as { rows: unknown[] }).rows;
  if (rows.some((row) => !row || typeof row !== 'object' || Array.isArray(row))) dependencyFailure();
  return rows as Record<string, unknown>[];
}

function safeBigint(value: unknown, minimum: bigint, maximum = MAX_SAFE): number | null {
  if (Number.isSafeInteger(value) && BigInt(value as number) >= minimum && BigInt(value as number) <= maximum) return value as number;
  if (typeof value !== 'string' || !DECIMAL.test(value)) return null;
  try {
    const parsed = BigInt(value);
    return parsed >= minimum && parsed <= maximum ? Number(parsed) : null;
  } catch { return null; }
}

function ownedRow(row: Record<string, unknown>, expectedId?: string, expectedOwnerId?: string): void {
  if (typeof row.id !== 'string' || !UUID.test(row.id) || (expectedId !== undefined && row.id !== expectedId)
    || (expectedOwnerId !== undefined && row.owner_id !== expectedOwnerId)) dependencyFailure();
}

function readHandler(runner: PostgresTransactionRunner, read: (client: PostgresTransactionClient, context: GatewayHandlerContext) => Promise<{ status: 200; body: Record<string, unknown> }>): GatewayHandler {
  return async (context) => runner.withTransaction(async (client) => {
    if (!context.sessionId) throw new SafeBoundaryError(401, 'AUTH_REQUIRED');
    await recheckPostgresAppSession(client, context.actorId, context.sessionId);
    return read(client, context);
  });
}

function taskRow(row: Record<string, unknown>): Record<string, unknown> {
  return {
    id: row.id, workspaceId: row.workspace_id, goalId: row.goal_id ?? null, title: row.title,
    description: row.description ?? null, status: row.status, priority: row.priority ?? null,
    due: row.due_kind === 'date' ? { kind: 'date', date: row.due_date } : row.due_kind === 'instant' ? { kind: 'instant', at: row.due_at } : { kind: 'none' },
    version: row.version,
  };
}

function goalRow(row: Record<string, unknown>): Record<string, unknown> {
  const targetValue = safeBigint(row.target_value, 1n);
  if (targetValue === null) dependencyFailure();
  return { id: row.id, workspaceId: row.workspace_id, title: row.title, description: row.description ?? null, type: row.type, period: row.period, targetValue, targetUnit: row.target_unit, startsAt: row.starts_at, endsAt: row.ends_at, timeZone: row.time_zone, status: row.status, version: row.version };
}

function sessionRow(row: Record<string, unknown>): Record<string, unknown> {
  const plannedMs = safeBigint(row.planned_ms, 1n);
  const focusedMs = safeBigint(row.focused_ms, 0n);
  const pausedMs = safeBigint(row.paused_ms, 0n);
  if (plannedMs === null || focusedMs === null || pausedMs === null || focusedMs > plannedMs
    || !['active', 'paused', 'completed', 'cancelled'].includes(String(row.status))) dependencyFailure();
  return { id: row.id, workspaceId: row.workspace_id, taskId: row.task_id ?? null, taskTitleSnapshot: row.task_title_snapshot ?? null, status: row.status, plannedMs, focusedMs, pausedMs, startedAt: row.started_at, endedAt: row.ended_at ?? null, version: row.version };
}

function reminderRow(row: Record<string, unknown>): Record<string, unknown> {
  if (typeof row.id !== 'string' || typeof row.task_id !== 'string' || typeof row.scheduled_for !== 'string'
    || Number.isNaN(Date.parse(row.scheduled_for)) || typeof row.time_zone !== 'string'
    || typeof row.enabled !== 'boolean' || row.delivery !== 'local_device'
    || !Number.isInteger(row.version) || (row.version as number) < 1 || typeof row.updated_at !== 'string'
    || Number.isNaN(Date.parse(row.updated_at))) dependencyFailure();
  return { id: row.id, taskId: row.task_id, scheduledFor: row.scheduled_for, timeZone: row.time_zone,
    enabled: row.enabled, delivery: row.delivery, version: row.version, updatedAt: row.updated_at };
}

function savedPlanRow(record: Awaited<ReturnType<typeof readPostgresAiPlanWithClient>>): Record<string, unknown> {
  if (!record) dependencyFailure();
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    localDate: record.localDate,
    timeZone: record.timeZone,
    availableStart: record.availableStart,
    availableEnd: record.availableEnd,
    explanation: record.explanation,
    blocks: record.blocks.map((block) => block.kind === 'focus'
      ? { id: block.id, kind: 'focus', taskId: block.taskId, startsAt: block.startsAt, endsAt: block.endsAt, reminderId: block.reminderId }
      : { id: block.id, kind: 'break', afterBlockId: block.afterBlockId, startsAt: block.startsAt, endsAt: block.endsAt }),
    version: record.version,
    createdAt: record.createdAt,
    sourceProposalId: record.proposalId,
    state: record.state,
    updatedAt: record.updatedAt,
  };
}

function settingsRow(row: Record<string, unknown>): Record<string, unknown> {
  if (typeof row.id !== 'string' || typeof row.owner_id !== 'string' || typeof row.theme !== 'string' || !['system', 'light', 'dark'].includes(row.theme)
    || typeof row.ui_locale !== 'string' || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(row.ui_locale)
    || !Number.isSafeInteger(row.default_focus_duration_minutes) || (row.default_focus_duration_minutes as number) < 1 || (row.default_focus_duration_minutes as number) > 1440
    || ![5, 10, 15].includes(row.default_break_duration_minutes as number) || typeof row.ai_features_enabled !== 'boolean'
    || !Number.isInteger(row.version) || (row.version as number) < 1 || typeof row.updated_at !== 'string' || Number.isNaN(Date.parse(row.updated_at))) dependencyFailure();
  return { id: row.id, version: row.version, theme: row.theme, uiLocale: row.ui_locale, defaultFocusDurationMinutes: row.default_focus_duration_minutes, defaultBreakDurationMinutes: row.default_break_duration_minutes, aiFeaturesEnabled: row.ai_features_enabled, updatedAt: row.updated_at };
}

function appSessionRow(row: Record<string, unknown>, ownerId: string, currentSessionId: string | undefined): Record<string, unknown> {
  const issuedAt = typeof row.issued_at === 'string' ? Date.parse(row.issued_at) : Number.NaN;
  const expiresAt = typeof row.expires_at === 'string' ? Date.parse(row.expires_at) : Number.NaN;
  const revokedAt = row.revoked_at === null ? null : typeof row.revoked_at === 'string' ? Date.parse(row.revoked_at) : Number.NaN;
  if (row.owner_id !== ownerId || typeof row.session_id !== 'string' || !UUID.test(row.session_id)
    || !['active', 'revoked'].includes(String(row.status)) || !Number.isFinite(issuedAt)
    || !Number.isFinite(expiresAt) || expiresAt <= issuedAt
    || (row.revoked_at !== null && !Number.isFinite(revokedAt))
    || ((row.status === 'revoked') !== (row.revoked_at !== null))
    || (revokedAt !== null && revokedAt < issuedAt)) dependencyFailure();
  return { id: row.session_id, status: row.status, current: row.session_id === currentSessionId, issuedAt: row.issued_at, expiresAt: row.expires_at, revokedAt: row.revoked_at ?? null };
}

function breakRow(row: Record<string, unknown>, ownerId: string): Record<string, unknown> {
  const plannedMs = safeBigint(row.planned_ms, 1n, 86400000n);
  const actualMs = safeBigint(row.actual_ms, 0n, 86400000n);
  if (row.owner_id !== ownerId || typeof row.id !== 'string' || !UUID.test(row.id) || typeof row.focus_session_id !== 'string' || !UUID.test(row.focus_session_id)
    || typeof row.started_at !== 'string' || Number.isNaN(Date.parse(row.started_at)) || typeof row.ended_at !== 'string' || Number.isNaN(Date.parse(row.ended_at))
    || plannedMs === null || actualMs === null
    || !['completed', 'ended_early'].includes(String(row.outcome)) || !Number.isSafeInteger(row.version) || (row.version as number) < 1
    || !['pending', 'verified', 'needs_review'].includes(String(row.verification_state))) dependencyFailure();
  return { id: row.id, focusSessionId: row.focus_session_id, startedAt: row.started_at, endedAt: row.ended_at, plannedMs, actualMs, outcome: row.outcome, version: row.version, verificationState: row.verification_state };
}

function goalProgress(row: Record<string, unknown>, expectedOwnerId: string, expectedGoalId: string, expectedUnit: 'ms' | 'count'): { currentValue: number; contributionCount: number } {
  if (row.owner_id !== expectedOwnerId || row.goal_id !== expectedGoalId || row.source_kind !== 'focus_session'
    || row.value_unit !== expectedUnit || typeof row.id !== 'string' || !UUID.test(row.id)
    || typeof row.value !== 'string' || !DECIMAL.test(row.value)) dependencyFailure();
  try {
    const value = BigInt(row.value);
    if (value < 0n || value > BigInt(Number.MAX_SAFE_INTEGER)) dependencyFailure();
    return { currentValue: Number(value), contributionCount: 1 };
  } catch { dependencyFailure(); }
}

function aiProposalRow(record: AiProposalRecord, now: string): Record<string, unknown> {
  if (!Number.isFinite(Date.parse(now))) dependencyFailure();
  if (record.state === 'ready' && Date.parse(record.expiresAt) <= Date.parse(now)) throw new SafeBoundaryError(410, 'AI_PROPOSAL_EXPIRED');
  const base = { contractVersion: record.contractVersion, id: record.id, version: record.version, generationRequestId: record.generationRequestId, actionType: record.actionType, expiresAt: record.expiresAt, reviewDigest: record.reviewDigest };
  if (record.state === 'ready') return { ...base, state: 'ready', inputVersions: record.inputVersions, operations: record.operations };
  if (record.state === 'applied' && record.appliedAt && record.selectedOperationIds) return { ...base, state: 'applied', appliedAt: record.appliedAt, selectedOperationIds: record.selectedOperationIds };
  dependencyFailure();
}

function privacyJobRow(row: Record<string, unknown>, ownerId: string, expectedId: string): Record<string, unknown> {
  if (row.owner_id !== ownerId || row.job_id !== expectedId) dependencyFailure();
  try {
    return validatePrivacyJobResponse({ data: {
      id: row.job_id,
      kind: row.kind,
      state: row.state,
      updatedAt: row.updated_at,
      ...(row.safe_error_code === null || row.safe_error_code === undefined ? {} : { safeErrorCode: row.safe_error_code }),
    } }).data;
  } catch { dependencyFailure(); }
}

export function createPostgresGatewayReadHandlers(input: { runner: PostgresTransactionRunner; listCursorSecret?: string; now?: () => string; cursorTtlMs?: number; analyticsMaxRangeMs?: number }): Record<string, GatewayHandler> {
  return {
    getMe: readHandler(input.runner, async (client, context) => {
      const result = await client.query<{ owner_id: string; display_name: string; account_state: string; version: number }>(
        `select owner_id, display_name, account_state, version from df_private.profiles
         where owner_id = $1 and account_state = 'active'`, [context.actorId],
      );
      const rows = resultRows(result);
      if (rows.length === 0) throw new SafeBoundaryError(404, 'NOT_FOUND');
      if (rows.length !== 1) dependencyFailure();
      const row = rows[0];
      if (row.owner_id !== context.actorId || typeof row.display_name !== 'string' || row.account_state !== 'active' || !Number.isInteger(row.version)) dependencyFailure();
      return { status: 200, body: { id: row.owner_id, displayName: row.display_name, accountState: row.account_state, version: row.version } };
    }),
    getSettings: readHandler(input.runner, async (client, context) => {
      const result = await client.query(`select id, owner_id, theme, ui_locale, default_focus_duration_minutes, default_break_duration_minutes, ai_features_enabled, version, updated_at from df_private.user_settings where owner_id = $1`, [context.actorId]);
      const rows = resultRows(result);
      if (rows.length !== 1) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const row = rows[0];
      if (row.owner_id !== context.actorId) dependencyFailure();
      return { status: 200, body: { data: settingsRow(row) } };
    }),
    listTasks: readHandler(input.runner, async (client, context) => {
      const result = await client.query(
        `select id, owner_id, workspace_id, goal_id, title, description, status, priority, due_kind, due_date, due_at, version
         from df_private.tasks where owner_id = $1 and deleted_at is null order by created_at, id limit 100`, [context.actorId],
      );
      const rows = resultRows(result);
      return { status: 200, body: { items: rows.map((row) => { ownedRow(row, undefined, context.actorId); return taskRow(row); }) } };
    }),
    getTask: readHandler(input.runner, async (client, context) => {
      if (!context.resourceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const result = await client.query(`select id, owner_id, workspace_id, goal_id, title, description, status, priority, due_kind, due_date, due_at, version from df_private.tasks where id = $1 and owner_id = $2 and deleted_at is null`, [context.resourceId, context.actorId]);
      const rows = resultRows(result);
      if (rows.length !== 1) throw new SafeBoundaryError(404, 'NOT_FOUND');
      ownedRow(rows[0], context.resourceId, context.actorId);
      return { status: 200, body: taskRow(rows[0]) };
    }),
    listGoals: readHandler(input.runner, async (client, context) => {
      const result = await client.query(`select id, owner_id, workspace_id, title, description, type, period, target_value, target_unit, starts_at, ends_at, time_zone, status, version from df_private.goals where owner_id = $1 and deleted_at is null order by starts_at, id limit 100`, [context.actorId]);
      const rows = resultRows(result);
      return { status: 200, body: { items: rows.map((row) => { ownedRow(row, undefined, context.actorId); return goalRow(row); }) } };
    }),
    getGoal: readHandler(input.runner, async (client, context) => {
      if (!context.resourceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const result = await client.query(`select id, owner_id, workspace_id, title, description, type, period, target_value, target_unit, starts_at, ends_at, time_zone, status, version from df_private.goals where id = $1 and owner_id = $2 and deleted_at is null`, [context.resourceId, context.actorId]);
      const rows = resultRows(result);
      if (rows.length !== 1) throw new SafeBoundaryError(404, 'NOT_FOUND');
      ownedRow(rows[0], context.resourceId, context.actorId);
      return { status: 200, body: goalRow(rows[0]) };
    }),
    getGoalProgress: readHandler(input.runner, async (client, context) => {
      if (!context.resourceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const now = input.now?.() ?? new Date().toISOString();
      if (!Number.isFinite(Date.parse(now))) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
      const goalResult = await client.query(`select id, owner_id, workspace_id, title, description, type, period, target_value, target_unit, starts_at, ends_at, time_zone, status, version, deleted_at
        from df_private.goals where id = $1 and owner_id = $2`, [context.resourceId, context.actorId]);
      const goalRows = resultRows(goalResult);
      if (goalRows.length !== 1 || goalRows[0].deleted_at !== null) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const selectedGoal = goalRows[0];
      const goalType = selectedGoal.type;
      const goalStatus = selectedGoal.status;
      if (selectedGoal.owner_id !== context.actorId || selectedGoal.id !== context.resourceId || typeof goalType !== 'string'
        || typeof goalStatus !== 'string' || !['focus_time', 'session_count'].includes(goalType)
        || !['active', 'completed'].includes(goalStatus)) dependencyFailure();
      const expectedUnit = goalType === 'focus_time' ? 'ms' : 'count';
      const contributionResult = await client.query(`select id, owner_id, goal_id, source_kind, value_unit, value::text as value
        from df_private.goal_contributions where owner_id = $1 and goal_id = $2 and source_kind = 'focus_session' order by attributed_at asc, id asc`, [context.actorId, context.resourceId]);
      let currentValue = 0;
      let contributionCount = 0;
      for (const row of resultRows(contributionResult)) {
        const contribution = goalProgress(row, context.actorId, context.resourceId, expectedUnit);
        if (!Number.isSafeInteger(currentValue + contribution.currentValue)) dependencyFailure();
        currentValue += contribution.currentValue;
        contributionCount += contribution.contributionCount;
      }
      const sequenceResult = await client.query(`select coalesce(max(sequence), 0)::text as source_sequence from df_private.sync_changes where owner_id = $1`, [context.actorId]);
      const sequenceRows = resultRows(sequenceResult);
      if (sequenceRows.length !== 1) dependencyFailure();
      const sourceSequence = sequenceRows[0]?.source_sequence;
      if (typeof sourceSequence !== 'string' || !DECIMAL.test(sourceSequence)) dependencyFailure();
      return {
        status: 200,
        body: { data: { goal: goalRow(selectedGoal), meta: { asOf: now, sourceSequence, ruleVersion: 'goal-attribution-v1', status: 'current' }, progress: { currentValue, contributionCount } } },
      };
    }),
    getAnalyticsSummary: readHandler(input.runner, async (client, context) => {
      if (input.analyticsMaxRangeMs === undefined) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
      const query = validateAnalyticsQuery(context.query, input.analyticsMaxRangeMs);
      const now = input.now?.() ?? new Date().toISOString();
      if (!Number.isFinite(Date.parse(now))) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
      const [sessionResult, taskResult, sequenceResult] = await Promise.all([
        client.query(`select coalesce(sum(focused_ms), 0)::text as verified_focus_ms, count(*)::text as completed_session_count
          from df_private.focus_sessions where owner_id = $1 and status = 'completed' and ended_at >= $2::timestamptz and ended_at < $3::timestamptz`, [context.actorId, query.start, query.end]),
        client.query(`select count(*)::text as completed_task_count from df_private.tasks
          where owner_id = $1 and status = 'completed' and completed_at >= $2::timestamptz and completed_at < $3::timestamptz`, [context.actorId, query.start, query.end]),
        client.query(`select coalesce(max(sequence), 0)::text as source_sequence from df_private.sync_changes where owner_id = $1`, [context.actorId]),
      ]);
      const sessionRows = resultRows(sessionResult); const taskRows = resultRows(taskResult); const sequenceRows = resultRows(sequenceResult);
      if (sessionRows.length !== 1 || taskRows.length !== 1 || sequenceRows.length !== 1) dependencyFailure();
      const session = sessionRows[0]; const task = taskRows[0]; const sourceSequence = sequenceRows[0]?.source_sequence;
      const focus = session?.verified_focus_ms; const sessions = session?.completed_session_count; const tasks = task?.completed_task_count;
      if (typeof focus !== 'string' || !DECIMAL.test(focus) || typeof sessions !== 'string' || !DECIMAL.test(sessions)
        || typeof tasks !== 'string' || !DECIMAL.test(tasks) || typeof sourceSequence !== 'string' || !DECIMAL.test(sourceSequence)) dependencyFailure();
      const verifiedFocusMs = Number(BigInt(focus)); const completedSessionCount = Number(BigInt(sessions)); const completedTaskCount = Number(BigInt(tasks));
      if (![verifiedFocusMs, completedSessionCount, completedTaskCount].every(Number.isSafeInteger)) dependencyFailure();
      return { status: 200, body: { data: { period: { start: query.start, end: query.end, timeZone: query.timeZone }, meta: { asOf: now, sourceSequence, ruleVersion: 'analytics-summary-v1', status: 'current' }, summary: { verifiedFocusMs, completedSessionCount, completedTaskCount } } } };
    }),
    getAiProposal: readHandler(input.runner, async (client, context) => {
      if (!context.resourceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const now = input.now?.() ?? new Date().toISOString();
      const proposal = await createPostgresAiProposalTransaction(client).load(context.actorId, context.resourceId);
      if (!proposal) throw new SafeBoundaryError(404, 'NOT_FOUND');
      return { status: 200, body: { data: aiProposalRow(proposal, now) } };
    }),
    getAiGenerationRequest: readHandler(input.runner, async (client, context) => {
      if (!context.resourceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const request = await createPostgresAiGenerationRequestReader(client).loadStatus(context.actorId, context.resourceId);
      if (!request) throw new SafeBoundaryError(404, 'NOT_FOUND');
      return { status: 200, body: { data: request } };
    }),
    getPlan: readHandler(input.runner, async (client, context) => {
      if (!context.resourceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const plan = await readPostgresAiPlanWithClient(client, context.actorId, context.resourceId);
      if (!plan) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const reminderIds = plan.blocks.filter((block) => block.kind === 'focus' && block.reminderId !== null).map((block) => block.reminderId as string);
      if (new Set(reminderIds).size !== reminderIds.length || (plan.state === 'archived' && reminderIds.length > 0)) dependencyFailure();
      const reminders = reminderIds.length === 0 ? [] : (await client.query(`select r.id, r.owner_id, r.task_id, r.scheduled_for, r.time_zone, r.enabled, r.delivery, r.version, r.updated_at, r.deleted_at, b.task_id as bound_task_id
        from df_private.task_reminders r join df_private.ai_plan_blocks b on b.owner_id = r.owner_id and b.reminder_id = r.id
        where r.owner_id = $1 and b.plan_id = $2 and r.deleted_at is null order by r.id`, [context.actorId, context.resourceId])).rows;
      const reminderRows = resultRows({ rows: reminders });
      if (reminderRows.length !== reminderIds.length) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const data = reminderRows.map((row) => {
        if (row.bound_task_id !== row.task_id) dependencyFailure();
        return reminderRow(row);
      });
      return { status: 200, body: { data: { plan: savedPlanRow(plan), boundReminders: data } } };
    }),
    listPlans: readHandler(input.runner, async (client, context) => {
      const limit = context.query?.limit ?? 50;
      const now = input.now?.() ?? new Date().toISOString();
      if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isFinite(Date.parse(now))) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
      let before: { createdAt: string; id: string } | null = null;
      if (context.query?.cursor) {
        if (!input.listCursorSecret) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
        try { const cursor = await verifyPlanListCursor(context.query.cursor, input.listCursorSecret, { ownerId: context.actorId, limit, now }); before = { createdAt: cursor.beforeCreatedAt, id: cursor.beforeId }; } catch { throw new SafeBoundaryError(410, 'CURSOR_EXPIRED'); }
      }
      const params: unknown[] = [context.actorId];
      const beforeClause = before ? ' and (created_at, id) < ($2::timestamptz, $3::uuid)' : '';
      if (before) params.push(before.createdAt, before.id);
      const result = await client.query(`select id, created_at from df_private.ai_plans where owner_id = $1 and deleted_at is null${beforeClause} order by created_at desc, id desc limit ${limit + 1}`, params);
      const rows = resultRows(result);
      const hasNext = rows.length > limit; const selected = hasNext ? rows.slice(0, limit) : rows;
      const items = [];
      for (const row of selected) {
        if (typeof row.id !== 'string' || !UUID.test(row.id) || typeof row.created_at !== 'string' || Number.isNaN(Date.parse(row.created_at))) dependencyFailure();
        const plan = await readPostgresAiPlanWithClient(client, context.actorId, row.id);
        if (!plan) throw new SafeBoundaryError(404, 'NOT_FOUND');
        items.push(savedPlanRow(plan));
      }
      let nextCursor: string | null = null;
      if (hasNext) {
        if (!input.listCursorSecret) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
        const last = selected.at(-1) as { created_at: string; id: string } | undefined;
        if (!last) dependencyFailure();
        const expiresAt = new Date(Date.parse(now) + (input.cursorTtlMs ?? 15 * 60 * 1000)).toISOString();
        nextCursor = await signPlanListCursor({ version: 1, ownerId: context.actorId, endpoint: 'plans', limit, beforeCreatedAt: last.created_at, beforeId: last.id, expiresAt }, input.listCursorSecret);
      }
      return { status: 200, body: { data: items, meta: { nextCursor } } };
    }),
    getPrivacyJob: readHandler(input.runner, async (client, context) => {
      if (!context.resourceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const result = await client.query(`select job_id, owner_id, kind, state, updated_at, safe_error_code
        from df_private.privacy_jobs where owner_id = $1 and job_id = $2`, [context.actorId, context.resourceId]);
      const rows = resultRows(result);
      if (rows.length !== 1) throw new SafeBoundaryError(404, 'NOT_FOUND');
      return { status: 200, body: { data: privacyJobRow(rows[0], context.actorId, context.resourceId) } };
    }),
    listSessions: readHandler(input.runner, async (client, context) => {
      const limit = context.query?.limit ?? 50;
      const now = input.now?.() ?? new Date().toISOString();
      if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isFinite(Date.parse(now))) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
      let before: { startedAt: string; id: string } | null = null;
      if (context.query?.cursor) {
        if (!input.listCursorSecret) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
        try {
          const cursor = await verifySessionListCursor(context.query.cursor, input.listCursorSecret, { ownerId: context.actorId, limit, now });
          before = { startedAt: cursor.beforeStartedAt, id: cursor.beforeId };
        } catch { throw new SafeBoundaryError(410, 'CURSOR_EXPIRED'); }
      }
      const params: unknown[] = [context.actorId];
      const beforeClause = before ? ' and (started_at, id) < ($2::timestamptz, $3::uuid)' : '';
      if (before) params.push(before.startedAt, before.id);
      const result = await client.query(`select id, owner_id, workspace_id, task_id, task_title_snapshot, status, planned_ms, focused_ms, paused_ms, started_at, ended_at, version
        from df_private.focus_sessions where owner_id = $1${beforeClause} order by started_at desc, id desc limit ${limit + 1}`, params);
      const rows = resultRows(result).map((row) => { ownedRow(row, undefined, context.actorId); return sessionRow(row); });
      const hasNext = rows.length > limit;
      const data = hasNext ? rows.slice(0, limit) : rows;
      let nextCursor: string | null = null;
      if (hasNext) {
        if (!input.listCursorSecret) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
        const last = data.at(-1) as { startedAt: string; id: string };
        const expiresAt = new Date(Date.parse(now) + (input.cursorTtlMs ?? 15 * 60 * 1000)).toISOString();
        nextCursor = await signSessionListCursor({ version: 1, ownerId: context.actorId, endpoint: 'focus-sessions', limit, beforeStartedAt: last.startedAt, beforeId: last.id, expiresAt }, input.listCursorSecret);
      }
      return { status: 200, body: { items: data, meta: { nextCursor } } };
    }),
    listAccountSessions: readHandler(input.runner, async (client, context) => {
      const limit = context.query?.limit ?? 50;
      const now = input.now?.() ?? new Date().toISOString();
      if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isFinite(Date.parse(now))) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
      let before: { issuedAt: string; id: string } | null = null;
      if (context.query?.cursor) {
        if (!input.listCursorSecret) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
        try {
          const cursor = await verifyAppSessionListCursor(context.query.cursor, input.listCursorSecret, { ownerId: context.actorId, limit, now });
          before = { issuedAt: cursor.beforeIssuedAt, id: cursor.beforeId };
        } catch { throw new SafeBoundaryError(410, 'CURSOR_EXPIRED'); }
      }
      const params: unknown[] = [context.actorId];
      const beforeClause = before ? ' and (issued_at, session_id) < ($2::timestamptz, $3::uuid)' : '';
      if (before) params.push(before.issuedAt, before.id);
      const result = await client.query(`select owner_id, session_id, status, issued_at, expires_at, revoked_at
        from df_private.app_sessions where owner_id = $1${beforeClause} order by issued_at desc, session_id desc limit ${limit + 1}`, params);
      const rows = resultRows(result).map((row) => appSessionRow(row, context.actorId, context.sessionId));
      const hasNext = rows.length > limit;
      const data = hasNext ? rows.slice(0, limit) : rows;
      let nextCursor: string | null = null;
      if (hasNext) {
        if (!input.listCursorSecret) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
        const last = data.at(-1) as { issuedAt: string; id: string };
        const expiresAt = new Date(Date.parse(now) + (input.cursorTtlMs ?? 15 * 60 * 1000)).toISOString();
        nextCursor = await signAppSessionListCursor({ version: 1, ownerId: context.actorId, endpoint: 'account-sessions', limit, beforeIssuedAt: last.issuedAt, beforeId: last.id, expiresAt }, input.listCursorSecret);
      }
      return { status: 200, body: { data, meta: { nextCursor } } };
    }),
    listBreaks: readHandler(input.runner, async (client, context) => {
      const limit = context.query?.limit ?? 50;
      const now = input.now?.() ?? new Date().toISOString();
      if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isFinite(Date.parse(now))) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
      let before: { endedAt: string; id: string } | null = null;
      if (context.query?.cursor) {
        if (!input.listCursorSecret) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
        try {
          const cursor = await verifyBreakListCursor(context.query.cursor, input.listCursorSecret, { ownerId: context.actorId, limit, now });
          before = { endedAt: cursor.beforeEndedAt, id: cursor.beforeId };
        } catch { throw new SafeBoundaryError(410, 'CURSOR_EXPIRED'); }
      }
      const params: unknown[] = [context.actorId];
      const beforeClause = before ? ' and (ended_at, id) < ($2::timestamptz, $3::uuid)' : '';
      if (before) params.push(before.endedAt, before.id);
      const result = await client.query(`select owner_id, id, focus_session_id, started_at, ended_at, planned_ms, actual_ms, outcome, version, verification_state
        from df_private.break_records where owner_id = $1${beforeClause} order by ended_at desc, id desc limit ${limit + 1}`, params);
      const rows = resultRows(result).map((row) => breakRow(row, context.actorId));
      const hasNext = rows.length > limit;
      const data = hasNext ? rows.slice(0, limit) : rows;
      let nextCursor: string | null = null;
      if (hasNext) {
        if (!input.listCursorSecret) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
        const last = data.at(-1) as { endedAt: string; id: string };
        const expiresAt = new Date(Date.parse(now) + (input.cursorTtlMs ?? 15 * 60 * 1000)).toISOString();
        nextCursor = await signBreakListCursor({ version: 1, ownerId: context.actorId, endpoint: 'breaks', limit, beforeEndedAt: last.endedAt, beforeId: last.id, expiresAt }, input.listCursorSecret);
      }
      return { status: 200, body: { data, meta: { nextCursor } } };
    }),
    listReminders: readHandler(input.runner, async (client, context) => {
      const limit = context.query?.limit ?? 50;
      const now = input.now?.() ?? new Date().toISOString();
      if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isFinite(Date.parse(now))) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
      let after: { scheduledFor: string; id: string } | null = null;
      if (context.query?.cursor) {
        if (!input.listCursorSecret) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
        try {
          const cursor = await verifyReminderListCursor(context.query.cursor, input.listCursorSecret, { ownerId: context.actorId, limit, now });
          after = { scheduledFor: cursor.afterScheduledFor, id: cursor.afterId };
        } catch { throw new SafeBoundaryError(410, 'CURSOR_EXPIRED'); }
      }
      const params: unknown[] = [context.actorId];
      const afterClause = after ? ' and (scheduled_for, id) > ($2::timestamptz, $3::uuid)' : '';
      if (after) params.push(after.scheduledFor, after.id);
      const result = await client.query(`select id, owner_id, task_id, scheduled_for, time_zone, enabled, delivery, version, updated_at
         from df_private.task_reminders where owner_id = $1 and deleted_at is null${afterClause}
         order by scheduled_for asc, id asc limit ${limit + 1}`, params);
      const rows = resultRows(result).map((row) => { ownedRow(row, undefined, context.actorId); return reminderRow(row); });
      const hasNext = rows.length > limit;
      const data = hasNext ? rows.slice(0, limit) : rows;
      let nextCursor: string | null = null;
      if (hasNext) {
        if (!input.listCursorSecret) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
        const last = data.at(-1) as { scheduledFor: string; id: string };
        const expiresAt = new Date(Date.parse(now) + (input.cursorTtlMs ?? 15 * 60 * 1000)).toISOString();
        nextCursor = await signReminderListCursor({ version: 1, ownerId: context.actorId, endpoint: 'task-reminders', limit, afterScheduledFor: last.scheduledFor, afterId: last.id, expiresAt }, input.listCursorSecret);
      }
      return { status: 200, body: { data, meta: { nextCursor } } };
    }),
    getSession: readHandler(input.runner, async (client, context) => {
      if (!context.resourceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const result = await client.query(`select id, owner_id, workspace_id, task_id, task_title_snapshot, status, planned_ms, focused_ms, paused_ms, started_at, ended_at, version from df_private.focus_sessions where id = $1 and owner_id = $2`, [context.resourceId, context.actorId]);
      const rows = resultRows(result);
      if (rows.length !== 1) throw new SafeBoundaryError(404, 'NOT_FOUND');
      ownedRow(rows[0], context.resourceId, context.actorId);
      return { status: 200, body: sessionRow(rows[0]) };
    }),
  };
}
