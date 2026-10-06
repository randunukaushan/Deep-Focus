import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import type { AppSettings } from '@/features/settings/settings-storage';
import type { Goal } from '@/features/goals/goal-types';
import type { Task } from '@/features/tasks/task-types';
import { validateFocusSession } from '@/features/focus/session-engine';
import type { FocusSession } from '@/features/focus/session-types';

const DATABASE_NAME = 'deep-focus-local.db';
const LOCAL_OWNER_ID = 'local:device';
const SCHEMA_VERSION = 1;
const LEGACY_IMPORT_VERSION = 1;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS local_owners (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('device_local', 'account')),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS goals (
  owner_id TEXT NOT NULL REFERENCES local_owners(id),
  id TEXT NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('focus_time', 'session_count')),
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly')),
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
  target_value INTEGER NOT NULL CHECK (target_value > 0),
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  period_timezone TEXT,
  legacy_open_period INTEGER NOT NULL DEFAULT 0 CHECK (legacy_open_period IN (0, 1)),
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  legacy_extra_json TEXT,
  PRIMARY KEY (owner_id, id),
  CHECK ((legacy_open_period = 1 AND ends_at IS NULL AND period_timezone IS NULL)
      OR (legacy_open_period = 0 AND ends_at IS NOT NULL AND period_timezone IS NOT NULL
          AND starts_at < ends_at)),
  CHECK ((status = 'completed' AND completed_at IS NOT NULL)
      OR (status <> 'completed' AND completed_at IS NULL))
);
CREATE TABLE IF NOT EXISTS tasks (
  owner_id TEXT NOT NULL REFERENCES local_owners(id),
  id TEXT NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  goal_id TEXT,
  priority TEXT CHECK (priority IS NULL OR priority IN ('low', 'medium', 'high')),
  due_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  legacy_extra_json TEXT,
  PRIMARY KEY (owner_id, id),
  FOREIGN KEY (owner_id, goal_id) REFERENCES goals(owner_id, id),
  CHECK ((status = 'completed' AND completed_at IS NOT NULL)
      OR (status <> 'completed' AND completed_at IS NULL))
);
CREATE TABLE IF NOT EXISTS focus_sessions (
  owner_id TEXT NOT NULL REFERENCES local_owners(id),
  id TEXT NOT NULL,
  task_id TEXT,
  task_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  planned_duration_seconds INTEGER NOT NULL CHECK (planned_duration_seconds > 0),
  focused_duration_seconds INTEGER NOT NULL CHECK (focused_duration_seconds >= 0),
  paused_duration_seconds INTEGER NOT NULL CHECK (paused_duration_seconds >= 0),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  cancelled_at TEXT,
  last_paused_at TEXT,
  last_resumed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  legacy_extra_json TEXT,
  PRIMARY KEY (owner_id, id),
  FOREIGN KEY (owner_id, task_id) REFERENCES tasks(owner_id, id),
  CHECK (focused_duration_seconds <= planned_duration_seconds),
  CHECK ((status = 'completed' AND completed_at IS NOT NULL AND cancelled_at IS NULL)
      OR (status = 'cancelled' AND cancelled_at IS NOT NULL AND completed_at IS NULL)
      OR (status IN ('active', 'paused') AND completed_at IS NULL AND cancelled_at IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS one_open_focus_session_per_owner
  ON focus_sessions(owner_id) WHERE status IN ('active', 'paused');
CREATE TABLE IF NOT EXISTS active_focus_sessions (
  owner_id TEXT PRIMARY KEY NOT NULL REFERENCES local_owners(id),
  session_id TEXT NOT NULL,
  FOREIGN KEY (owner_id, session_id) REFERENCES focus_sessions(owner_id, id)
);
CREATE TABLE IF NOT EXISTS user_settings (
  owner_id TEXT PRIMARY KEY NOT NULL REFERENCES local_owners(id),
  default_break_duration_minutes INTEGER NOT NULL
    CHECK (default_break_duration_minutes IN (5, 10, 15)),
  legacy_extra_json TEXT
);
CREATE TABLE IF NOT EXISTS local_migrations (
  version INTEGER PRIMARY KEY NOT NULL,
  name TEXT UNIQUE NOT NULL,
  completed_at TEXT NOT NULL
);
`;

type SessionRow = {
  id: string; status: FocusSession['status']; task_name: string | null;
  planned_duration_seconds: number; focused_duration_seconds: number;
  paused_duration_seconds: number; created_at: string; started_at: string;
  completed_at: string | null; cancelled_at: string | null;
  last_paused_at: string | null; last_resumed_at: string | null;
  updated_at: string; legacy_extra_json: string | null;
};

type GoalRow = {
  id: string; title: string; description: string | null; type: Goal['type']; period: Goal['period'];
  status: Goal['status']; target_value: number; starts_at: string;
  ends_at: string | null; period_timezone: string | null;
  legacy_open_period: number; created_at: string; updated_at: string;
  completed_at: string | null; legacy_extra_json: string | null;
};

type TaskRow = {
  id: string; title: string; description: string | null; status: Task['status'];
  created_at: string; updated_at: string; completed_at: string | null;
  legacy_extra_json: string | null;
};

export type LegacyFileSet = Partial<Record<
  'deep-focus-active-session.json' | 'deep-focus-session-history.json'
  | 'deep-focus-tasks.json' | 'deep-focus-goals.json' | 'deep-focus-settings.json',
  string
>>;

type StoreDependencies = {
  platform: string;
  openDatabase: () => Promise<SQLite.SQLiteDatabase>;
  readLegacyFiles: () => Promise<LegacyFileSet>;
  now?: () => string;
};

function validTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && Number.isFinite(Date.parse(value));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function requireObject(value: unknown, label: string): Record<string, unknown> {
  if (!isObject(value)) throw new RangeError(`INVALID_RECORD: ${label} must be an object`);
  return value;
}

function requireArray(value: unknown, label: string): Record<string, unknown>[] {
  if (!Array.isArray(value) || !value.every(isObject)) {
    throw new RangeError(`INVALID_RECORD: ${label} must be an array of objects`);
  }
  return value;
}

function parseLegacy(files: LegacyFileSet) {
  const parse = (name: keyof LegacyFileSet): unknown => {
    const source = files[name];
    if (source === undefined) return undefined;
    try { return JSON.parse(source); }
    catch { throw new RangeError(`INVALID_RECORD: malformed ${name}; source preserved`); }
  };

  const activeValue = parse('deep-focus-active-session.json');
  const activeSession = activeValue === undefined ? null : requireObject(activeValue, 'active session');
  const historyValue = parse('deep-focus-session-history.json');
  const history = historyValue === undefined ? [] : requireArray(historyValue, 'session history');
  const tasksValue = parse('deep-focus-tasks.json');
  const tasks = tasksValue === undefined ? [] : requireArray(tasksValue, 'tasks');
  const goalsValue = parse('deep-focus-goals.json');
  const goals = goalsValue === undefined ? [] : requireArray(goalsValue, 'goals');
  const settingsValue = parse('deep-focus-settings.json');
  const settings = settingsValue === undefined ? null : requireObject(settingsValue, 'settings');

  const sessions = new Map<string, FocusSession>();
  for (const raw of history) {
    const session = validateLegacySession(raw, 'history');
    if (session.status !== 'completed' && session.status !== 'cancelled') {
      throw new RangeError('INVALID_RECORD: nonterminal session in history; source preserved');
    }
    insertUniqueSession(sessions, session);
  }
  if (activeSession) insertUniqueSession(sessions, validateLegacySession(activeSession, 'active session'));

  const sessionValues = [...sessions.values()];
  const openSessions = sessionValues.filter((session) => session.status === 'active' || session.status === 'paused');
  if (openSessions.length > 1) throw new RangeError('INVALID_RECORD: multiple open sessions; source preserved');
  const activeId = activeSession ? String(activeSession.id) : null;
  if (activeSession && !sessions.has(activeId!)) throw new RangeError('INVALID_RECORD: active session ID is invalid');

  const taskIds = new Set<string>();
  for (const task of tasks) {
    validateLegacyTask(task);
    if (taskIds.has(task.id as string)) throw new RangeError('INVALID_RECORD: duplicate task ID; source preserved');
    taskIds.add(task.id as string);
  }

  const goalIds = new Set<string>();
  for (const goal of goals) {
    validateLegacyGoal(goal);
    if (goalIds.has(goal.id as string)) throw new RangeError('INVALID_RECORD: duplicate goal ID; source preserved');
    goalIds.add(goal.id as string);
  }
  if (settings && !isAppSettings(settings)) throw new RangeError('INVALID_RECORD: unsupported settings value; source preserved');

  return {
    sessions: sessionValues,
    activeId,
    tasks: tasks as unknown as Task[],
    goals: goals as unknown as Goal[],
    settings: settings as unknown as AppSettings | null,
  };
}

function validateLegacySession(value: Record<string, unknown>, label: string): FocusSession {
  try { validateFocusSession(value); }
  catch { throw new RangeError(`INVALID_RECORD: invalid ${label}; source preserved`); }
  if ((value.status === 'completed' && (!validTimestamp(value.completedAt) || value.cancelledAt !== undefined))
    || (value.status === 'cancelled' && (!validTimestamp(value.cancelledAt) || value.completedAt !== undefined))
    || ((value.status === 'active' || value.status === 'paused') && (value.completedAt !== undefined || value.cancelledAt !== undefined))) {
    throw new RangeError(`INVALID_RECORD: inconsistent ${label} lifecycle; source preserved`);
  }
  return value as unknown as FocusSession;
}

function validateLegacyTask(task: Record<string, unknown>) {
  if (typeof task.id !== 'string' || !task.id.trim() || typeof task.title !== 'string' || !task.title.trim()
    || !['pending', 'in_progress', 'completed', 'cancelled'].includes(String(task.status))
    || !validTimestamp(task.createdAt) || !validTimestamp(task.updatedAt)
    || (task.completedAt !== undefined && !validTimestamp(task.completedAt))
    || (task.status === 'completed' && !validTimestamp(task.completedAt))) {
    throw new RangeError('INVALID_RECORD: invalid task; source preserved');
  }
}

function validateLegacyGoal(goal: Record<string, unknown>) {
  const validType = goal.type === 'focus_time' || goal.type === 'session_count';
  const validPeriod = goal.period === 'weekly' || goal.period === 'monthly';
  const validStatus = ['active', 'completed', 'cancelled', 'expired'].includes(String(goal.status));
  const target = goal.targetValue;
  const normalizedTarget = goal.type === 'focus_time' && typeof target === 'number' ? target * 60 : target;
  if (typeof goal.id !== 'string' || !goal.id.trim() || typeof goal.title !== 'string' || !goal.title.trim()
    || !validType || !validPeriod || !validStatus || typeof target !== 'number'
    || !Number.isSafeInteger(normalizedTarget) || (normalizedTarget as number) <= 0
    || !validTimestamp(goal.createdAt) || !validTimestamp(goal.updatedAt)
    || (goal.status === 'completed' && !validTimestamp(goal.completedAt))
    || (goal.completedAt !== undefined && !validTimestamp(goal.completedAt))) {
    throw new RangeError('INVALID_RECORD: invalid goal; source preserved');
  }
}

function isAppSettings(value: Record<string, unknown>): value is Record<string, 5 | 10 | 15> {
  return value.defaultBreakDurationMinutes === 5 || value.defaultBreakDurationMinutes === 10
    || value.defaultBreakDurationMinutes === 15;
}

function insertUniqueSession(sessions: Map<string, FocusSession>, session: FocusSession) {
  const existing = sessions.get(session.id);
  if (existing && canonicalJson(existing) !== canonicalJson(session)) {
    throw new RangeError('INVALID_RECORD: conflicting duplicate session ID; source preserved');
  }
  sessions.set(session.id, existing ?? session);
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (isObject(value)) return `{${Object.keys(value).filter((key) => value[key] !== undefined).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

function extraJson(value: Record<string, unknown>, modeledKeys: readonly string[]) {
  const extras = Object.fromEntries(Object.entries(value).filter(([key]) => !modeledKeys.includes(key)));
  return Object.keys(extras).length ? JSON.stringify(extras) : null;
}

function mergeExtra(value: Record<string, unknown>, extra: string | null) {
  if (!extra) return value;
  let parsed: unknown;
  try { parsed = JSON.parse(extra); }
  catch { throw new RangeError('INVALID_RECORD: invalid preserved legacy fields'); }
  if (!isObject(parsed)) throw new RangeError('INVALID_RECORD: invalid preserved legacy fields');
  return { ...parsed, ...value };
}

const SESSION_KEYS = ['id', 'status', 'taskName', 'plannedDurationSeconds', 'focusedDurationSeconds', 'pausedDurationSeconds', 'createdAt', 'startedAt', 'completedAt', 'cancelledAt', 'lastPausedAt', 'lastResumedAt'];
const TASK_KEYS = ['id', 'title', 'description', 'status', 'createdAt', 'updatedAt', 'completedAt'];
const GOAL_KEYS = ['id', 'title', 'description', 'type', 'period', 'status', 'targetValue', 'createdAt', 'updatedAt', 'completedAt', 'startsAt', 'endsAt', 'periodTimeZone', 'legacyOpenPeriod'];

function sessionValues(session: FocusSession, now: string) {
  return [LOCAL_OWNER_ID, session.id, (session as FocusSession & { taskId?: string }).taskId ?? null,
    session.taskName ?? null, session.status, session.plannedDurationSeconds,
    session.focusedDurationSeconds, session.pausedDurationSeconds, session.startedAt,
    session.completedAt ?? null, session.cancelledAt ?? null, session.lastPausedAt ?? null,
    session.lastResumedAt ?? null, session.createdAt, now, extraJson(session as unknown as Record<string, unknown>, SESSION_KEYS)];
}

function sessionUpdateValues(session: FocusSession, now: string) {
  const values = sessionValues(session, now);
  return [...values.slice(2, 13), values[14], values[15]];
}

function taskValues(task: Task) {
  const value = task as Task & { priority?: string; dueAt?: string; goalId?: string };
  return [LOCAL_OWNER_ID, task.id, task.title.trim(), task.description ?? null, task.status,
    value.goalId ?? null, value.priority ?? null, value.dueAt ?? null, task.completedAt ?? null,
    task.createdAt, task.updatedAt, extraJson(task as unknown as Record<string, unknown>, TASK_KEYS)];
}

function goalValues(goal: Goal) {
  return [LOCAL_OWNER_ID, goal.id, goal.title.trim(), goal.description ?? null, goal.type, goal.period,
    goal.status, goal.targetValue, goal.startsAt, goal.endsAt, goal.periodTimeZone,
    goal.legacyOpenPeriod ? 1 : 0, goal.completedAt ?? null, goal.createdAt, goal.updatedAt,
    extraJson(goal as unknown as Record<string, unknown>, GOAL_KEYS)];
}

function sessionFromRow(row: SessionRow, taskId?: string | null): FocusSession {
  return mergeExtra({
    id: row.id, status: row.status, ...(taskId ? { taskId } : {}),
    ...(row.task_name !== null ? { taskName: row.task_name } : {}),
    plannedDurationSeconds: row.planned_duration_seconds,
    focusedDurationSeconds: row.focused_duration_seconds,
    pausedDurationSeconds: row.paused_duration_seconds,
    createdAt: row.created_at, startedAt: row.started_at,
    ...(row.completed_at !== null ? { completedAt: row.completed_at } : {}),
    ...(row.cancelled_at !== null ? { cancelledAt: row.cancelled_at } : {}),
    ...(row.last_paused_at !== null ? { lastPausedAt: row.last_paused_at } : {}),
    ...(row.last_resumed_at !== null ? { lastResumedAt: row.last_resumed_at } : {}),
  }, row.legacy_extra_json) as unknown as FocusSession;
}

function goalFromRow(row: GoalRow): Goal {
  return mergeExtra({
    id: row.id, title: row.title, type: row.type, period: row.period, status: row.status,
    targetValue: row.target_value, startsAt: row.starts_at, endsAt: row.ends_at,
    periodTimeZone: row.period_timezone, legacyOpenPeriod: row.legacy_open_period === 1,
    createdAt: row.created_at, updatedAt: row.updated_at,
    ...(row.description !== null ? { description: row.description } : {}),
    ...(row.completed_at !== null ? { completedAt: row.completed_at } : {}),
  }, row.legacy_extra_json) as Goal;
}

function insertSessionSql() {
  return `INSERT INTO focus_sessions (owner_id,id,task_id,task_name,status,planned_duration_seconds,focused_duration_seconds,paused_duration_seconds,started_at,completed_at,cancelled_at,last_paused_at,last_resumed_at,created_at,updated_at,legacy_extra_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
}

async function insertSession(db: SQLite.SQLiteDatabase, session: FocusSession, now: string) {
  await db.runAsync(insertSessionSql(), ...sessionValues(session, now));
}

function validateNewTask(task: Task) {
  validateLegacyTask(task as unknown as Record<string, unknown>);
}

function validateNewGoal(goal: Goal) {
  const value = goal as Goal & { periodTimeZone?: string; legacyOpenPeriod?: boolean };
  const targetValid = Number.isSafeInteger(value.targetValue) && value.targetValue > 0;
  if (typeof value.id !== 'string' || !value.id.trim() || typeof value.title !== 'string' || !value.title.trim()
    || !['focus_time', 'session_count'].includes(value.type) || !['weekly', 'monthly'].includes(value.period)
    || !['active', 'completed', 'cancelled', 'expired'].includes(value.status) || !targetValid
    || !validTimestamp(value.createdAt) || !validTimestamp(value.updatedAt)
    || (value.status === 'completed' && !validTimestamp(value.completedAt))
    || (value.completedAt !== undefined && !validTimestamp(value.completedAt))) {
    throw new RangeError('INVALID_INPUT: invalid goal fields or target unit');
  }
  if (!validTimestamp(value.startsAt) || !validTimestamp(value.endsAt)
    || Date.parse(value.startsAt) >= Date.parse(value.endsAt)
    || typeof value.periodTimeZone !== 'string' || !value.periodTimeZone
    || value.legacyOpenPeriod) {
    throw new RangeError('INVALID_INPUT: new goals require a bounded period and IANA timezone');
  }
  try { new Intl.DateTimeFormat('en', { timeZone: value.periodTimeZone }).format(0); }
  catch { throw new RangeError('INVALID_INPUT: goal timezone must be a supported IANA timezone'); }
}

export function createLocalDatabaseStore(dependencies: StoreDependencies) {
  let initialization: Promise<SQLite.SQLiteDatabase> | null = null;
  let connection: SQLite.SQLiteDatabase | null = null;
  let operations: Promise<unknown> = Promise.resolve();
  const now = dependencies.now ?? (() => new Date().toISOString());

  // All access to this private connection is queued, including reads, so a
  // caller cannot observe or join another operation's uncommitted transaction.
  function serialize<T>(operation: () => Promise<T>): Promise<T> {
    const result = operations.then(operation);
    operations = result.catch(() => undefined);
    return result;
  }

  async function onConnectionTransaction<T>(db: SQLite.SQLiteDatabase, operation: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
    // Expo's exclusive helper opens another connection before its callback.
    // Configure our own queued connection BEFORE beginning a transaction.
    await db.execAsync('PRAGMA foreign_keys = ON;');
    const keys = await db.getFirstAsync<{ foreign_keys: number }>('PRAGMA foreign_keys');
    if (keys?.foreign_keys !== 1) throw new Error('FOREIGN_KEYS_UNAVAILABLE');
    await db.execAsync('BEGIN IMMEDIATE');
    try {
      const result = await operation(db);
      await db.execAsync('COMMIT');
      return result;
    } catch (error) {
      await db.execAsync('ROLLBACK');
      throw error;
    }
  }

  async function openAndMigrate() {
    if (dependencies.platform === 'web') throw new Error('Local SQLite storage is unavailable on web');
    const db = connection ??= await dependencies.openDatabase();
    await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
    await db.execAsync(SCHEMA_SQL);
    const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const currentVersion = versionRow?.user_version ?? 0;
    if (currentVersion > SCHEMA_VERSION) throw new Error('DATABASE_VERSION_UNSUPPORTED: newer local database');
    const marker = await db.getFirstAsync<{ version: number }>('SELECT version FROM local_migrations WHERE version = ?', LEGACY_IMPORT_VERSION);
    if (!marker) {
      const snapshot = parseLegacy(await dependencies.readLegacyFiles());
      await onConnectionTransaction(db, async (transaction) => {
        const existing = await transaction.getFirstAsync<{ version: number }>('SELECT version FROM local_migrations WHERE version = ?', LEGACY_IMPORT_VERSION);
        if (existing) return;
        const current = await transaction.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
        if ((current?.user_version ?? 0) > SCHEMA_VERSION) throw new Error('DATABASE_VERSION_UNSUPPORTED: newer local database');
        await transaction.runAsync('INSERT INTO local_owners (id,kind,created_at) VALUES (?,?,?)', LOCAL_OWNER_ID, 'device_local', now());

        for (const legacyGoal of snapshot.goals) {
          const raw = legacyGoal as Goal & { startsAt?: string; endsAt?: string; periodTimeZone?: string; legacyOpenPeriod?: boolean };
          const goal: Goal = {
            ...raw,
            targetValue: raw.type === 'focus_time' ? raw.targetValue * 60 : raw.targetValue,
            startsAt: raw.createdAt,
            endsAt: null,
            periodTimeZone: null,
            legacyOpenPeriod: true,
          };
          await transaction.runAsync(`INSERT INTO goals (owner_id,id,title,description,type,period,status,target_value,starts_at,ends_at,period_timezone,legacy_open_period,completed_at,created_at,updated_at,legacy_extra_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, ...goalValues(goal));
        }

        for (const task of snapshot.tasks) {
          const link = (task as Task & { goalId?: string }).goalId;
          if (link && !snapshot.goals.some((goal) => goal.id === link)) {
            throw new RangeError('INVALID_RECORD: task references a missing goal; source preserved');
          }
          await transaction.runAsync(`INSERT INTO tasks (owner_id,id,title,description,status,goal_id,priority,due_at,completed_at,created_at,updated_at,legacy_extra_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, ...taskValues(task));
        }

        for (const session of snapshot.sessions) await insertSession(transaction, session, now());
        if (snapshot.activeId) {
          await transaction.runAsync('INSERT INTO active_focus_sessions (owner_id,session_id) VALUES (?,?)', LOCAL_OWNER_ID, snapshot.activeId);
        }
        if (snapshot.settings) {
          await transaction.runAsync('INSERT INTO user_settings (owner_id,default_break_duration_minutes) VALUES (?,?)', LOCAL_OWNER_ID, snapshot.settings.defaultBreakDurationMinutes);
        }
        await transaction.runAsync('INSERT INTO local_migrations (version,name,completed_at) VALUES (?,?,?)', LEGACY_IMPORT_VERSION, 'legacy-json-to-sqlite-v1', now());
        await transaction.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
      });
    }
    return db;
  }

  function database() {
    initialization ??= openAndMigrate().catch((error) => {
      initialization = null;
      throw error;
    });
    return initialization;
  }

  async function transaction<T>(operation: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
    return serialize(async () => onConnectionTransaction(await database(), operation));
  }

  return {
    async loadTasks(): Promise<Task[]> {
      return serialize(async () => {
      const db = await database();
      const rows = await db.getAllAsync<TaskRow & { goal_id: string | null; priority: string | null; due_at: string | null }>(
        'SELECT id,title,description,status,created_at,updated_at,completed_at,legacy_extra_json,goal_id,priority,due_at FROM tasks WHERE owner_id = ? ORDER BY created_at DESC,id', LOCAL_OWNER_ID);
      return rows.map((row) => mergeExtra({
        id: row.id, title: row.title, status: row.status, createdAt: row.created_at,
        updatedAt: row.updated_at, ...(row.description !== null ? { description: row.description } : {}),
        ...(row.completed_at !== null ? { completedAt: row.completed_at } : {}),
        ...(row.goal_id ? { goalId: row.goal_id } : {}), ...(row.priority ? { priority: row.priority } : {}),
        ...(row.due_at ? { dueAt: row.due_at } : {}),
      }, row.legacy_extra_json) as Task);
      });
    },

    async saveTasks(tasks: Task[]) {
      const seen = new Set<string>();
      for (const task of tasks) {
        validateNewTask(task);
        if (seen.has(task.id)) throw new RangeError('INVALID_INPUT: duplicate task ID');
        seen.add(task.id);
      }
      await transaction(async (db) => {
        for (const task of tasks) await db.runAsync(`INSERT INTO tasks (owner_id,id,title,description,status,goal_id,priority,due_at,completed_at,created_at,updated_at,legacy_extra_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(owner_id,id) DO UPDATE SET title=excluded.title,description=excluded.description,status=excluded.status,goal_id=excluded.goal_id,priority=excluded.priority,due_at=excluded.due_at,completed_at=excluded.completed_at,updated_at=excluded.updated_at,legacy_extra_json=excluded.legacy_extra_json`, ...taskValues(task));
      });
    },

    async loadGoals(): Promise<Goal[]> {
      return serialize(async () => {
      const db = await database();
      const rows = await db.getAllAsync<GoalRow>('SELECT * FROM goals WHERE owner_id = ? ORDER BY created_at DESC,id', LOCAL_OWNER_ID);
      return rows.map(goalFromRow);
      });
    },

    async saveGoals(goals: Goal[]) {
      const seen = new Set<string>();
      for (const goal of goals) {
        if (!goal.legacyOpenPeriod) validateNewGoal(goal);
        if (seen.has(goal.id)) throw new RangeError('INVALID_INPUT: duplicate goal ID');
        seen.add(goal.id);
      }
      await transaction(async (db) => {
        for (const goal of goals) {
          if (goal.legacyOpenPeriod) {
            const stored = await db.getFirstAsync<GoalRow>('SELECT * FROM goals WHERE owner_id = ? AND id = ?', LOCAL_OWNER_ID, goal.id);
            if (!stored || canonicalJson(goalFromRow(stored)) !== canonicalJson(goal)) {
              throw new RangeError('INVALID_INPUT: legacy goals may only be preserved unchanged');
            }
            continue;
          }
          await db.runAsync(`INSERT INTO goals (owner_id,id,title,description,type,period,status,target_value,starts_at,ends_at,period_timezone,legacy_open_period,completed_at,created_at,updated_at,legacy_extra_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(owner_id,id) DO UPDATE SET title=excluded.title,description=excluded.description,type=excluded.type,period=excluded.period,status=excluded.status,target_value=excluded.target_value,starts_at=excluded.starts_at,ends_at=excluded.ends_at,period_timezone=excluded.period_timezone,legacy_open_period=excluded.legacy_open_period,completed_at=excluded.completed_at,updated_at=excluded.updated_at,legacy_extra_json=excluded.legacy_extra_json`, ...goalValues(goal));
        }
      });
    },

    async loadActiveSession(strict = false): Promise<FocusSession | null> {
      try {
        return await serialize(async () => {
          const db = await database();
          const row = await db.getFirstAsync<SessionRow & { task_id: string | null }>(`SELECT s.*,s.task_id FROM active_focus_sessions a JOIN focus_sessions s ON s.owner_id=a.owner_id AND s.id=a.session_id WHERE a.owner_id = ?`, LOCAL_OWNER_ID);
          return row ? sessionFromRow(row, row.task_id) : null;
        });
      } catch (error) { if (strict) throw error; return null; }
    },

    async saveActiveSession(session: FocusSession) {
      validateFocusSession(session);
      if (session.status !== 'active' && session.status !== 'paused') throw new RangeError('Only active sessions can occupy the recovery pointer');
      await transaction(async (db) => {
        const current = await db.getFirstAsync<{ session_id: string }>('SELECT session_id FROM active_focus_sessions WHERE owner_id = ?', LOCAL_OWNER_ID);
        if (current && current.session_id !== session.id) throw new Error('ACTIVE_SESSION_CONFLICT: refusing to replace a different recovery pointer');
        const existing = await db.getFirstAsync<{ id: string; status: FocusSession['status'] }>('SELECT id,status FROM focus_sessions WHERE owner_id = ? AND id = ?', LOCAL_OWNER_ID, session.id);
        if (existing?.status === 'completed' || existing?.status === 'cancelled') {
          throw new Error('TERMINAL_SESSION_CONFLICT: refusing to revive finalized history');
        }
        if (existing) {
          await db.runAsync(`UPDATE focus_sessions SET task_id=?,task_name=?,status=?,planned_duration_seconds=?,focused_duration_seconds=?,paused_duration_seconds=?,started_at=?,completed_at=?,cancelled_at=?,last_paused_at=?,last_resumed_at=?,updated_at=?,legacy_extra_json=? WHERE owner_id=? AND id=?`, ...sessionUpdateValues(session, now()), LOCAL_OWNER_ID, session.id);
        } else await insertSession(db, session, now());
        await db.runAsync('INSERT INTO active_focus_sessions (owner_id,session_id) VALUES (?,?) ON CONFLICT(owner_id) DO UPDATE SET session_id=excluded.session_id', LOCAL_OWNER_ID, session.id);
      });
    },

    async clearActiveSession() {
      await transaction(async (db) => { await db.runAsync('DELETE FROM active_focus_sessions WHERE owner_id = ?', LOCAL_OWNER_ID); });
    },

    async appendSessionHistory(session: FocusSession) {
      if (session.status !== 'completed' && session.status !== 'cancelled') throw new RangeError('Only terminal sessions can be appended to history');
      validateFocusSession(session);
      await transaction(async (db) => persistTerminalInTransaction(db, session, now(), false));
    },

    async persistTerminalSession(session: FocusSession) {
      if (session.status !== 'completed' && session.status !== 'cancelled') throw new RangeError('Only terminal sessions can be finalized');
      validateFocusSession(session);
      await transaction(async (db) => persistTerminalInTransaction(db, session, now(), true));
    },

    async loadSessionHistory(): Promise<FocusSession[]> {
      return serialize(async () => {
      const db = await database();
      const rows = await db.getAllAsync<SessionRow & { task_id: string | null }>(`SELECT * FROM focus_sessions WHERE owner_id = ? AND status IN ('completed','cancelled') ORDER BY COALESCE(completed_at,cancelled_at) DESC,id`, LOCAL_OWNER_ID);
      return rows.map((row) => sessionFromRow(row, row.task_id));
      });
    },

    async loadSettings(): Promise<AppSettings> {
      return serialize(async () => {
      const db = await database();
      const row = await db.getFirstAsync<{ default_break_duration_minutes: 5 | 10 | 15 }>('SELECT default_break_duration_minutes FROM user_settings WHERE owner_id = ?', LOCAL_OWNER_ID);
      return { defaultBreakDurationMinutes: row?.default_break_duration_minutes ?? 5 };
      });
    },

    async saveSettings(settings: AppSettings) {
      if (!isAppSettings(settings as unknown as Record<string, unknown>)) throw new RangeError('INVALID_INPUT: unsupported settings value');
      await transaction(async (db) => {
        await db.runAsync('INSERT INTO user_settings (owner_id,default_break_duration_minutes) VALUES (?,?) ON CONFLICT(owner_id) DO UPDATE SET default_break_duration_minutes=excluded.default_break_duration_minutes', LOCAL_OWNER_ID, settings.defaultBreakDurationMinutes);
      });
    },
  };
}

async function persistTerminalInTransaction(db: SQLite.SQLiteDatabase, session: FocusSession, now: string, clearPointer: boolean) {
  const existing = await db.getFirstAsync<SessionRow>('SELECT * FROM focus_sessions WHERE owner_id = ? AND id = ?', LOCAL_OWNER_ID, session.id);
  if (!existing) await insertSession(db, session, now);
  else if (existing.status === 'completed' || existing.status === 'cancelled') {
    const current = sessionFromRow(existing);
    if (canonicalJson(current) !== canonicalJson(session)) throw new Error('Conflicting terminal history record');
  } else {
    const pointer = await db.getFirstAsync<{ session_id: string }>('SELECT session_id FROM active_focus_sessions WHERE owner_id = ?', LOCAL_OWNER_ID);
    if (pointer?.session_id !== session.id) throw new Error('ACTIVE_SESSION_CONFLICT: terminal command does not own the active pointer');
    await db.runAsync(`UPDATE focus_sessions SET task_id=?,task_name=?,status=?,planned_duration_seconds=?,focused_duration_seconds=?,paused_duration_seconds=?,started_at=?,completed_at=?,cancelled_at=?,last_paused_at=?,last_resumed_at=?,updated_at=?,legacy_extra_json=? WHERE owner_id=? AND id=?`, ...sessionUpdateValues(session, now), LOCAL_OWNER_ID, session.id);
  }
  if (clearPointer) await db.runAsync('DELETE FROM active_focus_sessions WHERE owner_id = ? AND session_id = ?', LOCAL_OWNER_ID, session.id);
}

async function readLegacyFiles(): Promise<LegacyFileSet> {
  if (!FileSystem.documentDirectory) throw new Error('Legacy application data directory is unavailable');
  const names: (keyof LegacyFileSet)[] = [
    'deep-focus-active-session.json', 'deep-focus-session-history.json', 'deep-focus-tasks.json',
    'deep-focus-goals.json', 'deep-focus-settings.json',
  ];
  const files: LegacyFileSet = {};
  for (const name of names) {
    const path = `${FileSystem.documentDirectory}${name}`;
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) files[name] = await FileSystem.readAsStringAsync(path);
  }
  return files;
}

const store = createLocalDatabaseStore({
  platform: Platform.OS,
  openDatabase: () => SQLite.openDatabaseAsync(DATABASE_NAME, { useNewConnection: true }),
  readLegacyFiles,
});

export const loadTasks = store.loadTasks;
export const saveTasks = store.saveTasks;
export const loadGoals = store.loadGoals;
export const saveGoals = store.saveGoals;
export const loadActiveSession = store.loadActiveSession;
export const saveActiveSession = store.saveActiveSession;
export const clearActiveSession = store.clearActiveSession;
export const appendSessionHistory = store.appendSessionHistory;
export const persistTerminalSession = store.persistTerminalSession;
export const loadSessionHistory = store.loadSessionHistory;
export const loadSettings = store.loadSettings;
export const saveSettings = store.saveSettings;
