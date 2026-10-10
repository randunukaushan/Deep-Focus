/** Local owner-bound PostgreSQL read handlers for the gateway candidate. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner, PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';
import type { GatewayHandler, GatewayHandlerContext } from './gateway-execution.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function ownedRow(row: Record<string, unknown>, expectedId?: string): void {
  if (typeof row.id !== 'string' || !UUID.test(row.id) || (expectedId !== undefined && row.id !== expectedId)) dependencyFailure();
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
  return { id: row.id, workspaceId: row.workspace_id, title: row.title, description: row.description ?? null, type: row.type, period: row.period, targetValue: row.target_value, targetUnit: row.target_unit, startsAt: row.starts_at, endsAt: row.ends_at, timeZone: row.time_zone, status: row.status, version: row.version };
}

function sessionRow(row: Record<string, unknown>): Record<string, unknown> {
  return { id: row.id, workspaceId: row.workspace_id, taskId: row.task_id ?? null, taskTitleSnapshot: row.task_title_snapshot ?? null, status: row.status, plannedMs: row.planned_ms, focusedMs: row.focused_ms, pausedMs: row.paused_ms, startedAt: row.started_at, endedAt: row.ended_at ?? null, version: row.version };
}

function settingsRow(row: Record<string, unknown>): Record<string, unknown> {
  if (typeof row.id !== 'string' || typeof row.owner_id !== 'string' || typeof row.theme !== 'string' || !['system', 'light', 'dark'].includes(row.theme)
    || typeof row.ui_locale !== 'string' || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(row.ui_locale)
    || !Number.isSafeInteger(row.default_focus_duration_minutes) || (row.default_focus_duration_minutes as number) < 1 || (row.default_focus_duration_minutes as number) > 1440
    || ![5, 10, 15].includes(row.default_break_duration_minutes as number) || typeof row.ai_features_enabled !== 'boolean'
    || !Number.isInteger(row.version) || (row.version as number) < 1 || typeof row.updated_at !== 'string' || Number.isNaN(Date.parse(row.updated_at))) dependencyFailure();
  return { id: row.id, version: row.version, theme: row.theme, uiLocale: row.ui_locale, defaultFocusDurationMinutes: row.default_focus_duration_minutes, defaultBreakDurationMinutes: row.default_break_duration_minutes, aiFeaturesEnabled: row.ai_features_enabled, updatedAt: row.updated_at };
}

export function createPostgresGatewayReadHandlers(input: { runner: PostgresTransactionRunner }): Record<string, GatewayHandler> {
  return {
    getMe: readHandler(input.runner, async (client, context) => {
      const result = await client.query<{ owner_id: string; display_name: string; account_state: string; version: number }>(
        `select owner_id, display_name, account_state, version from df_private.profiles
         where owner_id = $1 and account_state = 'active'`, [context.actorId],
      );
      const row = result.rows[0];
      if (!row) throw new SafeBoundaryError(404, 'NOT_FOUND');
      if (row.owner_id !== context.actorId || typeof row.display_name !== 'string' || row.account_state !== 'active' || !Number.isInteger(row.version)) dependencyFailure();
      return { status: 200, body: { id: row.owner_id, displayName: row.display_name, accountState: row.account_state, version: row.version } };
    }),
    getSettings: readHandler(input.runner, async (client, context) => {
      const result = await client.query(`select id, owner_id, theme, ui_locale, default_focus_duration_minutes, default_break_duration_minutes, ai_features_enabled, version, updated_at from df_private.user_settings where owner_id = $1`, [context.actorId]);
      if (result.rows.length !== 1) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const row = result.rows[0];
      if (row.owner_id !== context.actorId) dependencyFailure();
      return { status: 200, body: { data: settingsRow(row) } };
    }),
    listTasks: readHandler(input.runner, async (client, context) => {
      const result = await client.query(
        `select id, workspace_id, goal_id, title, description, status, priority, due_kind, due_date, due_at, version
         from df_private.tasks where owner_id = $1 and deleted_at is null order by created_at, id limit 100`, [context.actorId],
      );
      return { status: 200, body: { items: result.rows.map((row) => { ownedRow(row); return taskRow(row); }) } };
    }),
    getTask: readHandler(input.runner, async (client, context) => {
      if (!context.resourceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const result = await client.query(`select id, workspace_id, goal_id, title, description, status, priority, due_kind, due_date, due_at, version from df_private.tasks where id = $1 and owner_id = $2 and deleted_at is null`, [context.resourceId, context.actorId]);
      if (result.rows.length !== 1) throw new SafeBoundaryError(404, 'NOT_FOUND');
      ownedRow(result.rows[0], context.resourceId);
      return { status: 200, body: taskRow(result.rows[0]) };
    }),
    listGoals: readHandler(input.runner, async (client, context) => {
      const result = await client.query(`select id, workspace_id, title, description, type, period, target_value, target_unit, starts_at, ends_at, time_zone, status, version from df_private.goals where owner_id = $1 and deleted_at is null order by starts_at, id limit 100`, [context.actorId]);
      return { status: 200, body: { items: result.rows.map((row) => { ownedRow(row); return goalRow(row); }) } };
    }),
    getGoal: readHandler(input.runner, async (client, context) => {
      if (!context.resourceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const result = await client.query(`select id, workspace_id, title, description, type, period, target_value, target_unit, starts_at, ends_at, time_zone, status, version from df_private.goals where id = $1 and owner_id = $2 and deleted_at is null`, [context.resourceId, context.actorId]);
      if (result.rows.length !== 1) throw new SafeBoundaryError(404, 'NOT_FOUND');
      ownedRow(result.rows[0], context.resourceId);
      return { status: 200, body: goalRow(result.rows[0]) };
    }),
    listSessions: readHandler(input.runner, async (client, context) => {
      const result = await client.query(`select id, workspace_id, task_id, task_title_snapshot, status, planned_ms, focused_ms, paused_ms, started_at, ended_at, version from df_private.focus_sessions where owner_id = $1 order by started_at desc, id desc limit 100`, [context.actorId]);
      return { status: 200, body: { items: result.rows.map((row) => { ownedRow(row); return sessionRow(row); }) } };
    }),
    getSession: readHandler(input.runner, async (client, context) => {
      if (!context.resourceId) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const result = await client.query(`select id, workspace_id, task_id, task_title_snapshot, status, planned_ms, focused_ms, paused_ms, started_at, ended_at, version from df_private.focus_sessions where id = $1 and owner_id = $2`, [context.resourceId, context.actorId]);
      if (result.rows.length !== 1) throw new SafeBoundaryError(404, 'NOT_FOUND');
      ownedRow(result.rows[0], context.resourceId);
      return { status: 200, body: sessionRow(result.rows[0]) };
    }),
  };
}
