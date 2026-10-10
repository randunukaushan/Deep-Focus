import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

import type { AppSettings } from '@/features/settings/settings-storage';
import type { Goal } from '@/features/goals/goal-types';
import { getGoalCompletionAt } from '@/features/goals/goal-progress';
import type { Task } from '@/features/tasks/task-types';
import { validateFocusSession } from '@/features/focus/session-engine';
import type { FocusSession } from '@/features/focus/session-types';
import type { SavedPlan } from '@/features/planning/plan-types';
import {
  validateLinkPosition,
  validateResourceId,
  validateResourceInput,
  validateResourceRevision,
  validateWorkSlice,
  type LocalResource,
  type TaskResourceLink,
} from '@/features/resources/resource-types';
import { accountOwnerId, createLocalOwnerRegistry } from './local-owner';
import { createTeacherAssignmentDraft, type TeacherAssignmentDraft } from '@/features/education/teacher-assignment-draft';

const DATABASE_NAME = 'deep-focus-local.db';
const LOCAL_OWNER_ID = 'local:device';
const SCHEMA_VERSION = 12;
const LEGACY_IMPORT_VERSION = 1;

const SNAPSHOT_LOCAL_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sync_snapshot_staging (
  owner_id TEXT NOT NULL REFERENCES local_owners(id),
  snapshot_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('building', 'ready', 'failed')),
  high_water TEXT NOT NULL CHECK (
    high_water NOT GLOB '*[^0-9]*'
    AND (high_water = '0' OR high_water NOT LIKE '0%')
  ),
  page_count INTEGER NOT NULL CHECK (page_count > 0),
  manifest_digest TEXT NOT NULL CHECK (length(manifest_digest) = 64 AND manifest_digest NOT GLOB '*[^0-9a-f]*'),
  resume_cursor TEXT NOT NULL CHECK (length(resume_cursor) BETWEEN 1 AND 2048),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, snapshot_id)
);
CREATE TABLE IF NOT EXISTS sync_snapshot_staging_pages (
  owner_id TEXT NOT NULL,
  snapshot_id TEXT NOT NULL,
  page_index INTEGER NOT NULL CHECK (page_index >= 0),
  page_count INTEGER NOT NULL CHECK (page_count > 0),
  high_water TEXT NOT NULL CHECK (
    high_water NOT GLOB '*[^0-9]*'
    AND (high_water = '0' OR high_water NOT LIKE '0%')
  ),
  page_digest TEXT NOT NULL CHECK (length(page_digest) = 64 AND page_digest NOT GLOB '*[^0-9a-f]*'),
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  next_cursor TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, snapshot_id, page_index),
  FOREIGN KEY (owner_id, snapshot_id) REFERENCES sync_snapshot_staging(owner_id, snapshot_id) ON DELETE RESTRICT,
  CHECK (page_index < page_count),
  CHECK (next_cursor IS NULL OR length(next_cursor) BETWEEN 1 AND 2048)
);
CREATE INDEX IF NOT EXISTS sync_snapshot_staging_ready
  ON sync_snapshot_staging(owner_id, status, updated_at, snapshot_id);
`;

const SNAPSHOT_MIRROR_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sync_remote_entities (
  owner_id TEXT NOT NULL REFERENCES local_owners(id),
  entity_kind TEXT NOT NULL CHECK (entity_kind IN ('profile', 'task', 'goal', 'focus_session', 'session', 'break', 'settings', 'reminder')),
  entity_id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  operation TEXT NOT NULL CHECK (operation IN ('upsert', 'delete')),
  payload_json TEXT,
  snapshot_id TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, entity_kind, entity_id),
  CHECK ((operation = 'delete' AND payload_json IS NULL)
      OR (operation = 'upsert' AND payload_json IS NOT NULL AND json_valid(payload_json)))
);
CREATE INDEX IF NOT EXISTS sync_remote_entities_owner_version
  ON sync_remote_entities(owner_id, version, entity_kind, entity_id);
CREATE TABLE IF NOT EXISTS sync_remote_cursors (
  owner_id TEXT PRIMARY KEY NOT NULL REFERENCES local_owners(id),
  snapshot_id TEXT NOT NULL,
  high_water TEXT NOT NULL CHECK (
    high_water GLOB '[0-9]*' AND high_water NOT GLOB '*[^0-9]*'
    AND (high_water = '0' OR high_water NOT LIKE '0%')
  ),
  resume_cursor TEXT NOT NULL CHECK (length(resume_cursor) BETWEEN 1 AND 2048),
  updated_at TEXT NOT NULL
);
`;

const INCREMENTAL_SYNC_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sync_remote_change_receipts (
  owner_id TEXT NOT NULL REFERENCES local_owners(id),
  sequence TEXT NOT NULL CHECK (
    sequence GLOB '[0-9]*' AND sequence NOT GLOB '*[^0-9]*'
    AND (sequence = '0' OR sequence NOT LIKE '0%')
  ),
  change_hash TEXT NOT NULL CHECK (length(change_hash) = 64 AND change_hash NOT GLOB '*[^0-9a-f]*'),
  entity_kind TEXT NOT NULL CHECK (entity_kind IN ('profile', 'goal', 'task', 'focus_session', 'settings')),
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('upsert', 'delete')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, sequence)
);
CREATE INDEX IF NOT EXISTS sync_remote_change_receipts_owner_entity
  ON sync_remote_change_receipts(owner_id, entity_kind, entity_id, sequence);
CREATE TABLE IF NOT EXISTS sync_remote_pull_cursors (
  owner_id TEXT PRIMARY KEY NOT NULL REFERENCES local_owners(id),
  next_cursor TEXT NOT NULL CHECK (length(next_cursor) BETWEEN 1 AND 2048),
  last_sequence TEXT NOT NULL CHECK (
    last_sequence GLOB '[0-9]*' AND last_sequence NOT GLOB '*[^0-9]*'
    AND (last_sequence = '0' OR last_sequence NOT LIKE '0%')
  ),
  updated_at TEXT NOT NULL
);
`;

const REMOTE_MIRROR_KIND_MIGRATION_SQL = `
ALTER TABLE sync_remote_entities RENAME TO sync_remote_entities_v10;
CREATE TABLE sync_remote_entities (
  owner_id TEXT NOT NULL REFERENCES local_owners(id),
  entity_kind TEXT NOT NULL CHECK (entity_kind IN ('profile', 'task', 'goal', 'focus_session', 'session', 'break', 'settings', 'reminder')),
  entity_id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  operation TEXT NOT NULL CHECK (operation IN ('upsert', 'delete')),
  payload_json TEXT,
  snapshot_id TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, entity_kind, entity_id),
  CHECK ((operation = 'delete' AND payload_json IS NULL)
      OR (operation = 'upsert' AND payload_json IS NOT NULL AND json_valid(payload_json)))
);
INSERT INTO sync_remote_entities (owner_id,entity_kind,entity_id,version,operation,payload_json,snapshot_id,updated_at)
  SELECT owner_id,entity_kind,entity_id,version,operation,payload_json,snapshot_id,updated_at
  FROM sync_remote_entities_v10;
DROP TABLE sync_remote_entities_v10;
CREATE INDEX sync_remote_entities_owner_version
  ON sync_remote_entities(owner_id, version, entity_kind, entity_id);
`;

const INCREMENTAL_SYNC_KIND_MIGRATION_SQL = `
ALTER TABLE sync_remote_change_receipts RENAME TO sync_remote_change_receipts_v11;
CREATE TABLE sync_remote_change_receipts (
  owner_id TEXT NOT NULL REFERENCES local_owners(id),
  sequence TEXT NOT NULL CHECK (sequence GLOB '[0-9]*' AND sequence NOT GLOB '*[^0-9]*' AND (sequence = '0' OR sequence NOT LIKE '0%')),
  change_hash TEXT NOT NULL CHECK (length(change_hash) = 64 AND change_hash NOT GLOB '*[^0-9a-f]*'),
  entity_kind TEXT NOT NULL CHECK (entity_kind IN ('profile', 'goal', 'task', 'focus_session', 'settings')),
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('upsert', 'delete')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, sequence)
);
INSERT INTO sync_remote_change_receipts (owner_id,sequence,change_hash,entity_kind,entity_id,operation,created_at)
  SELECT owner_id,sequence,change_hash,entity_kind,entity_id,operation,created_at FROM sync_remote_change_receipts_v11;
DROP TABLE sync_remote_change_receipts_v11;
CREATE INDEX sync_remote_change_receipts_owner_entity
  ON sync_remote_change_receipts(owner_id, entity_kind, entity_id, sequence);
`;

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
  default_focus_duration_minutes INTEGER NOT NULL DEFAULT 25
    CHECK (default_focus_duration_minutes IN (25, 45, 60)),
  default_break_duration_minutes INTEGER NOT NULL
    CHECK (default_break_duration_minutes IN (5, 10, 15)),
  ui_locale TEXT NOT NULL DEFAULT 'en'
    CHECK (ui_locale IN ('en', 'si', 'ta')),
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')),
  ai_features_enabled INTEGER NOT NULL DEFAULT 0 CHECK (ai_features_enabled IN (0, 1)),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z',
  legacy_extra_json TEXT
);
CREATE TABLE IF NOT EXISTS local_migrations (
  version INTEGER PRIMARY KEY NOT NULL,
  name TEXT UNIQUE NOT NULL,
  completed_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS local_outbox (
  owner_id TEXT NOT NULL REFERENCES local_owners(id),
  mutation_id TEXT NOT NULL,
  command TEXT NOT NULL CHECK (length(trim(command)) BETWEEN 1 AND 120),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('focus_session', 'task', 'goal', 'settings')),
  target_id TEXT NOT NULL,
  base_version INTEGER,
  payload_schema_version INTEGER NOT NULL CHECK (payload_schema_version = 1),
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  payload_hash TEXT NOT NULL,
  client_created_at TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  next_attempt_at TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('pending', 'in_flight', 'rejected')),
  last_error_code TEXT,
  PRIMARY KEY (owner_id, mutation_id)
);
CREATE INDEX IF NOT EXISTS local_outbox_ready
  ON local_outbox(owner_id, state, next_attempt_at, client_created_at);
CREATE TABLE IF NOT EXISTS local_resources (
  owner_id TEXT NOT NULL REFERENCES local_owners(id),
  id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('reference', 'external_link')),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 120),
  reference TEXT NOT NULL CHECK (length(trim(reference)) BETWEEN 1 AND 4096),
  revision INTEGER NOT NULL CHECK (revision > 0),
  lifecycle TEXT NOT NULL CHECK (lifecycle IN ('active', 'missing')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, id)
);
CREATE TABLE IF NOT EXISTS task_resource_links (
  owner_id TEXT NOT NULL REFERENCES local_owners(id),
  task_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  resource_revision INTEGER NOT NULL CHECK (resource_revision > 0),
  work_slice TEXT,
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
  PRIMARY KEY (owner_id, task_id, resource_id),
  FOREIGN KEY (owner_id, task_id) REFERENCES tasks(owner_id, id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id, resource_id) REFERENCES local_resources(owner_id, id)
);
CREATE INDEX IF NOT EXISTS task_resource_links_resource
  ON task_resource_links(owner_id, resource_id, position);
CREATE TABLE IF NOT EXISTS teacher_assignment_drafts (
  owner_id TEXT NOT NULL REFERENCES local_owners(id),
  assignment_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 240),
  instructions TEXT NOT NULL CHECK (length(trim(instructions)) BETWEEN 1 AND 240),
  deadline TEXT,
  revision INTEGER NOT NULL CHECK (revision > 0),
  education_json TEXT CHECK (education_json IS NULL OR json_valid(education_json)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, assignment_id)
);
CREATE INDEX IF NOT EXISTS teacher_assignment_drafts_owner_updated
  ON teacher_assignment_drafts(owner_id, updated_at DESC, assignment_id);
${SNAPSHOT_LOCAL_SCHEMA_SQL}
`;

const RESOURCE_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS local_resources (
  owner_id TEXT NOT NULL REFERENCES local_owners(id), id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('reference', 'external_link')),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 120),
  reference TEXT NOT NULL CHECK (length(trim(reference)) BETWEEN 1 AND 4096),
  revision INTEGER NOT NULL CHECK (revision > 0),
  lifecycle TEXT NOT NULL CHECK (lifecycle IN ('active', 'missing')),
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, id)
);
CREATE TABLE IF NOT EXISTS task_resource_links (
  owner_id TEXT NOT NULL REFERENCES local_owners(id), task_id TEXT NOT NULL,
  resource_id TEXT NOT NULL, resource_revision INTEGER NOT NULL CHECK (resource_revision > 0),
  work_slice TEXT, position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
  PRIMARY KEY (owner_id, task_id, resource_id),
  FOREIGN KEY (owner_id, task_id) REFERENCES tasks(owner_id, id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id, resource_id) REFERENCES local_resources(owner_id, id)
);
CREATE INDEX IF NOT EXISTS task_resource_links_resource
  ON task_resource_links(owner_id, resource_id, position);
`;

const PLAN_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS saved_plans (
  owner_id TEXT NOT NULL REFERENCES local_owners(id),
  id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider = 'mock'),
  model TEXT NOT NULL CHECK (length(trim(model)) BETWEEN 1 AND 120),
  created_at TEXT NOT NULL,
  confirmed_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  PRIMARY KEY (owner_id, id),
  CHECK (created_at <= confirmed_at)
);
CREATE TABLE IF NOT EXISTS saved_plan_items (
  owner_id TEXT NOT NULL REFERENCES local_owners(id),
  plan_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 0),
  focus_duration_seconds INTEGER NOT NULL CHECK (focus_duration_seconds > 0),
  break_duration_seconds INTEGER NOT NULL CHECK (break_duration_seconds >= 0),
  PRIMARY KEY (owner_id, plan_id, task_id),
  UNIQUE (owner_id, plan_id, position),
  FOREIGN KEY (owner_id, plan_id) REFERENCES saved_plans(owner_id, id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id, task_id) REFERENCES tasks(owner_id, id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS saved_plan_items_task
  ON saved_plan_items(owner_id, task_id, position);
CREATE UNIQUE INDEX IF NOT EXISTS saved_plans_one_active
  ON saved_plans(owner_id) WHERE status = 'active';
`;

const ASSESSMENT_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS assessments (
  owner_id TEXT NOT NULL REFERENCES local_owners(id),
  id TEXT NOT NULL,
  version TEXT NOT NULL CHECK (length(trim(version)) BETWEEN 1 AND 40),
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  result_json TEXT CHECK (result_json IS NULL OR json_valid(result_json)),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, id),
  CHECK ((status = 'completed' AND completed_at IS NOT NULL)
      OR (status <> 'completed' AND completed_at IS NULL))
);
CREATE TABLE IF NOT EXISTS assessment_answers (
  owner_id TEXT NOT NULL,
  assessment_id TEXT NOT NULL,
  id TEXT NOT NULL,
  question_id TEXT NOT NULL CHECK (length(trim(question_id)) BETWEEN 1 AND 120),
  value_json TEXT NOT NULL CHECK (json_valid(value_json)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, assessment_id, question_id),
  UNIQUE (owner_id, id),
  FOREIGN KEY (owner_id, assessment_id) REFERENCES assessments(owner_id, id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS assessments_owner_status_updated
  ON assessments(owner_id, status, updated_at DESC);
`;

export type AssessmentAnswerValue = string | number | boolean | string[];
export type AssessmentAttempt = {
  id: string;
  version: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  result: Record<string, unknown> | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  answers: Record<string, AssessmentAnswerValue>;
};

type AssessmentRow = {
  id: string; version: string; status: AssessmentAttempt['status']; result_json: string | null;
  started_at: string; completed_at: string | null; created_at: string; updated_at: string;
};

type AssessmentAnswerRow = { question_id: string; value_json: string };

function assessmentAnswerJson(value: unknown): string {
  if ((typeof value === 'string' && value.length <= 4_000) || typeof value === 'boolean'
    || (typeof value === 'number' && Number.isFinite(value))
    || (Array.isArray(value) && value.length <= 100 && value.every((item) => typeof item === 'string' && item.length <= 2_000))) {
    const encoded = JSON.stringify(value);
    if (encoded.length <= 10_000) return encoded;
  }
  throw new RangeError('INVALID_ASSESSMENT_ANSWER: expected text, finite number, boolean, or text list');
}

function assessmentFromRows(row: AssessmentRow, answerRows: AssessmentAnswerRow[]): AssessmentAttempt {
  let result: Record<string, unknown> | null = null;
  try {
    if (row.result_json !== null) {
      const parsed: unknown = JSON.parse(row.result_json);
      if (!isObject(parsed)) throw new Error('invalid result');
      result = parsed;
    }
    const answers: Record<string, AssessmentAnswerValue> = {};
    for (const answer of answerRows) {
      const parsed: unknown = JSON.parse(answer.value_json);
      assessmentAnswerJson(parsed);
      if (Object.hasOwn(answers, answer.question_id)) throw new Error('duplicate answer');
      Object.defineProperty(answers, answer.question_id, {
        value: parsed as AssessmentAnswerValue,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
    if (!validTimestamp(row.started_at) || !validTimestamp(row.created_at) || !validTimestamp(row.updated_at)
      || (row.completed_at !== null && !validTimestamp(row.completed_at))) throw new Error('invalid timestamps');
    return { id: row.id, version: row.version, status: row.status, result, startedAt: row.started_at, completedAt: row.completed_at, createdAt: row.created_at, updatedAt: row.updated_at, answers };
  } catch {
    throw new Error('ASSESSMENT_DATA_UNAVAILABLE: saved assessment is invalid');
  }
}

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

type ResourceRow = {
  id: string; kind: LocalResource['kind']; title: string; reference: string;
  revision: number; lifecycle: LocalResource['lifecycle']; created_at: string; updated_at: string;
};

type TaskResourceLinkRow = {
  task_id: string; resource_id: string; resource_revision: number;
  work_slice: string | null; position: number;
};

type TeacherAssignmentDraftRow = {
  assignment_id: string; class_id: string; title: string; instructions: string;
  deadline: string | null; revision: number; education_json: string | null;
};

function teacherAssignmentDraftFromRow(row: TeacherAssignmentDraftRow): TeacherAssignmentDraft {
  let education: unknown;
  try { education = row.education_json === null ? undefined : JSON.parse(row.education_json); }
  catch { throw new Error('TEACHER_ASSIGNMENT_DATA_UNAVAILABLE: invalid education metadata'); }
  const result = createTeacherAssignmentDraft({
    assignmentId: row.assignment_id, classId: row.class_id, title: row.title,
    instructions: row.instructions, ...(row.deadline === null ? {} : { deadline: row.deadline }),
    revision: row.revision, ...(education === undefined ? {} : { education }),
  });
  if (!result.valid) throw new Error(`TEACHER_ASSIGNMENT_DATA_UNAVAILABLE: ${result.reason}`);
  return result.draft;
}

function resourceFromRow(row: ResourceRow): LocalResource {
  if (!validTimestamp(row.created_at) || !validTimestamp(row.updated_at)) {
    throw new Error('RESOURCE_DATA_UNAVAILABLE: saved resource has invalid timestamps');
  }
  validateResourceInput({ kind: row.kind, title: row.title, reference: row.reference });
  validateResourceId(row.id);
  validateResourceRevision(row.revision);
  if (row.lifecycle !== 'active' && row.lifecycle !== 'missing') throw new Error('RESOURCE_DATA_UNAVAILABLE: invalid lifecycle');
  return {
    id: row.id, kind: row.kind, title: row.title, reference: row.reference,
    revision: row.revision, lifecycle: row.lifecycle,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function resourceValues(resource: LocalResource, ownerId: string) {
  return [ownerId, resource.id, resource.kind, resource.title, resource.reference,
    resource.revision, resource.lifecycle, resource.createdAt, resource.updatedAt];
}

export type LocalOutboxMutation = {
  mutationId: string;
  command: string;
  entityType: 'focus_session' | 'task' | 'goal' | 'settings';
  targetId: string;
  baseVersion: number | null;
  payloadSchemaVersion: 1;
  payload: Record<string, unknown>;
  payloadHash: string;
  clientCreatedAt: string;
  attemptCount: number;
  nextAttemptAt: string;
  state: 'pending' | 'in_flight' | 'rejected';
  lastErrorCode: string | null;
};

export type LocalSnapshotStaging = {
  snapshotId: string;
  highWater: string;
  pageCount: number;
  manifestDigest: string;
  resumeCursor: string | null;
  status: 'building' | 'ready' | 'failed';
};

export type LocalSnapshotStagingPage = {
  snapshotId: string;
  pageIndex: number;
  pageCount: number;
  highWater: string;
  pageDigest: string;
  payload: Record<string, unknown>[];
  nextCursor: string | null;
};

export type LocalMirrorSnapshotPage = {
  snapshotId: string;
  pageIndex: number;
  pageCount: number;
  highWater: string;
  pageDigest: string;
  data: Record<string, unknown>[];
  nextCursor: string | null;
};

export type LocalRemoteMirrorEntity = {
  entity: 'profile' | 'task' | 'goal' | 'focus_session' | 'session' | 'break' | 'settings' | 'reminder';
  entityId: string;
  version: number;
  operation: 'upsert' | 'delete';
  payload: Record<string, unknown> | null;
};

export type LocalRemoteMirrorCursor = {
  snapshotId: string;
  highWater: string;
  resumeCursor: string;
};

export type LocalIncrementalSyncChange = {
  sequence: string;
  entityKind: 'profile' | 'goal' | 'task' | 'focus_session' | 'settings';
  entityId: string;
  operation: 'upsert' | 'delete';
  payload: Record<string, unknown> | null;
};

const SNAPSHOT_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL_COUNTER = /^(?:0|[1-9][0-9]*)$/;
const SNAPSHOT_DIGEST = /^[a-f0-9]{64}$/;
const SNAPSHOT_CURSOR = /^[A-Za-z0-9_-]{1,2048}$/;

function validateSnapshotMetadata(input: Pick<LocalSnapshotStaging, 'snapshotId' | 'highWater' | 'pageCount' | 'manifestDigest'>) {
  if (!SNAPSHOT_UUID.test(input.snapshotId) || !DECIMAL_COUNTER.test(input.highWater)
    || !Number.isSafeInteger(input.pageCount) || input.pageCount < 1 || input.pageCount > 10000
    || !SNAPSHOT_DIGEST.test(input.manifestDigest)) throw new RangeError('SNAPSHOT_INVALID');
}

function validateSnapshotPage(input: LocalSnapshotStagingPage) {
  validateSnapshotMetadata({ snapshotId: input.snapshotId, highWater: input.highWater, pageCount: input.pageCount, manifestDigest: '0'.repeat(64) });
  if (!Number.isSafeInteger(input.pageIndex) || input.pageIndex < 0 || input.pageIndex >= input.pageCount
    || !SNAPSHOT_DIGEST.test(input.pageDigest) || !Array.isArray(input.payload) || input.payload.length > 100
    || input.payload.some((value) => !isObject(value))
    || (input.nextCursor !== null && !SNAPSHOT_CURSOR.test(input.nextCursor))) throw new RangeError('SNAPSHOT_PAGE_INVALID');
}

function validateRemoteMirrorEntity(input: LocalRemoteMirrorEntity) {
  if (!['profile', 'task', 'goal', 'focus_session', 'session', 'break', 'settings', 'reminder'].includes(input.entity)
    || !SNAPSHOT_UUID.test(input.entityId) || !Number.isSafeInteger(input.version) || input.version < 1
    || !['upsert', 'delete'].includes(input.operation)
    || (input.operation === 'delete' ? input.payload !== null : !isObject(input.payload))) {
    throw new RangeError('SNAPSHOT_ENTITY_INVALID');
  }
}

function compareDecimal(left: string, right: string): number {
  const a = left.replace(/^0+(?=\d)/, '');
  const b = right.replace(/^0+(?=\d)/, '');
  return a.length === b.length ? a.localeCompare(b) : a.length - b.length;
}

function validateIncrementalChange(input: LocalIncrementalSyncChange) {
  if (!DECIMAL_COUNTER.test(input.sequence) || !SNAPSHOT_UUID.test(input.entityId)
    || !['profile', 'goal', 'task', 'focus_session', 'settings'].includes(input.entityKind)
    || !['upsert', 'delete'].includes(input.operation)
    || (input.operation === 'delete' ? input.payload !== null : !isObject(input.payload))) {
    throw new RangeError('SYNC_CHANGE_INVALID');
  }
}

function validateRemoteSettings(payload: Record<string, unknown>): { theme: 'system' | 'light' | 'dark'; uiLocale: 'en' | 'si' | 'ta'; focusMinutes: 25 | 45 | 60; breakMinutes: 5 | 10 | 15; aiEnabled: 0 | 1; version: number; updatedAt: string } {
  const theme = payload.theme;
  const uiLocale = payload.uiLocale;
  const focusMinutes = payload.defaultFocusDurationMinutes;
  const breakMinutes = payload.defaultBreakDurationMinutes;
  const aiEnabled = payload.aiFeaturesEnabled;
  const version = payload.version;
  const updatedAt = payload.updatedAt;
  if (!['system', 'light', 'dark'].includes(theme as string) || !['en', 'si', 'ta'].includes(uiLocale as string)
    || ![25, 45, 60].includes(focusMinutes as number) || ![5, 10, 15].includes(breakMinutes as number)
    || typeof aiEnabled !== 'boolean' || !Number.isSafeInteger(version) || (version as number) < 1
    || typeof updatedAt !== 'string' || !validTimestamp(updatedAt)) throw new RangeError('SYNC_SETTINGS_INVALID');
  return { theme: theme as 'system' | 'light' | 'dark', uiLocale: uiLocale as 'en' | 'si' | 'ta', focusMinutes: focusMinutes as 25 | 45 | 60, breakMinutes: breakMinutes as 5 | 10 | 15, aiEnabled: aiEnabled ? 1 : 0, version: version as number, updatedAt };
}

async function materializeRemoteSettings(db: SQLite.SQLiteDatabase, ownerId: string, entityId: string, payload: Record<string, unknown>): Promise<void> {
  const settings = validateRemoteSettings(payload);
  if (typeof entityId !== 'string' || !SNAPSHOT_UUID.test(entityId) || payload.id !== entityId) throw new RangeError('SYNC_SETTINGS_INVALID');
  await db.runAsync(
    `INSERT INTO user_settings (owner_id,default_focus_duration_minutes,default_break_duration_minutes,ui_locale,theme,ai_features_enabled,version,updated_at)
     VALUES (?,?,?,?,?,?,?,?)
     ON CONFLICT(owner_id) DO UPDATE SET
       default_focus_duration_minutes=excluded.default_focus_duration_minutes,
       default_break_duration_minutes=excluded.default_break_duration_minutes,
       ui_locale=excluded.ui_locale, theme=excluded.theme,
       ai_features_enabled=excluded.ai_features_enabled, version=excluded.version,
       updated_at=excluded.updated_at
     WHERE user_settings.version < excluded.version`,
    ownerId, settings.focusMinutes, settings.breakMinutes, settings.uiLocale, settings.theme, settings.aiEnabled, settings.version, settings.updatedAt,
  );
}

export type LegacyFileSet = Partial<Record<
  'deep-focus-active-session.json' | 'deep-focus-session-history.json'
  | 'deep-focus-tasks.json' | 'deep-focus-goals.json' | 'deep-focus-settings.json',
  string
>>;

export type LocalDatabaseDependencies = {
  platform: string;
  openDatabase: () => Promise<SQLite.SQLiteDatabase>;
  readLegacyFiles: () => Promise<LegacyFileSet>;
  now?: () => string;
  ownerId?: string;
  ownerKind?: 'device_local' | 'account';
};

let queuedOperations: Promise<unknown> = Promise.resolve();

function validTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && Number.isFinite(Date.parse(value));
}

function nextRevisionTimestamp(expectedUpdatedAt: string, currentTime: string): string {
  if (!validTimestamp(expectedUpdatedAt) || !validTimestamp(currentTime)) {
    throw new RangeError('INVALID_INPUT: a valid task/goal revision and clock timestamp are required');
  }
  return new Date(Math.max(Date.parse(currentTime), Date.parse(expectedUpdatedAt) + 1)).toISOString();
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

  const normalizedSettings: AppSettings | null = settings
    ? {
        defaultFocusDurationMinutes: settings.defaultFocusDurationMinutes ?? 25,
        defaultBreakDurationMinutes: settings.defaultBreakDurationMinutes,
        uiLocale: settings.uiLocale ?? 'en',
      }
    : null;

  return {
    sessions: sessionValues,
    activeId,
    tasks: tasks as unknown as Task[],
    goals: goals as unknown as Goal[],
    settings: normalizedSettings,
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
    || (task.archivedAt !== undefined && !validTimestamp(task.archivedAt))
    || (task.status === 'completed' && !validTimestamp(task.completedAt))) {
    throw new RangeError('INVALID_RECORD: invalid task; source preserved');
  }
  if ((task.description !== undefined && task.description !== null && typeof task.description !== 'string')
    || (task.priority !== undefined && task.priority !== null && !['low', 'medium', 'high'].includes(String(task.priority)))) {
    throw new RangeError('INVALID_RECORD: invalid task details; source preserved');
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

function isAppSettings(value: Record<string, unknown>): value is AppSettings {
  const focus = value.defaultFocusDurationMinutes;
  const focusValid = focus === undefined || focus === 25 || focus === 45 || focus === 60;
  const breaks = value.defaultBreakDurationMinutes;
  const locale = value.uiLocale;
  const localeValid = locale === undefined || locale === 'en' || locale === 'si' || locale === 'ta';
  return focusValid && (breaks === 5 || breaks === 10 || breaks === 15) && localeValid;
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

const SESSION_KEYS = ['id', 'status', 'taskId', 'taskName', 'plannedDurationSeconds', 'focusedDurationSeconds', 'pausedDurationSeconds', 'createdAt', 'startedAt', 'completedAt', 'cancelledAt', 'lastPausedAt', 'lastResumedAt'];
const TASK_KEYS = ['id', 'goalId', 'title', 'description', 'status', 'priority', 'dueAt', 'createdAt', 'updatedAt', 'completedAt'];
const GOAL_KEYS = ['id', 'title', 'description', 'type', 'period', 'status', 'targetValue', 'createdAt', 'updatedAt', 'completedAt', 'startsAt', 'endsAt', 'periodTimeZone', 'legacyOpenPeriod'];

function sessionValues(session: FocusSession, now: string, ownerId = LOCAL_OWNER_ID) {
  return [ownerId, session.id, (session as FocusSession & { taskId?: string }).taskId ?? null,
    session.taskName ?? null, session.status, session.plannedDurationSeconds,
    session.focusedDurationSeconds, session.pausedDurationSeconds, session.startedAt,
    session.completedAt ?? null, session.cancelledAt ?? null, session.lastPausedAt ?? null,
    session.lastResumedAt ?? null, session.createdAt, now, extraJson(session as unknown as Record<string, unknown>, SESSION_KEYS)];
}

function sessionUpdateValues(session: FocusSession, now: string, ownerId = LOCAL_OWNER_ID) {
  const values = sessionValues(session, now, ownerId);
  return [...values.slice(2, 13), values[14], values[15]];
}

function taskValues(task: Task, ownerId = LOCAL_OWNER_ID) {
  const value = task as Task & { priority?: string; dueAt?: string; goalId?: string };
  return [ownerId, task.id, task.title.trim(), task.description ?? null, task.status,
    value.goalId ?? null, value.priority ?? null, value.dueAt ?? null, task.completedAt ?? null,
    task.createdAt, task.updatedAt, extraJson(task as unknown as Record<string, unknown>, TASK_KEYS)];
}

function goalValues(goal: Goal, ownerId = LOCAL_OWNER_ID) {
  return [ownerId, goal.id, goal.title.trim(), goal.description ?? null, goal.type, goal.period,
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

function outboxFromRow(row: {
  mutation_id: string; command: string; entity_type: LocalOutboxMutation['entityType']; target_id: string;
  base_version: number | null; payload_schema_version: 1; payload_json: string; payload_hash: string;
  client_created_at: string; attempt_count: number; next_attempt_at: string;
  state: LocalOutboxMutation['state']; last_error_code: string | null;
}): LocalOutboxMutation {
  let payload: unknown;
  try { payload = JSON.parse(row.payload_json); }
  catch { throw new Error('OUTBOX_DATA_UNAVAILABLE: invalid mutation payload'); }
  if (!isObject(payload)) throw new Error('OUTBOX_DATA_UNAVAILABLE: mutation payload must be an object');
  return {
    mutationId: row.mutation_id, command: row.command, entityType: row.entity_type,
    targetId: row.target_id, baseVersion: row.base_version, payloadSchemaVersion: 1,
    payload, payloadHash: row.payload_hash, clientCreatedAt: row.client_created_at,
    attemptCount: row.attempt_count, nextAttemptAt: row.next_attempt_at,
    state: row.state, lastErrorCode: row.last_error_code,
  };
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

async function insertSession(db: SQLite.SQLiteDatabase, session: FocusSession, now: string, ownerId = LOCAL_OWNER_ID) {
  await db.runAsync(insertSessionSql(), ...sessionValues(session, now, ownerId));
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

export function createAccountLocalDatabaseStore(
  authenticatedUserId: string,
  dependencies: Omit<LocalDatabaseDependencies, 'ownerId' | 'ownerKind'>,
) {
  const ownerId = accountOwnerId(authenticatedUserId);
  return createLocalDatabaseStore({ ...dependencies, ownerId, ownerKind: 'account' });
}

export function createLocalDatabaseStore(dependencies: LocalDatabaseDependencies) {
  let initialization: Promise<SQLite.SQLiteDatabase> | null = null;
  let connection: SQLite.SQLiteDatabase | null = null;
  const ownerId = dependencies.ownerId ?? LOCAL_OWNER_ID;
  const ownerKind = dependencies.ownerKind ?? 'device_local';
  const now = dependencies.now ?? (() => new Date().toISOString());

  // All access to this private connection is queued, including reads, so a
  // caller cannot observe or join another operation's uncommitted transaction.
  function serialize<T>(operation: () => Promise<T>): Promise<T> {
    const result = queuedOperations.then(operation);
    queuedOperations = result.catch(() => undefined);
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
    if (marker && currentVersion < SCHEMA_VERSION) {
      await onConnectionTransaction(db, async (transaction) => {
        const latest = await transaction.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
        if ((latest?.user_version ?? 0) > SCHEMA_VERSION) throw new Error('DATABASE_VERSION_UNSUPPORTED: newer local database');
        if ((latest?.user_version ?? 0) < 2) {
          await transaction.execAsync(ASSESSMENT_SCHEMA_SQL);
          await transaction.execAsync('PRAGMA user_version = 2;');
        }
        if ((latest?.user_version ?? 0) < 3) {
          const columns = await transaction.getAllAsync<{ name: string }>('PRAGMA table_info(user_settings)');
          if (!columns.some((column) => column.name === 'default_focus_duration_minutes')) {
            await transaction.execAsync('ALTER TABLE user_settings ADD COLUMN default_focus_duration_minutes INTEGER NOT NULL DEFAULT 25 CHECK (default_focus_duration_minutes IN (25, 45, 60));');
          }
          await transaction.execAsync('PRAGMA user_version = 3;');
        }
        if ((latest?.user_version ?? 0) < 4) {
          await transaction.execAsync(`CREATE TABLE IF NOT EXISTS local_outbox (
            owner_id TEXT NOT NULL REFERENCES local_owners(id), mutation_id TEXT NOT NULL,
            command TEXT NOT NULL CHECK (length(trim(command)) BETWEEN 1 AND 120),
            entity_type TEXT NOT NULL CHECK (entity_type IN ('focus_session', 'task', 'goal', 'settings')),
            target_id TEXT NOT NULL, base_version INTEGER,
            payload_schema_version INTEGER NOT NULL CHECK (payload_schema_version = 1),
            payload_json TEXT NOT NULL CHECK (json_valid(payload_json)), payload_hash TEXT NOT NULL,
            client_created_at TEXT NOT NULL, attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
            next_attempt_at TEXT NOT NULL, state TEXT NOT NULL CHECK (state IN ('pending', 'in_flight', 'rejected')),
            last_error_code TEXT, PRIMARY KEY (owner_id, mutation_id)
          ); CREATE INDEX IF NOT EXISTS local_outbox_ready ON local_outbox(owner_id, state, next_attempt_at, client_created_at);`);
          await transaction.execAsync('PRAGMA user_version = 4;');
        }
        if ((latest?.user_version ?? 0) < 5) {
          const columns = await transaction.getAllAsync<{ name: string }>('PRAGMA table_info(user_settings)');
          if (!columns.some((column) => column.name === 'ui_locale')) {
            await transaction.execAsync("ALTER TABLE user_settings ADD COLUMN ui_locale TEXT NOT NULL DEFAULT 'en' CHECK (ui_locale IN ('en', 'si', 'ta')); ");
          }
          await transaction.execAsync('PRAGMA user_version = 5;');
        }
        if ((latest?.user_version ?? 0) < 6) {
          await transaction.execAsync(RESOURCE_SCHEMA_SQL);
          await transaction.execAsync('PRAGMA user_version = 6;');
        }
        if ((latest?.user_version ?? 0) < 7) {
          await transaction.execAsync(PLAN_SCHEMA_SQL);
          await transaction.execAsync('PRAGMA user_version = 7;');
        }
        if ((latest?.user_version ?? 0) < 8) {
          await transaction.execAsync(`CREATE TABLE IF NOT EXISTS teacher_assignment_drafts (
            owner_id TEXT NOT NULL REFERENCES local_owners(id), assignment_id TEXT NOT NULL,
            class_id TEXT NOT NULL, title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 240),
            instructions TEXT NOT NULL CHECK (length(trim(instructions)) BETWEEN 1 AND 240),
            deadline TEXT, revision INTEGER NOT NULL CHECK (revision > 0),
            education_json TEXT CHECK (education_json IS NULL OR json_valid(education_json)),
            created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
            PRIMARY KEY (owner_id, assignment_id)
          ); CREATE INDEX IF NOT EXISTS teacher_assignment_drafts_owner_updated
            ON teacher_assignment_drafts(owner_id, updated_at DESC, assignment_id);`);
          await transaction.execAsync('PRAGMA user_version = 8;');
        }
        if ((latest?.user_version ?? 0) < 9) {
          await transaction.execAsync(SNAPSHOT_LOCAL_SCHEMA_SQL);
          await transaction.execAsync('PRAGMA user_version = 9;');
        }
        if ((latest?.user_version ?? 0) < 10) {
          await transaction.execAsync(SNAPSHOT_MIRROR_SCHEMA_SQL);
          await transaction.execAsync('PRAGMA user_version = 10;');
        }
        if ((latest?.user_version ?? 0) < 11) {
          await transaction.execAsync(REMOTE_MIRROR_KIND_MIGRATION_SQL);
          await transaction.execAsync(INCREMENTAL_SYNC_SCHEMA_SQL);
          await transaction.execAsync('PRAGMA user_version = 11;');
        }
        if ((latest?.user_version ?? 0) < 12) {
          await transaction.execAsync(INCREMENTAL_SYNC_KIND_MIGRATION_SQL);
          const columns = await transaction.getAllAsync<{ name: string }>('PRAGMA table_info(user_settings)');
          if (!columns.some((column) => column.name === 'theme')) await transaction.execAsync("ALTER TABLE user_settings ADD COLUMN theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')); ");
          if (!columns.some((column) => column.name === 'ai_features_enabled')) await transaction.execAsync('ALTER TABLE user_settings ADD COLUMN ai_features_enabled INTEGER NOT NULL DEFAULT 0 CHECK (ai_features_enabled IN (0, 1));');
          if (!columns.some((column) => column.name === 'version')) await transaction.execAsync('ALTER TABLE user_settings ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);');
          if (!columns.some((column) => column.name === 'updated_at')) await transaction.execAsync("ALTER TABLE user_settings ADD COLUMN updated_at TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z';");
          await transaction.execAsync('PRAGMA user_version = 12;');
        }
      });
    }
    if (!marker) {
      const snapshot = parseLegacy(await dependencies.readLegacyFiles());
      await onConnectionTransaction(db, async (transaction) => {
        const existing = await transaction.getFirstAsync<{ version: number }>('SELECT version FROM local_migrations WHERE version = ?', LEGACY_IMPORT_VERSION);
        if (existing) return;
        const current = await transaction.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
        if ((current?.user_version ?? 0) > SCHEMA_VERSION) throw new Error('DATABASE_VERSION_UNSUPPORTED: newer local database');
        await transaction.execAsync(ASSESSMENT_SCHEMA_SQL);
        if ((current?.user_version ?? 0) < 3) {
          const columns = await transaction.getAllAsync<{ name: string }>('PRAGMA table_info(user_settings)');
          if (!columns.some((column) => column.name === 'default_focus_duration_minutes')) {
            await transaction.execAsync('ALTER TABLE user_settings ADD COLUMN default_focus_duration_minutes INTEGER NOT NULL DEFAULT 25 CHECK (default_focus_duration_minutes IN (25, 45, 60));');
          }
        }
        if ((current?.user_version ?? 0) < 4) {
          await transaction.execAsync(`CREATE TABLE IF NOT EXISTS local_outbox (
            owner_id TEXT NOT NULL REFERENCES local_owners(id), mutation_id TEXT NOT NULL,
            command TEXT NOT NULL CHECK (length(trim(command)) BETWEEN 1 AND 120),
            entity_type TEXT NOT NULL CHECK (entity_type IN ('focus_session', 'task', 'goal', 'settings')),
            target_id TEXT NOT NULL, base_version INTEGER,
            payload_schema_version INTEGER NOT NULL CHECK (payload_schema_version = 1),
            payload_json TEXT NOT NULL CHECK (json_valid(payload_json)), payload_hash TEXT NOT NULL,
            client_created_at TEXT NOT NULL, attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
            next_attempt_at TEXT NOT NULL, state TEXT NOT NULL CHECK (state IN ('pending', 'in_flight', 'rejected')),
            last_error_code TEXT, PRIMARY KEY (owner_id, mutation_id)
          ); CREATE INDEX IF NOT EXISTS local_outbox_ready ON local_outbox(owner_id, state, next_attempt_at, client_created_at);`);
        }
        if ((current?.user_version ?? 0) < 5) {
          const columns = await transaction.getAllAsync<{ name: string }>('PRAGMA table_info(user_settings)');
          if (!columns.some((column) => column.name === 'ui_locale')) {
            await transaction.execAsync("ALTER TABLE user_settings ADD COLUMN ui_locale TEXT NOT NULL DEFAULT 'en' CHECK (ui_locale IN ('en', 'si', 'ta')); ");
          }
        }
        if ((current?.user_version ?? 0) < 6) await transaction.execAsync(RESOURCE_SCHEMA_SQL);
        if ((current?.user_version ?? 0) < 7) await transaction.execAsync(PLAN_SCHEMA_SQL);
        if ((current?.user_version ?? 0) < 8) await transaction.execAsync(`CREATE TABLE IF NOT EXISTS teacher_assignment_drafts (
          owner_id TEXT NOT NULL REFERENCES local_owners(id), assignment_id TEXT NOT NULL,
          class_id TEXT NOT NULL, title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 240),
          instructions TEXT NOT NULL CHECK (length(trim(instructions)) BETWEEN 1 AND 240),
          deadline TEXT, revision INTEGER NOT NULL CHECK (revision > 0),
          education_json TEXT CHECK (education_json IS NULL OR json_valid(education_json)),
          created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
          PRIMARY KEY (owner_id, assignment_id)
        ); CREATE INDEX IF NOT EXISTS teacher_assignment_drafts_owner_updated
          ON teacher_assignment_drafts(owner_id, updated_at DESC, assignment_id);`);
        if ((current?.user_version ?? 0) < 9) await transaction.execAsync(SNAPSHOT_LOCAL_SCHEMA_SQL);
        if ((current?.user_version ?? 0) < 10) await transaction.execAsync(SNAPSHOT_MIRROR_SCHEMA_SQL);
        if ((current?.user_version ?? 0) < 11) {
          await transaction.execAsync(REMOTE_MIRROR_KIND_MIGRATION_SQL);
          await transaction.execAsync(INCREMENTAL_SYNC_SCHEMA_SQL);
        }
        if ((current?.user_version ?? 0) < 12) {
          await transaction.execAsync(INCREMENTAL_SYNC_KIND_MIGRATION_SQL);
          const columns = await transaction.getAllAsync<{ name: string }>('PRAGMA table_info(user_settings)');
          if (!columns.some((column) => column.name === 'theme')) await transaction.execAsync("ALTER TABLE user_settings ADD COLUMN theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')); ");
          if (!columns.some((column) => column.name === 'ai_features_enabled')) await transaction.execAsync('ALTER TABLE user_settings ADD COLUMN ai_features_enabled INTEGER NOT NULL DEFAULT 0 CHECK (ai_features_enabled IN (0, 1));');
          if (!columns.some((column) => column.name === 'version')) await transaction.execAsync('ALTER TABLE user_settings ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);');
          if (!columns.some((column) => column.name === 'updated_at')) await transaction.execAsync("ALTER TABLE user_settings ADD COLUMN updated_at TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z';");
        }
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
        await reconcileGoalLifecycleInTransaction(transaction, LOCAL_OWNER_ID, now());
        if (snapshot.activeId) {
          await transaction.runAsync('INSERT INTO active_focus_sessions (owner_id,session_id) VALUES (?,?)', LOCAL_OWNER_ID, snapshot.activeId);
        }
        if (snapshot.settings) {
          await transaction.runAsync('INSERT INTO user_settings (owner_id,default_focus_duration_minutes,default_break_duration_minutes,ui_locale) VALUES (?,?,?,?)', LOCAL_OWNER_ID, snapshot.settings.defaultFocusDurationMinutes, snapshot.settings.defaultBreakDurationMinutes, snapshot.settings.uiLocale);
        }
        await transaction.runAsync('INSERT INTO local_migrations (version,name,completed_at) VALUES (?,?,?)', LEGACY_IMPORT_VERSION, 'legacy-json-to-sqlite-v1', now());
        await transaction.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
      });
    }
    await onConnectionTransaction(db, async (transaction) => {
      await transaction.runAsync(
        'INSERT OR IGNORE INTO local_owners (id,kind,created_at) VALUES (?,?,?)',
        ownerId,
        ownerKind,
        now(),
      );
    });
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
    async loadTeacherAssignmentDrafts(): Promise<TeacherAssignmentDraft[]> {
      return serialize(async () => {
        const db = await database();
        const rows = await db.getAllAsync<TeacherAssignmentDraftRow>(
          `SELECT assignment_id,class_id,title,instructions,deadline,revision,education_json
           FROM teacher_assignment_drafts WHERE owner_id = ? ORDER BY updated_at DESC,assignment_id`, ownerId,
        );
        return rows.map(teacherAssignmentDraftFromRow);
      });
    },

    /** Saves only a newer local revision; it never creates an invite or server write. */
    async saveTeacherAssignmentDraft(draft: TeacherAssignmentDraft): Promise<boolean> {
      const checked = createTeacherAssignmentDraft(draft);
      if (!checked.valid) throw new RangeError(`INVALID_TEACHER_ASSIGNMENT: ${checked.reason}`);
      const normalized = checked.draft;
      return transaction(async (db) => {
        const educationJson = normalized.education === undefined ? null : JSON.stringify(normalized.education);
        const timestamp = now();
        const result = await db.runAsync(
          `INSERT INTO teacher_assignment_drafts
             (owner_id,assignment_id,class_id,title,instructions,deadline,revision,education_json,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?)
           ON CONFLICT(owner_id,assignment_id) DO UPDATE SET
             class_id=excluded.class_id,title=excluded.title,instructions=excluded.instructions,
             deadline=excluded.deadline,revision=excluded.revision,education_json=excluded.education_json,
             updated_at=excluded.updated_at
           WHERE excluded.revision > teacher_assignment_drafts.revision`,
          ownerId, normalized.assignmentId, normalized.classId, normalized.title, normalized.instructions,
          normalized.deadline ?? null, normalized.revision, educationJson, timestamp, timestamp,
        );
        return Number(result.changes) > 0;
      });
    },

    async loadResources(): Promise<LocalResource[]> {
      return serialize(async () => {
        const db = await database();
        const rows = await db.getAllAsync<ResourceRow>(
          'SELECT id,kind,title,reference,revision,lifecycle,created_at,updated_at FROM local_resources WHERE owner_id = ? ORDER BY updated_at DESC,id',
          ownerId,
        );
        return rows.map(resourceFromRow);
      });
    },

    async saveResource(resource: LocalResource): Promise<void> {
      const normalized = validateResourceInput(resource);
      validateResourceId(resource.id);
      validateResourceRevision(resource.revision);
      if (resource.lifecycle !== 'active' && resource.lifecycle !== 'missing') throw new RangeError('INVALID_RESOURCE: lifecycle is invalid');
      if (!validTimestamp(resource.createdAt) || !validTimestamp(resource.updatedAt)) throw new RangeError('INVALID_RESOURCE: timestamps are invalid');
      await transaction(async (db) => {
        await db.runAsync(
          `INSERT INTO local_resources (owner_id,id,kind,title,reference,revision,lifecycle,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?)
           ON CONFLICT(owner_id,id) DO UPDATE SET kind=excluded.kind,title=excluded.title,reference=excluded.reference,
             revision=excluded.revision,lifecycle=excluded.lifecycle,created_at=excluded.created_at,updated_at=excluded.updated_at`,
          ...resourceValues({ ...resource, ...normalized }, ownerId),
        );
      });
    },

    async markResourceMissing(resourceId: string, expectedUpdatedAt: string): Promise<boolean> {
      validateResourceId(resourceId);
      if (!validTimestamp(expectedUpdatedAt)) throw new RangeError('INVALID_RESOURCE: revision timestamp is invalid');
      return transaction(async (db) => {
        const updatedAt = nextRevisionTimestamp(expectedUpdatedAt, now());
        const result = await db.runAsync(
          `UPDATE local_resources SET lifecycle = 'missing', revision = revision + 1, updated_at = ?
           WHERE owner_id = ? AND id = ? AND updated_at = ?`,
          updatedAt, ownerId, resourceId, expectedUpdatedAt,
        );
        return result.changes === 1;
      });
    },

    async loadTaskResourceLinks(taskId: string): Promise<TaskResourceLink[]> {
      validateResourceId(taskId);
      return serialize(async () => {
        const db = await database();
        const rows = await db.getAllAsync<TaskResourceLinkRow>(
          'SELECT task_id,resource_id,resource_revision,work_slice,position FROM task_resource_links WHERE owner_id = ? AND task_id = ? ORDER BY position,resource_id',
          ownerId, taskId,
        );
        return rows.map((row) => {
          validateResourceId(row.task_id); validateResourceId(row.resource_id);
          validateResourceRevision(row.resource_revision); validateLinkPosition(row.position);
          const workSlice = row.work_slice === null ? undefined : validateWorkSlice(row.work_slice);
          return { taskId: row.task_id, resourceId: row.resource_id, resourceRevision: row.resource_revision, ...(workSlice ? { workSlice } : {}), position: row.position };
        });
      });
    },

    async linkResourceToTask(taskId: string, resourceId: string, resourceRevision: number, workSlice?: string, position = 0): Promise<boolean> {
      validateResourceId(taskId); validateResourceId(resourceId); validateResourceRevision(resourceRevision);
      const normalizedSlice = validateWorkSlice(workSlice); validateLinkPosition(position);
      return transaction(async (db) => {
        const resource = await db.getFirstAsync<{ revision: number; lifecycle: LocalResource['lifecycle'] }>(
          'SELECT revision,lifecycle FROM local_resources WHERE owner_id = ? AND id = ?', ownerId, resourceId,
        );
        if (!resource || resource.lifecycle !== 'active' || resource.revision !== resourceRevision) return false;
        const task = await db.getFirstAsync<{ id: string }>('SELECT id FROM tasks WHERE owner_id = ? AND id = ?', ownerId, taskId);
        if (!task) return false;
        await db.runAsync(
          `INSERT INTO task_resource_links (owner_id,task_id,resource_id,resource_revision,work_slice,position)
           VALUES (?,?,?,?,?,?) ON CONFLICT(owner_id,task_id,resource_id) DO UPDATE SET resource_revision=excluded.resource_revision,work_slice=excluded.work_slice,position=excluded.position`,
          ownerId, taskId, resourceId, resourceRevision, normalizedSlice ?? null, position,
        );
        return true;
      });
    },

    async unlinkResourceFromTask(taskId: string, resourceId: string): Promise<boolean> {
      validateResourceId(taskId); validateResourceId(resourceId);
      return transaction(async (db) => {
        const result = await db.runAsync(
          'DELETE FROM task_resource_links WHERE owner_id = ? AND task_id = ? AND resource_id = ?', ownerId, taskId, resourceId,
        );
        return result.changes === 1;
      });
    },

    async saveConfirmedPlan(plan: SavedPlan): Promise<void> {
      if (!plan || typeof plan.id !== 'string' || !plan.id.trim() || plan.id.length > 256
        || plan.provider !== 'mock' || typeof plan.model !== 'string' || !plan.model.trim() || plan.model.length > 120
        || !validTimestamp(plan.createdAt) || !validTimestamp(plan.confirmedAt)
        || Date.parse(plan.confirmedAt) < Date.parse(plan.createdAt)
        || plan.status !== 'active' || !Array.isArray(plan.items) || plan.items.length < 1 || plan.items.length > 50) {
        throw new RangeError('INVALID_PLAN: confirmed local plan is invalid');
      }
      const positions = new Set<number>();
      const taskIds = new Set<string>();
      for (const item of plan.items) {
        if (!item || typeof item.taskId !== 'string' || !item.taskId.trim() || item.taskId.length > 128
          || !Number.isSafeInteger(item.position) || item.position < 0 || positions.has(item.position)
          || taskIds.has(item.taskId) || !Number.isSafeInteger(item.focusDurationSeconds) || item.focusDurationSeconds <= 0
          || !Number.isSafeInteger(item.breakDurationSeconds) || item.breakDurationSeconds < 0) {
          throw new RangeError('INVALID_PLAN: plan item is invalid');
        }
        positions.add(item.position); taskIds.add(item.taskId);
      }
      await transaction(async (db) => {
        const tasks = await db.getAllAsync<{ id: string }>(
          `SELECT id FROM tasks WHERE owner_id = ? AND id IN (${plan.items.map(() => '?').join(',')})`,
          ownerId, ...plan.items.map((item) => item.taskId),
        );
        if (tasks.length !== taskIds.size) throw new RangeError('INVALID_PLAN: task is not owned by this account');
        await db.runAsync("UPDATE saved_plans SET status = 'cancelled' WHERE owner_id = ? AND status = 'active'", ownerId);
        await db.runAsync(
          'INSERT INTO saved_plans (owner_id,id,provider,model,created_at,confirmed_at,status) VALUES (?,?,?,?,?,?,?)',
          ownerId, plan.id, plan.provider, plan.model, plan.createdAt, plan.confirmedAt, 'active',
        );
        for (const item of plan.items) {
          await db.runAsync(
            `INSERT INTO saved_plan_items (owner_id,plan_id,task_id,position,focus_duration_seconds,break_duration_seconds)
             VALUES (?,?,?,?,?,?)`,
            ownerId, plan.id, item.taskId, item.position, item.focusDurationSeconds, item.breakDurationSeconds,
          );
        }
      });
    },

    async loadActivePlan(): Promise<SavedPlan | null> {
      return serialize(async () => {
        const db = await database();
        const plan = await db.getFirstAsync<{
          id: string; provider: 'mock'; model: string; created_at: string; confirmed_at: string; status: SavedPlan['status'];
        }>("SELECT id,provider,model,created_at,confirmed_at,status FROM saved_plans WHERE owner_id = ? AND status = 'active'", ownerId);
        if (!plan) return null;
        const items = await db.getAllAsync<{
          task_id: string; position: number; focus_duration_seconds: number; break_duration_seconds: number;
        }>('SELECT task_id,position,focus_duration_seconds,break_duration_seconds FROM saved_plan_items WHERE owner_id = ? AND plan_id = ? ORDER BY position,task_id', ownerId, plan.id);
        return {
          id: plan.id, provider: plan.provider, model: plan.model, createdAt: plan.created_at,
          confirmedAt: plan.confirmed_at, status: plan.status,
          items: items.map((item) => ({ taskId: item.task_id, position: item.position, focusDurationSeconds: item.focus_duration_seconds, breakDurationSeconds: item.break_duration_seconds })),
        };
      });
    },

    async cancelActivePlan(): Promise<boolean> {
      return transaction(async (db) => {
        const result = await db.runAsync("UPDATE saved_plans SET status = 'cancelled' WHERE owner_id = ? AND status = 'active'", ownerId);
        return result.changes === 1;
      });
    },

    async loadTasks(): Promise<Task[]> {
      return serialize(async () => {
      const db = await database();
      const rows = await db.getAllAsync<TaskRow & { goal_id: string | null; priority: string | null; due_at: string | null }>(
        'SELECT id,title,description,status,created_at,updated_at,completed_at,legacy_extra_json,goal_id,priority,due_at FROM tasks WHERE owner_id = ? ORDER BY created_at DESC,id', ownerId);
      return rows.map((row) => {
        const task = mergeExtra({
          id: row.id, title: row.title, status: row.status, createdAt: row.created_at,
          updatedAt: row.updated_at, ...(row.description !== null ? { description: row.description } : {}),
          ...(row.completed_at !== null ? { completedAt: row.completed_at } : {}),
          ...(row.goal_id ? { goalId: row.goal_id } : {}), ...(row.priority ? { priority: row.priority } : {}),
          ...(row.due_at ? { dueAt: row.due_at } : {}),
        }, row.legacy_extra_json) as Task & Record<string, unknown>;
        // Typed SQLite columns are canonical; never resurrect cleared values from older duplicate JSON fields.
        if (row.goal_id === null) delete task.goalId;
        else task.goalId = row.goal_id;
        if (row.priority === null) delete task.priority;
        else task.priority = row.priority as Task['priority'];
        if (row.due_at === null) delete task.dueAt;
        else task.dueAt = row.due_at;
        return task;
      });
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
        for (const task of tasks) await db.runAsync(`INSERT INTO tasks (owner_id,id,title,description,status,goal_id,priority,due_at,completed_at,created_at,updated_at,legacy_extra_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(owner_id,id) DO UPDATE SET title=excluded.title,description=excluded.description,status=excluded.status,goal_id=excluded.goal_id,priority=excluded.priority,due_at=excluded.due_at,completed_at=excluded.completed_at,updated_at=excluded.updated_at,legacy_extra_json=excluded.legacy_extra_json`, ...taskValues(task, ownerId));
      });
    },

    async updateTaskTitle(taskId: string, expectedUpdatedAt: string, title: string): Promise<string | null> {
      const normalizedTitle = title.trim();
      if (!taskId || !expectedUpdatedAt || !normalizedTitle || normalizedTitle.length > 120) {
        throw new RangeError('INVALID_INPUT: task title must contain 1 to 120 characters');
      }
      return transaction(async (db) => {
        const updatedAt = nextRevisionTimestamp(expectedUpdatedAt, now());
        const result = await db.runAsync(
          `UPDATE tasks SET title = ?, updated_at = ?
           WHERE owner_id = ? AND id = ? AND updated_at = ? AND status IN ('pending','in_progress')`,
          normalizedTitle, updatedAt, ownerId, taskId, expectedUpdatedAt,
        );
        return result.changes === 1 ? updatedAt : null;
      });
    },

    async updateTaskDetails(taskId: string, expectedUpdatedAt: string, title: string, description: string, priority: Task['priority'], goalId?: string | null, dueAt?: string | null): Promise<string | null> {
      const normalizedTitle = title.trim();
      if (!taskId || !expectedUpdatedAt || !normalizedTitle || normalizedTitle.length > 120
        || typeof description !== 'string'
        || (priority !== undefined && !['low', 'medium', 'high'].includes(priority))
        || (typeof goalId === 'string' && (!goalId.trim() || goalId.length > 128))
        || (typeof dueAt === 'string' && (!validTimestamp(dueAt) || new Date(dueAt).toISOString() !== dueAt))) {
        throw new RangeError('INVALID_INPUT: task title, description, priority, goal link, or due date is invalid');
      }
      return transaction(async (db) => {
        const updatedAt = nextRevisionTimestamp(expectedUpdatedAt, now());
        const result = await db.runAsync(
          `UPDATE tasks SET title = ?, description = ?, priority = ?,
             goal_id = CASE WHEN ? = 1 THEN ? ELSE goal_id END,
             due_at = CASE WHEN ? = 1 THEN ? ELSE due_at END, updated_at = ?
           WHERE owner_id = ? AND id = ? AND updated_at = ? AND status IN ('pending','in_progress')`,
          normalizedTitle, description.trim() || null, priority ?? null, goalId !== undefined ? 1 : 0, goalId ?? null,
          dueAt !== undefined ? 1 : 0, dueAt ?? null, updatedAt, ownerId, taskId, expectedUpdatedAt,
        );
        return result.changes === 1 ? updatedAt : null;
      });
    },

    async updateTaskArchive(taskId: string, expectedUpdatedAt: string, archivedAt: string | null): Promise<string | null> {
      if (!taskId || !expectedUpdatedAt || (archivedAt !== null
        && (!validTimestamp(archivedAt) || new Date(archivedAt).toISOString() !== archivedAt))) {
        throw new RangeError('INVALID_INPUT: task ID, revision, or archive timestamp is invalid');
      }
      return transaction(async (db) => {
        const row = await db.getFirstAsync<{ updated_at: string; legacy_extra_json: string | null }>(
          'SELECT updated_at,legacy_extra_json FROM tasks WHERE owner_id = ? AND id = ?', ownerId, taskId,
        );
        if (!row || row.updated_at !== expectedUpdatedAt) return null;
        const extras = mergeExtra({}, row.legacy_extra_json);
        if (archivedAt === null) delete extras.archivedAt;
        else extras.archivedAt = archivedAt;
        const updatedAt = nextRevisionTimestamp(expectedUpdatedAt, now());
        const result = await db.runAsync(
          'UPDATE tasks SET legacy_extra_json = ?, updated_at = ? WHERE owner_id = ? AND id = ? AND updated_at = ?',
          extraJson(extras, []), updatedAt, ownerId, taskId, expectedUpdatedAt,
        );
        return result.changes === 1 ? updatedAt : null;
      });
    },

    async deleteTask(taskId: string, expectedUpdatedAt: string): Promise<boolean> {
      if (!taskId || !expectedUpdatedAt) throw new RangeError('INVALID_INPUT: task ID and revision are required');
      return transaction(async (db) => {
        const task = await db.getFirstAsync<{ title: string; updated_at: string }>(
          'SELECT title,updated_at FROM tasks WHERE owner_id = ? AND id = ?', ownerId, taskId,
        );
        if (!task || task.updated_at !== expectedUpdatedAt) return false;
        const deletedAt = now();
        await db.runAsync(
          `UPDATE focus_sessions SET task_id = NULL, task_name = COALESCE(task_name, ?), updated_at = ?
           WHERE owner_id = ? AND task_id = ?`,
          task.title, deletedAt, ownerId, taskId,
        );
        const result = await db.runAsync(
          'DELETE FROM tasks WHERE owner_id = ? AND id = ? AND updated_at = ?', ownerId, taskId, expectedUpdatedAt,
        );
        if (result.changes !== 1) throw new Error('TASK_DELETE_CONFLICT: task changed during deletion');
        return true;
      });
    },

    async loadGoals(): Promise<Goal[]> {
      return transaction(async (db) => {
        await reconcileGoalLifecycleInTransaction(db, ownerId, now());
        const rows = await db.getAllAsync<GoalRow>('SELECT * FROM goals WHERE owner_id = ? ORDER BY created_at DESC,id', ownerId);
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
            const stored = await db.getFirstAsync<GoalRow>('SELECT * FROM goals WHERE owner_id = ? AND id = ?', ownerId, goal.id);
            if (!stored || canonicalJson(goalFromRow(stored)) !== canonicalJson(goal)) {
              throw new RangeError('INVALID_INPUT: legacy goals may only be preserved unchanged');
            }
            continue;
          }
          await db.runAsync(`INSERT INTO goals (owner_id,id,title,description,type,period,status,target_value,starts_at,ends_at,period_timezone,legacy_open_period,completed_at,created_at,updated_at,legacy_extra_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(owner_id,id) DO UPDATE SET title=excluded.title,description=excluded.description,type=excluded.type,period=excluded.period,status=excluded.status,target_value=excluded.target_value,starts_at=excluded.starts_at,ends_at=excluded.ends_at,period_timezone=excluded.period_timezone,legacy_open_period=excluded.legacy_open_period,completed_at=excluded.completed_at,updated_at=excluded.updated_at,legacy_extra_json=excluded.legacy_extra_json`, ...goalValues(goal, ownerId));
        }
        await reconcileGoalLifecycleInTransaction(db, ownerId, now());
      });
    },

    async updateGoalDefinition(goalId: string, expectedUpdatedAt: string, title: string, targetValue: number): Promise<Goal | null> {
      const normalizedTitle = title.trim();
      if (!goalId || !expectedUpdatedAt || !normalizedTitle || !Number.isSafeInteger(targetValue) || targetValue <= 0) {
        throw new RangeError('INVALID_INPUT: goal title and positive integer target are required');
      }
      return transaction(async (db) => {
        const updatedAt = nextRevisionTimestamp(expectedUpdatedAt, now());
        const result = await db.runAsync(
          `UPDATE goals SET title = ?, target_value = ?, updated_at = ?
           WHERE owner_id = ? AND id = ? AND updated_at = ? AND status = 'active' AND legacy_open_period = 0`,
          normalizedTitle, targetValue, updatedAt, ownerId, goalId, expectedUpdatedAt,
        );
        if (result.changes !== 1) return null;
        await reconcileGoalLifecycleInTransaction(db, ownerId, now());
        const row = await db.getFirstAsync<GoalRow>('SELECT * FROM goals WHERE owner_id = ? AND id = ?', ownerId, goalId);
        return row ? goalFromRow(row) : null;
      });
    },

    async deleteGoal(goalId: string, expectedUpdatedAt: string): Promise<boolean> {
      if (!goalId || !validTimestamp(expectedUpdatedAt)) throw new RangeError('INVALID_INPUT: a goal ID and valid revision are required');
      return transaction(async (db) => {
        const existing = await db.getFirstAsync<{ updated_at: string; legacy_open_period: number }>(
          'SELECT updated_at,legacy_open_period FROM goals WHERE owner_id = ? AND id = ?', ownerId, goalId,
        );
        if (!existing || existing.updated_at !== expectedUpdatedAt || existing.legacy_open_period !== 0) return false;

        const linkedTasks = await db.getAllAsync<{ id: string; updated_at: string }>(
          'SELECT id,updated_at FROM tasks WHERE owner_id = ? AND goal_id = ?', ownerId, goalId,
        );
        for (const task of linkedTasks) {
          const taskRevision = nextRevisionTimestamp(task.updated_at, now());
          await db.runAsync(
            'UPDATE tasks SET goal_id = NULL, updated_at = ? WHERE owner_id = ? AND id = ? AND goal_id = ? AND updated_at = ?',
            taskRevision, ownerId, task.id, goalId, task.updated_at,
          );
        }
        const result = await db.runAsync(
          'DELETE FROM goals WHERE owner_id = ? AND id = ? AND updated_at = ? AND legacy_open_period = 0',
          ownerId, goalId, expectedUpdatedAt,
        );
        return result.changes === 1;
      });
    },

    async loadActiveSession(strict = false): Promise<FocusSession | null> {
      try {
        return await serialize(async () => {
          const db = await database();
          const row = await db.getFirstAsync<SessionRow & { task_id: string | null }>(`SELECT s.*,s.task_id FROM active_focus_sessions a JOIN focus_sessions s ON s.owner_id=a.owner_id AND s.id=a.session_id WHERE a.owner_id = ?`, ownerId);
          return row ? sessionFromRow(row, row.task_id) : null;
        });
      } catch (error) { if (strict) throw error; return null; }
    },

    async saveActiveSession(session: FocusSession) {
      validateFocusSession(session);
      if (session.status !== 'active' && session.status !== 'paused') throw new RangeError('Only active sessions can occupy the recovery pointer');
      await transaction(async (db) => {
        const current = await db.getFirstAsync<{ session_id: string }>('SELECT session_id FROM active_focus_sessions WHERE owner_id = ?', ownerId);
        if (current && current.session_id !== session.id) throw new Error('ACTIVE_SESSION_CONFLICT: refusing to replace a different recovery pointer');
        const existing = await db.getFirstAsync<{ id: string; status: FocusSession['status'] }>('SELECT id,status FROM focus_sessions WHERE owner_id = ? AND id = ?', ownerId, session.id);
        if (existing?.status === 'completed' || existing?.status === 'cancelled') {
          throw new Error('TERMINAL_SESSION_CONFLICT: refusing to revive finalized history');
        }
        if (existing) {
          await db.runAsync(`UPDATE focus_sessions SET task_id=?,task_name=?,status=?,planned_duration_seconds=?,focused_duration_seconds=?,paused_duration_seconds=?,started_at=?,completed_at=?,cancelled_at=?,last_paused_at=?,last_resumed_at=?,updated_at=?,legacy_extra_json=? WHERE owner_id=? AND id=?`, ...sessionUpdateValues(session, now(), ownerId), ownerId, session.id);
        } else await insertSession(db, session, now(), ownerId);
        await db.runAsync('INSERT INTO active_focus_sessions (owner_id,session_id) VALUES (?,?) ON CONFLICT(owner_id) DO UPDATE SET session_id=excluded.session_id', ownerId, session.id);
      });
    },

    async clearActiveSession() {
      await transaction(async (db) => { await db.runAsync('DELETE FROM active_focus_sessions WHERE owner_id = ?', ownerId); });
    },

    async appendSessionHistory(session: FocusSession) {
      if (session.status !== 'completed' && session.status !== 'cancelled') throw new RangeError('Only terminal sessions can be appended to history');
      validateFocusSession(session);
      await transaction(async (db) => {
        await persistTerminalInTransaction(db, session, now(), false, ownerId);
        await reconcileGoalLifecycleInTransaction(db, ownerId, now());
      });
    },

    async persistTerminalSession(session: FocusSession) {
      if (session.status !== 'completed' && session.status !== 'cancelled') throw new RangeError('Only terminal sessions can be finalized');
      validateFocusSession(session);
      await transaction(async (db) => {
        await persistTerminalInTransaction(db, session, now(), true, ownerId);
        await reconcileGoalLifecycleInTransaction(db, ownerId, now());
      });
    },

    /** Stages an immutable account snapshot; it never changes the live mirror. */
    async beginSnapshotStaging(input: Omit<LocalSnapshotStaging, 'status'>): Promise<'created' | 'existing'> {
      validateSnapshotMetadata(input);
      if (input.resumeCursor !== null && !SNAPSHOT_CURSOR.test(input.resumeCursor)) throw new RangeError('SNAPSHOT_CURSOR_INVALID');
      return transaction(async (db) => {
        const existing = await db.getFirstAsync<LocalSnapshotStaging & { snapshot_id: string; high_water: string; page_count: number; manifest_digest: string; resume_cursor: string | null }>(
          `SELECT snapshot_id,high_water,page_count,manifest_digest,resume_cursor,status FROM sync_snapshot_staging
           WHERE owner_id = ? AND snapshot_id = ?`, ownerId, input.snapshotId,
        );
        if (existing) {
          if (existing.high_water !== input.highWater || existing.page_count !== input.pageCount
            || existing.manifest_digest !== input.manifestDigest || existing.resume_cursor !== input.resumeCursor
            || existing.status === 'failed') throw new Error('SNAPSHOT_CONFLICT');
          return 'existing';
        }
        await db.runAsync(
          `INSERT INTO sync_snapshot_staging
             (owner_id,snapshot_id,status,high_water,page_count,manifest_digest,resume_cursor,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?)`,
          ownerId, input.snapshotId, 'building', input.highWater, input.pageCount, input.manifestDigest,
          input.resumeCursor, now(), now(),
        );
        return 'created';
      });
    },

    /** Writes one page idempotently and rejects conflicting replays. */
    async stageSnapshotPage(input: LocalSnapshotStagingPage): Promise<'inserted' | 'existing'> {
      validateSnapshotPage(input);
      const payloadJson = canonicalJson(input.payload);
      return transaction(async (db) => {
        const staging = await db.getFirstAsync<{ high_water: string; page_count: number; status: string }>(
          'SELECT high_water,page_count,status FROM sync_snapshot_staging WHERE owner_id = ? AND snapshot_id = ?', ownerId, input.snapshotId,
        );
        if (!staging || staging.status !== 'building' || staging.high_water !== input.highWater || staging.page_count !== input.pageCount) {
          throw new Error('SNAPSHOT_NOT_BUILDING');
        }
        const existing = await db.getFirstAsync<{ page_digest: string; payload_json: string; next_cursor: string | null }>(
          `SELECT page_digest,payload_json,next_cursor FROM sync_snapshot_staging_pages
           WHERE owner_id = ? AND snapshot_id = ? AND page_index = ?`, ownerId, input.snapshotId, input.pageIndex,
        );
        if (existing) {
          if (existing.page_digest !== input.pageDigest || existing.payload_json !== payloadJson || existing.next_cursor !== input.nextCursor) {
            throw new Error('SNAPSHOT_PAGE_CONFLICT');
          }
          return 'existing';
        }
        await db.runAsync(
          `INSERT INTO sync_snapshot_staging_pages
             (owner_id,snapshot_id,page_index,page_count,high_water,page_digest,payload_json,next_cursor,created_at)
           VALUES (?,?,?,?,?,?,?,?,?)`,
          ownerId, input.snapshotId, input.pageIndex, input.pageCount, input.highWater, input.pageDigest,
          payloadJson, input.nextCursor, now(),
        );
        await db.runAsync('UPDATE sync_snapshot_staging SET updated_at = ? WHERE owner_id = ? AND snapshot_id = ?', now(), ownerId, input.snapshotId);
        return 'inserted';
      });
    },

    async loadSnapshotStaging(snapshotId: string): Promise<{ staging: LocalSnapshotStaging; pages: LocalSnapshotStagingPage[] } | null> {
      if (!SNAPSHOT_UUID.test(snapshotId)) throw new RangeError('SNAPSHOT_INVALID');
      return serialize(async () => {
        const db = await database();
        const staging = await db.getFirstAsync<{ snapshot_id: string; high_water: string; page_count: number; manifest_digest: string; resume_cursor: string | null; status: LocalSnapshotStaging['status'] }>(
          'SELECT snapshot_id,high_water,page_count,manifest_digest,resume_cursor,status FROM sync_snapshot_staging WHERE owner_id = ? AND snapshot_id = ?', ownerId, snapshotId,
        );
        if (!staging) return null;
        const rows = await db.getAllAsync<{ snapshot_id: string; page_index: number; page_count: number; high_water: string; page_digest: string; payload_json: string; next_cursor: string | null }>(
          `SELECT snapshot_id,page_index,page_count,high_water,page_digest,payload_json,next_cursor
           FROM sync_snapshot_staging_pages WHERE owner_id = ? AND snapshot_id = ? ORDER BY page_index`, ownerId, snapshotId,
        );
        return {
          staging: { snapshotId: staging.snapshot_id, highWater: staging.high_water, pageCount: staging.page_count, manifestDigest: staging.manifest_digest, resumeCursor: staging.resume_cursor, status: staging.status },
          pages: rows.map((row) => {
            let payload: unknown;
            try { payload = JSON.parse(row.payload_json); } catch { throw new Error('SNAPSHOT_DATA_UNAVAILABLE'); }
            if (!Array.isArray(payload) || payload.some((value) => !isObject(value))) throw new Error('SNAPSHOT_DATA_UNAVAILABLE');
            return { snapshotId: row.snapshot_id, pageIndex: row.page_index, pageCount: row.page_count, highWater: row.high_water, pageDigest: row.page_digest, payload: payload as Record<string, unknown>[], nextCursor: row.next_cursor };
          }),
        };
      });
    },

    async finalizeSnapshotStaging(snapshotId: string): Promise<void> {
      if (!SNAPSHOT_UUID.test(snapshotId)) throw new RangeError('SNAPSHOT_INVALID');
      await transaction(async (db) => {
        const staging = await db.getFirstAsync<{ page_count: number; status: string }>(
          'SELECT page_count,status FROM sync_snapshot_staging WHERE owner_id = ? AND snapshot_id = ?', ownerId, snapshotId,
        );
        if (!staging || staging.status !== 'building') throw new Error('SNAPSHOT_NOT_BUILDING');
        const pages = await db.getAllAsync<{ page_index: number }>(
          'SELECT page_index FROM sync_snapshot_staging_pages WHERE owner_id = ? AND snapshot_id = ? ORDER BY page_index', ownerId, snapshotId,
        );
        if (pages.length !== staging.page_count || pages.some((page, index) => page.page_index !== index)) throw new Error('SNAPSHOT_INCOMPLETE');
        await db.runAsync(
          `UPDATE sync_snapshot_staging SET status = 'ready', updated_at = ?
           WHERE owner_id = ? AND snapshot_id = ? AND status = 'building'`, now(), ownerId, snapshotId,
        );
      });
    },

    /** Records an interrupted staging attempt without deleting its durable pages. */
    async failSnapshotStaging(snapshotId: string): Promise<boolean> {
      if (!SNAPSHOT_UUID.test(snapshotId)) throw new RangeError('SNAPSHOT_INVALID');
      return transaction(async (db) => {
        const result = await db.runAsync(
          `UPDATE sync_snapshot_staging SET status = 'failed', updated_at = ?
           WHERE owner_id = ? AND snapshot_id = ? AND status = 'building'`, now(), ownerId, snapshotId,
        );
        return result.changes === 1;
      });
    },

    /** Reopens only a failed staging attempt; previously written pages remain intact. */
    async resumeSnapshotStaging(snapshotId: string): Promise<boolean> {
      if (!SNAPSHOT_UUID.test(snapshotId)) throw new RangeError('SNAPSHOT_INVALID');
      return transaction(async (db) => {
        const result = await db.runAsync(
          `UPDATE sync_snapshot_staging SET status = 'building', updated_at = ?
           WHERE owner_id = ? AND snapshot_id = ? AND status = 'failed'`, now(), ownerId, snapshotId,
        );
        return result.changes === 1;
      });
    },

    /** Persists a validated snapshot as staging data and records interruption for retry. */
    async stageValidatedSnapshot(input: {
      ownerId: string;
      snapshotId: string;
      highWater: string;
      pageCount: number;
      manifestDigest: string;
      resumeCursor: string | null;
      pages: LocalSnapshotStagingPage[];
    }): Promise<{ snapshotId: string; status: 'ready'; pageCount: number }> {
      if (accountOwnerId(input.ownerId) !== ownerId || input.snapshotId.length === 0) throw new RangeError('SNAPSHOT_OWNER_INVALID');
      validateSnapshotMetadata(input);
      if (input.pages.length !== input.pageCount) throw new RangeError('SNAPSHOT_INCOMPLETE');
      await this.beginSnapshotStaging({
        snapshotId: input.snapshotId, highWater: input.highWater, pageCount: input.pageCount,
        manifestDigest: input.manifestDigest, resumeCursor: input.resumeCursor,
      });
      try {
        for (const page of input.pages) await this.stageSnapshotPage(page);
        await this.finalizeSnapshotStaging(input.snapshotId);
      } catch (error) {
        await this.failSnapshotStaging(input.snapshotId).catch(() => undefined);
        throw error;
      }
      return { snapshotId: input.snapshotId, status: 'ready', pageCount: input.pageCount };
    },

    /** Maps already validated mirror pages into the owner-scoped staging schema. */
    async stageValidatedMirrorSnapshot(input: {
      ownerId: string;
      snapshotId: string;
      highWater: string;
      resumeCursor: string;
      pages: LocalMirrorSnapshotPage[];
    }): Promise<{ snapshotId: string; status: 'ready'; pageCount: number }> {
      if (input.pages.length === 0) throw new RangeError('SNAPSHOT_INCOMPLETE');
      const pageCount = input.pages[0].pageCount;
      const manifestDigest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        canonicalJson({ snapshotId: input.snapshotId, highWater: input.highWater, pages: input.pages.map((page) => ({ pageIndex: page.pageIndex, pageDigest: page.pageDigest })) }),
      );
      return this.stageValidatedSnapshot({
        ownerId: input.ownerId, snapshotId: input.snapshotId, highWater: input.highWater,
        pageCount, manifestDigest, resumeCursor: input.resumeCursor,
        pages: input.pages.map((page) => ({ ...page, payload: page.data })),
      });
    },

    /**
     * Atomically replaces only the account's remote mirror. Local domain rows,
     * pending outbox mutations and recovery overlays are deliberately untouched.
     */
    async applySnapshotAtomically(input: {
      ownerId: string;
      snapshotId: string;
      highWater: string;
      resumeCursor: string;
      entities: LocalRemoteMirrorEntity[];
      preserveOutbox: true;
      preserveLocalOverlay: true;
    }): Promise<void> {
      if (input.ownerId !== ownerId || !input.ownerId.startsWith('account:')) throw new RangeError('SNAPSHOT_OWNER_INVALID');
      if (!SNAPSHOT_UUID.test(input.snapshotId) || !DECIMAL_COUNTER.test(input.highWater)
        || !SNAPSHOT_CURSOR.test(input.resumeCursor) || !Array.isArray(input.entities)) {
        throw new RangeError('SNAPSHOT_INVALID');
      }
      if (input.preserveOutbox !== true || input.preserveLocalOverlay !== true) throw new RangeError('SNAPSHOT_PRESERVATION_REQUIRED');
      const identities = new Set<string>();
      for (const entity of input.entities) {
        validateRemoteMirrorEntity(entity);
        const identity = `${entity.entity}:${entity.entityId}`;
        if (identities.has(identity)) throw new RangeError('SNAPSHOT_DUPLICATE_ENTITY');
        identities.add(identity);
      }
      await transaction(async (db) => {
        await db.runAsync('DELETE FROM sync_remote_entities WHERE owner_id = ?', ownerId);
        for (const entity of input.entities) {
          await db.runAsync(
            `INSERT INTO sync_remote_entities
               (owner_id,entity_kind,entity_id,version,operation,payload_json,snapshot_id,updated_at)
             VALUES (?,?,?,?,?,?,?,?)`,
            ownerId, entity.entity, entity.entityId, entity.version, entity.operation,
            entity.payload === null ? null : canonicalJson(entity.payload), input.snapshotId, now(),
          );
        }
        await db.runAsync(
          `INSERT INTO sync_remote_cursors (owner_id,snapshot_id,high_water,resume_cursor,updated_at)
           VALUES (?,?,?,?,?)
           ON CONFLICT(owner_id) DO UPDATE SET snapshot_id=excluded.snapshot_id,
             high_water=excluded.high_water,resume_cursor=excluded.resume_cursor,updated_at=excluded.updated_at`,
          ownerId, input.snapshotId, input.highWater, input.resumeCursor, now(),
        );
        await db.runAsync(
          `INSERT INTO sync_remote_pull_cursors (owner_id,next_cursor,last_sequence,updated_at)
           VALUES (?,?,?,?)
           ON CONFLICT(owner_id) DO UPDATE SET next_cursor=excluded.next_cursor,
             last_sequence=excluded.last_sequence,updated_at=excluded.updated_at`,
          ownerId, input.resumeCursor, input.highWater, now(),
        );
      });
    },

    async loadRemoteMirror(): Promise<{ cursor: LocalRemoteMirrorCursor | null; entities: LocalRemoteMirrorEntity[] }> {
      return serialize(async () => {
        const db = await database();
        const cursor = await db.getFirstAsync<{ snapshot_id: string; high_water: string; resume_cursor: string }>(
          'SELECT snapshot_id,high_water,resume_cursor FROM sync_remote_cursors WHERE owner_id = ?', ownerId,
        );
        const rows = await db.getAllAsync<{
          entity_kind: LocalRemoteMirrorEntity['entity']; entity_id: string; version: number;
          operation: LocalRemoteMirrorEntity['operation']; payload_json: string | null;
        }>(
          'SELECT entity_kind,entity_id,version,operation,payload_json FROM sync_remote_entities WHERE owner_id = ? ORDER BY entity_kind,entity_id', ownerId,
        );
        return {
          cursor: cursor ? { snapshotId: cursor.snapshot_id, highWater: cursor.high_water, resumeCursor: cursor.resume_cursor } : null,
          entities: rows.map((row) => {
            let payload: unknown = null;
            if (row.payload_json !== null) {
              try { payload = JSON.parse(row.payload_json); } catch { throw new Error('SNAPSHOT_DATA_UNAVAILABLE'); }
              if (!isObject(payload)) throw new Error('SNAPSHOT_DATA_UNAVAILABLE');
            }
            const entity = { entity: row.entity_kind, entityId: row.entity_id, version: row.version, operation: row.operation, payload } as LocalRemoteMirrorEntity;
            validateRemoteMirrorEntity(entity);
            return entity;
          }),
        };
      });
    },

    /** Applies one validated pull page with durable replay receipts and cursor. */
    async applySyncPageAtomically(input: {
      ownerId: string;
      nextCursor: string;
      changes: LocalIncrementalSyncChange[];
    }): Promise<{ applied: number; replayed: number; nextCursor: string }> {
      if (input.ownerId !== ownerId || !input.ownerId.startsWith('account:')) throw new RangeError('SYNC_OWNER_INVALID');
      if (!SNAPSHOT_CURSOR.test(input.nextCursor) || !Array.isArray(input.changes) || input.changes.length > 100) {
        throw new RangeError('SYNC_PAGE_INVALID');
      }
      const seenSequences = new Set<string>();
      for (let index = 0; index < input.changes.length; index += 1) {
        const change = input.changes[index];
        validateIncrementalChange(change);
        if (seenSequences.has(change.sequence)) throw new RangeError('SYNC_PAGE_DUPLICATE');
        if (index > 0 && compareDecimal(input.changes[index - 1].sequence, change.sequence) >= 0) {
          throw new RangeError('SYNC_SEQUENCE_ORDER_INVALID');
        }
        seenSequences.add(change.sequence);
      }
      const hashed = await Promise.all(input.changes.map(async (change) => ({
        change,
        hash: await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          canonicalJson({ sequence: change.sequence, entityKind: change.entityKind, entityId: change.entityId, operation: change.operation, payload: change.operation === 'delete' ? null : change.payload }),
        ),
      })));
      return transaction(async (db) => {
        const state = await db.getFirstAsync<{ last_sequence: string }>(
          'SELECT last_sequence FROM sync_remote_pull_cursors WHERE owner_id = ?', ownerId,
        );
        const hasAppliedReceipt = Boolean(await db.getFirstAsync<{ owner_id: string }>(
          'SELECT owner_id FROM sync_remote_change_receipts WHERE owner_id = ? LIMIT 1', ownerId,
        ));
        let lastSequence = state?.last_sequence ?? '0';
        let applied = 0;
        let replayed = 0;
        for (const item of hashed) {
          const existing = await db.getFirstAsync<{ change_hash: string }>(
            'SELECT change_hash FROM sync_remote_change_receipts WHERE owner_id = ? AND sequence = ?', ownerId, item.change.sequence,
          );
          if (existing) {
            if (existing.change_hash !== item.hash) throw new Error('SYNC_REPLAY_CONFLICT');
            replayed += 1;
            continue;
          }
          if (hasAppliedReceipt && compareDecimal(item.change.sequence, lastSequence) <= 0) throw new Error('SYNC_SEQUENCE_ORDER_INVALID');
          await db.runAsync(
            `INSERT INTO sync_remote_change_receipts
               (owner_id,sequence,change_hash,entity_kind,entity_id,operation,created_at)
             VALUES (?,?,?,?,?,?,?)`,
            ownerId, item.change.sequence, item.hash, item.change.entityKind, item.change.entityId,
            item.change.operation, now(),
          );
          await db.runAsync(
            `INSERT INTO sync_remote_entities
               (owner_id,entity_kind,entity_id,version,operation,payload_json,snapshot_id,updated_at)
             VALUES (?,?,?,?,?,?,?,?)
             ON CONFLICT(owner_id,entity_kind,entity_id) DO UPDATE SET
               version=excluded.version,operation=excluded.operation,payload_json=excluded.payload_json,
               snapshot_id=excluded.snapshot_id,updated_at=excluded.updated_at`,
            ownerId, item.change.entityKind, item.change.entityId, 1, item.change.operation,
            item.change.operation === 'delete' ? null : canonicalJson(item.change.payload), `pull:${item.change.sequence}`, now(),
          );
          if (item.change.entityKind === 'settings' && item.change.operation === 'upsert') {
            if (!item.change.payload || !isObject(item.change.payload)) throw new Error('SYNC_SETTINGS_INVALID');
            await materializeRemoteSettings(db, ownerId, item.change.entityId, item.change.payload);
          }
          lastSequence = item.change.sequence;
          applied += 1;
        }
        await db.runAsync(
          `INSERT INTO sync_remote_pull_cursors (owner_id,next_cursor,last_sequence,updated_at)
           VALUES (?,?,?,?)
           ON CONFLICT(owner_id) DO UPDATE SET next_cursor=excluded.next_cursor,
             last_sequence=excluded.last_sequence,updated_at=excluded.updated_at`,
          ownerId, input.nextCursor, lastSequence, now(),
        );
        return { applied, replayed, nextCursor: input.nextCursor };
      });
    },

    async loadRemotePullState(): Promise<{ nextCursor: string; lastSequence: string } | null> {
      return serialize(async () => {
        const db = await database();
        const row = await db.getFirstAsync<{ next_cursor: string; last_sequence: string }>(
          'SELECT next_cursor,last_sequence FROM sync_remote_pull_cursors WHERE owner_id = ?', ownerId,
        );
        return row ? { nextCursor: row.next_cursor, lastSequence: row.last_sequence } : null;
      });
    },

    /** Clears only remote cursor/receipt state before a fresh snapshot bootstrap. */
    async resetRemotePullForSnapshot(inputOwnerId: string): Promise<void> {
      if (inputOwnerId !== ownerId || !inputOwnerId.startsWith('account:')) throw new RangeError('SYNC_OWNER_INVALID');
      await transaction(async (db) => {
        await db.runAsync('DELETE FROM sync_remote_change_receipts WHERE owner_id = ?', ownerId);
        await db.runAsync('DELETE FROM sync_remote_pull_cursors WHERE owner_id = ?', ownerId);
        await db.runAsync('DELETE FROM sync_remote_cursors WHERE owner_id = ?', ownerId);
      });
    },

    async loadPendingOutbox(): Promise<LocalOutboxMutation[]> {
      return serialize(async () => {
        const db = await database();
        const rows = await db.getAllAsync<Parameters<typeof outboxFromRow>[0]>(
          "SELECT mutation_id,command,entity_type,target_id,base_version,payload_schema_version,payload_json,payload_hash,client_created_at,attempt_count,next_attempt_at,state,last_error_code FROM local_outbox WHERE owner_id = ? AND state IN ('pending','in_flight') ORDER BY client_created_at,mutation_id",
          ownerId,
        );
        return rows.map(outboxFromRow);
      });
    },

    async recordOutboxAttempt(mutationId: string, nextAttemptAt: string, errorCode: string | null = null) {
      if (!mutationId || !validTimestamp(nextAttemptAt) || (errorCode !== null && (typeof errorCode !== 'string' || errorCode.length > 120))) {
        throw new RangeError('INVALID_OUTBOX_ATTEMPT');
      }
      await transaction(async (db) => {
        await db.runAsync(
          "UPDATE local_outbox SET attempt_count = attempt_count + 1, next_attempt_at = ?, last_error_code = ?, state = 'pending' WHERE owner_id = ? AND mutation_id = ? AND state IN ('pending','in_flight')",
          nextAttemptAt, errorCode, ownerId, mutationId,
        );
      });
    },

    async rejectOutbox(mutationId: string, errorCode: string) {
      if (!mutationId || typeof errorCode !== 'string' || !/^[A-Z][A-Z0-9_]{0,79}$/.test(errorCode)) {
        throw new RangeError('INVALID_OUTBOX_REJECTION');
      }
      await transaction(async (db) => {
        await db.runAsync(
          "UPDATE local_outbox SET attempt_count = attempt_count + 1, last_error_code = ?, state = 'rejected' WHERE owner_id = ? AND mutation_id = ? AND state IN ('pending','in_flight')",
          errorCode, ownerId, mutationId,
        );
      });
    },

    async acknowledgeOutbox(mutationId: string) {
      if (!mutationId) throw new RangeError('INVALID_OUTBOX_MUTATION_ID');
      await transaction(async (db) => {
        await db.runAsync('DELETE FROM local_outbox WHERE owner_id = ? AND mutation_id = ?', ownerId, mutationId);
      });
    },

    async loadSessionHistory(): Promise<FocusSession[]> {
      return serialize(async () => {
      const db = await database();
      const rows = await db.getAllAsync<SessionRow & { task_id: string | null }>(`SELECT * FROM focus_sessions WHERE owner_id = ? AND status IN ('completed','cancelled') ORDER BY COALESCE(completed_at,cancelled_at) DESC,id`, ownerId);
      return rows.map((row) => sessionFromRow(row, row.task_id));
      });
    },

    async loadAssessment(assessmentId: string): Promise<AssessmentAttempt | null> {
      if (typeof assessmentId !== 'string' || !assessmentId.trim() || assessmentId.length > 120) throw new RangeError('INVALID_ASSESSMENT_ID');
      return serialize(async () => {
        const db = await database();
        const row = await db.getFirstAsync<AssessmentRow>('SELECT * FROM assessments WHERE owner_id = ? AND id = ?', ownerId, assessmentId);
        if (!row) return null;
        const answers = await db.getAllAsync<AssessmentAnswerRow>('SELECT question_id,value_json FROM assessment_answers WHERE owner_id = ? AND assessment_id = ? ORDER BY question_id', ownerId, assessmentId);
        return assessmentFromRows(row, answers);
      });
    },

    async saveAssessmentDraft(
      draft: { id: string; version: string; startedAt: string; answers: Record<string, AssessmentAnswerValue> },
      expectedUpdatedAt: string | null,
    ): Promise<string | null> {
      if (!draft || typeof draft.id !== 'string' || !draft.id.trim() || draft.id.length > 120
        || typeof draft.version !== 'string' || !draft.version.trim() || draft.version.length > 40
        || !validTimestamp(draft.startedAt) || !isObject(draft.answers)
        || (expectedUpdatedAt !== null && !validTimestamp(expectedUpdatedAt))) {
        throw new RangeError('INVALID_ASSESSMENT_DRAFT');
      }
      const entries = Object.entries(draft.answers);
      if (entries.length > 100) throw new RangeError('INVALID_ASSESSMENT_DRAFT: too many answers');
      const encodedAnswers = entries.map(([questionId, value]) => {
        if (!questionId.trim() || questionId.length > 120) throw new RangeError('INVALID_ASSESSMENT_QUESTION_ID');
        const encoded = assessmentAnswerJson(value);
        return { questionId, encoded, id: `${draft.id.length}:${draft.id}${questionId.length}:${questionId}` };
      });
      return transaction(async (db) => {
        const existing = await db.getFirstAsync<AssessmentRow>(
          'SELECT * FROM assessments WHERE owner_id = ? AND id = ?', ownerId, draft.id,
        );
        if (expectedUpdatedAt === null) {
          if (existing) return null;
        } else if (!existing || existing.status !== 'in_progress' || existing.updated_at !== expectedUpdatedAt
          || existing.version !== draft.version || existing.started_at !== draft.startedAt) return null;

        const currentTime = now();
        if (!validTimestamp(currentTime)) throw new RangeError('INVALID_CLOCK: assessment timestamp is invalid');
        const updatedAt = existing
          ? nextRevisionTimestamp(existing.updated_at, currentTime)
          : new Date(Math.max(Date.parse(draft.startedAt), Date.parse(currentTime))).toISOString();
        if (existing) {
          await db.runAsync('UPDATE assessments SET updated_at = ? WHERE owner_id = ? AND id = ? AND updated_at = ? AND status = \'in_progress\'', updatedAt, ownerId, draft.id, expectedUpdatedAt);
          if (encodedAnswers.length) {
            const placeholders = encodedAnswers.map(() => '?').join(',');
            await db.runAsync(`DELETE FROM assessment_answers WHERE owner_id = ? AND assessment_id = ? AND question_id NOT IN (${placeholders})`, ownerId, draft.id, ...encodedAnswers.map(({ questionId }) => questionId));
          } else {
            await db.runAsync('DELETE FROM assessment_answers WHERE owner_id = ? AND assessment_id = ?', ownerId, draft.id);
          }
        } else {
          await db.runAsync('INSERT INTO assessments (owner_id,id,version,status,result_json,started_at,completed_at,created_at,updated_at) VALUES (?,?,?,\'in_progress\',NULL,?,NULL,?,?)', ownerId, draft.id, draft.version, draft.startedAt, currentTime, updatedAt);
        }
        for (const answer of encodedAnswers) {
          await db.runAsync(`INSERT INTO assessment_answers (owner_id,assessment_id,id,question_id,value_json,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?) ON CONFLICT(owner_id,assessment_id,question_id) DO UPDATE SET
            id=excluded.id,value_json=excluded.value_json,updated_at=excluded.updated_at`, ownerId, draft.id, answer.id, answer.questionId, answer.encoded, updatedAt, updatedAt);
        }
        return updatedAt;
      });
    },

    async cancelAssessment(assessmentId: string, expectedUpdatedAt: string | null): Promise<boolean> {
      if (typeof assessmentId !== 'string' || !assessmentId.trim() || assessmentId.length > 120
        || (expectedUpdatedAt !== null && !validTimestamp(expectedUpdatedAt))) {
        throw new RangeError('INVALID_ASSESSMENT_CANCEL');
      }
      return transaction(async (db) => {
        const current = await db.getFirstAsync<AssessmentRow>(
          'SELECT * FROM assessments WHERE owner_id = ? AND id = ?', ownerId, assessmentId,
        );
        if (!current || current.status !== 'in_progress') return false;
        if (expectedUpdatedAt !== null && current.updated_at !== expectedUpdatedAt) return false;
        const cancelledAt = now();
        if (!validTimestamp(cancelledAt)) throw new RangeError('INVALID_CLOCK: assessment timestamp is invalid');
        const result = await db.runAsync(
          'UPDATE assessments SET status = \'cancelled\', updated_at = ? WHERE owner_id = ? AND id = ? AND status = \'in_progress\' AND updated_at = ?',
          cancelledAt, ownerId, assessmentId, current.updated_at,
        );
        return result.changes === 1;
      });
    },

    async loadSettings(): Promise<AppSettings> {
      return serialize(async () => {
      const db = await database();
      const row = await db.getFirstAsync<{ default_focus_duration_minutes: 25 | 45 | 60; default_break_duration_minutes: 5 | 10 | 15; ui_locale: AppSettings['uiLocale'] }>('SELECT default_focus_duration_minutes,default_break_duration_minutes,ui_locale FROM user_settings WHERE owner_id = ?', ownerId);
      return { defaultFocusDurationMinutes: row?.default_focus_duration_minutes ?? 25, defaultBreakDurationMinutes: row?.default_break_duration_minutes ?? 5, uiLocale: row?.ui_locale ?? 'en' };
      });
    },

    async saveSettings(settings: AppSettings) {
      if (!isAppSettings(settings as unknown as Record<string, unknown>)) throw new RangeError('INVALID_INPUT: unsupported settings value');
      await transaction(async (db) => {
        await db.runAsync('INSERT INTO user_settings (owner_id,default_focus_duration_minutes,default_break_duration_minutes,ui_locale) VALUES (?,?,?,?) ON CONFLICT(owner_id) DO UPDATE SET default_focus_duration_minutes=excluded.default_focus_duration_minutes, default_break_duration_minutes=excluded.default_break_duration_minutes, ui_locale=excluded.ui_locale', ownerId, settings.defaultFocusDurationMinutes, settings.defaultBreakDurationMinutes, settings.uiLocale);
      });
    },
  };
}

async function persistTerminalInTransaction(db: SQLite.SQLiteDatabase, session: FocusSession, now: string, clearPointer: boolean, ownerId = LOCAL_OWNER_ID) {
  const existing = await db.getFirstAsync<SessionRow>('SELECT * FROM focus_sessions WHERE owner_id = ? AND id = ?', ownerId, session.id);
  if (!existing) await insertSession(db, session, now, ownerId);
  else if (existing.status === 'completed' || existing.status === 'cancelled') {
    const current = sessionFromRow(existing);
    if (canonicalJson(current) !== canonicalJson(session)) throw new Error('Conflicting terminal history record');
  } else {
    const pointer = await db.getFirstAsync<{ session_id: string }>('SELECT session_id FROM active_focus_sessions WHERE owner_id = ?', ownerId);
    if (pointer?.session_id !== session.id) throw new Error('ACTIVE_SESSION_CONFLICT: terminal command does not own the active pointer');
    await db.runAsync(`UPDATE focus_sessions SET task_id=?,task_name=?,status=?,planned_duration_seconds=?,focused_duration_seconds=?,paused_duration_seconds=?,started_at=?,completed_at=?,cancelled_at=?,last_paused_at=?,last_resumed_at=?,updated_at=?,legacy_extra_json=? WHERE owner_id=? AND id=?`, ...sessionUpdateValues(session, now, ownerId), ownerId, session.id);
  }
  const payload = canonicalJson(session);
  const payloadHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, payload);
  const mutationId = `terminal:${session.id}`;
  const queued = await db.getFirstAsync<{ payload_hash: string; payload_json: string }>(
    'SELECT payload_hash,payload_json FROM local_outbox WHERE owner_id = ? AND mutation_id = ?', ownerId, mutationId,
  );
  if (queued && (queued.payload_hash !== payloadHash || queued.payload_json !== payload)) {
    throw new Error('OUTBOX_MUTATION_CONFLICT: terminal retry payload changed');
  }
  if (!queued) {
    await db.runAsync(
      "INSERT INTO local_outbox (owner_id,mutation_id,command,entity_type,target_id,base_version,payload_schema_version,payload_json,payload_hash,client_created_at,next_attempt_at,state,last_error_code) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      ownerId, mutationId, 'session.terminal', 'focus_session', session.id, null, 1, payload, payloadHash, now, now, 'pending', null,
    );
  }
  if (clearPointer) await db.runAsync('DELETE FROM active_focus_sessions WHERE owner_id = ? AND session_id = ?', ownerId, session.id);
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

async function reconcileGoalLifecycleInTransaction(db: SQLite.SQLiteDatabase, ownerId: string, asOf: string): Promise<void> {
  if (!validTimestamp(asOf)) throw new RangeError('INVALID_INPUT: valid lifecycle timestamp required');
  const goalRows = await db.getAllAsync<GoalRow>(
    "SELECT * FROM goals WHERE owner_id = ? AND status IN ('active','expired') ORDER BY id", ownerId,
  );
  if (goalRows.length === 0) return;
  const sessionRows = await db.getAllAsync<SessionRow & { task_id: string | null }>(
    "SELECT * FROM focus_sessions WHERE owner_id = ? AND status IN ('completed','cancelled') ORDER BY id", ownerId,
  );
  const sessions = sessionRows.map((row) => sessionFromRow(row, row.task_id));
  for (const row of goalRows) {
    const goal = goalFromRow(row);
    const completedAt = getGoalCompletionAt(goal, sessions);
    const nextStatus = completedAt ? 'completed' : goal.status === 'active' && !goal.legacyOpenPeriod && Date.parse(goal.endsAt!) <= Date.parse(asOf) ? 'expired' : goal.status;
    if (nextStatus === goal.status) continue;
    const updatedAt = nextRevisionTimestamp(goal.updatedAt, completedAt ?? asOf);
    await db.runAsync(
      `UPDATE goals SET status = ?, completed_at = ?, updated_at = ?
       WHERE owner_id = ? AND id = ? AND updated_at = ? AND status = ?`,
      nextStatus, completedAt, updatedAt, ownerId, goal.id, goal.updatedAt, goal.status,
    );
  }
}

const storeDependencies: Omit<LocalDatabaseDependencies, 'ownerId' | 'ownerKind'> = {
  platform: Platform.OS,
  openDatabase: () => SQLite.openDatabaseAsync(DATABASE_NAME, { useNewConnection: true }),
  readLegacyFiles,
};

const deviceLocalStore = createLocalDatabaseStore(storeDependencies);
const owners = createLocalOwnerRegistry(deviceLocalStore, (authenticatedUserId) =>
  createAccountLocalDatabaseStore(authenticatedUserId, storeDependencies));

/** Selects the namespace for a UUID obtained from the verified Supabase Auth session. */
export function activateAccountLocalStore(authenticatedUserId: string): void {
  accountOwnerId(authenticatedUserId);
  owners.useAccount(authenticatedUserId);
}

/** Returns storage routing to the retained device-local namespace after sign-out. */
export function activateDeviceLocalStore(): void {
  owners.useDeviceLocal();
}

export const loadTasks = (...args: Parameters<typeof deviceLocalStore.loadTasks>) => owners.current().loadTasks(...args);
export const loadResources = (...args: Parameters<typeof deviceLocalStore.loadResources>) => owners.current().loadResources(...args);
export const loadTeacherAssignmentDrafts = (...args: Parameters<typeof deviceLocalStore.loadTeacherAssignmentDrafts>) => owners.current().loadTeacherAssignmentDrafts(...args);
export const saveTeacherAssignmentDraft = (...args: Parameters<typeof deviceLocalStore.saveTeacherAssignmentDraft>) => owners.current().saveTeacherAssignmentDraft(...args);
export const saveResource = (...args: Parameters<typeof deviceLocalStore.saveResource>) => owners.current().saveResource(...args);
export const markResourceMissing = (...args: Parameters<typeof deviceLocalStore.markResourceMissing>) => owners.current().markResourceMissing(...args);
export const loadTaskResourceLinks = (...args: Parameters<typeof deviceLocalStore.loadTaskResourceLinks>) => owners.current().loadTaskResourceLinks(...args);
export const linkResourceToTask = (...args: Parameters<typeof deviceLocalStore.linkResourceToTask>) => owners.current().linkResourceToTask(...args);
export const unlinkResourceFromTask = (...args: Parameters<typeof deviceLocalStore.unlinkResourceFromTask>) => owners.current().unlinkResourceFromTask(...args);
export const saveConfirmedPlan = (...args: Parameters<typeof deviceLocalStore.saveConfirmedPlan>) => owners.current().saveConfirmedPlan(...args);
export const loadActivePlan = (...args: Parameters<typeof deviceLocalStore.loadActivePlan>) => owners.current().loadActivePlan(...args);
export const cancelActivePlan = (...args: Parameters<typeof deviceLocalStore.cancelActivePlan>) => owners.current().cancelActivePlan(...args);
export const saveTasks = (...args: Parameters<typeof deviceLocalStore.saveTasks>) => owners.current().saveTasks(...args);
export const updateTaskTitle = (...args: Parameters<typeof deviceLocalStore.updateTaskTitle>) => owners.current().updateTaskTitle(...args);
export const updateTaskDetails = (...args: Parameters<typeof deviceLocalStore.updateTaskDetails>) => owners.current().updateTaskDetails(...args);
export const updateTaskArchive = (...args: Parameters<typeof deviceLocalStore.updateTaskArchive>) => owners.current().updateTaskArchive(...args);
export const deleteTask = (...args: Parameters<typeof deviceLocalStore.deleteTask>) => owners.current().deleteTask(...args);
export const loadGoals = (...args: Parameters<typeof deviceLocalStore.loadGoals>) => owners.current().loadGoals(...args);
export const saveGoals = (...args: Parameters<typeof deviceLocalStore.saveGoals>) => owners.current().saveGoals(...args);
export const updateGoalDefinition = (...args: Parameters<typeof deviceLocalStore.updateGoalDefinition>) => owners.current().updateGoalDefinition(...args);
export const deleteGoal = (...args: Parameters<typeof deviceLocalStore.deleteGoal>) => owners.current().deleteGoal(...args);
export const loadActiveSession = (...args: Parameters<typeof deviceLocalStore.loadActiveSession>) => owners.current().loadActiveSession(...args);
export const saveActiveSession = (...args: Parameters<typeof deviceLocalStore.saveActiveSession>) => owners.current().saveActiveSession(...args);
export const clearActiveSession = (...args: Parameters<typeof deviceLocalStore.clearActiveSession>) => owners.current().clearActiveSession(...args);
export const appendSessionHistory = (...args: Parameters<typeof deviceLocalStore.appendSessionHistory>) => owners.current().appendSessionHistory(...args);
export const persistTerminalSession = (...args: Parameters<typeof deviceLocalStore.persistTerminalSession>) => owners.current().persistTerminalSession(...args);
export const beginSnapshotStaging = (...args: Parameters<typeof deviceLocalStore.beginSnapshotStaging>) => owners.current().beginSnapshotStaging(...args);
export const stageSnapshotPage = (...args: Parameters<typeof deviceLocalStore.stageSnapshotPage>) => owners.current().stageSnapshotPage(...args);
export const loadSnapshotStaging = (...args: Parameters<typeof deviceLocalStore.loadSnapshotStaging>) => owners.current().loadSnapshotStaging(...args);
export const finalizeSnapshotStaging = (...args: Parameters<typeof deviceLocalStore.finalizeSnapshotStaging>) => owners.current().finalizeSnapshotStaging(...args);
export const failSnapshotStaging = (...args: Parameters<typeof deviceLocalStore.failSnapshotStaging>) => owners.current().failSnapshotStaging(...args);
export const resumeSnapshotStaging = (...args: Parameters<typeof deviceLocalStore.resumeSnapshotStaging>) => owners.current().resumeSnapshotStaging(...args);
export const stageValidatedSnapshot = (...args: Parameters<typeof deviceLocalStore.stageValidatedSnapshot>) => owners.current().stageValidatedSnapshot(...args);
export const stageValidatedMirrorSnapshot = (...args: Parameters<typeof deviceLocalStore.stageValidatedMirrorSnapshot>) => owners.current().stageValidatedMirrorSnapshot(...args);
export const applySnapshotAtomically = (...args: Parameters<typeof deviceLocalStore.applySnapshotAtomically>) => owners.current().applySnapshotAtomically(...args);
export const loadRemoteMirror = (...args: Parameters<typeof deviceLocalStore.loadRemoteMirror>) => owners.current().loadRemoteMirror(...args);
export const applySyncPageAtomically = (...args: Parameters<typeof deviceLocalStore.applySyncPageAtomically>) => owners.current().applySyncPageAtomically(...args);
export const loadRemotePullState = (...args: Parameters<typeof deviceLocalStore.loadRemotePullState>) => owners.current().loadRemotePullState(...args);
export const resetRemotePullForSnapshot = (...args: Parameters<typeof deviceLocalStore.resetRemotePullForSnapshot>) => owners.current().resetRemotePullForSnapshot(...args);
export const loadPendingOutbox = (...args: Parameters<typeof deviceLocalStore.loadPendingOutbox>) => owners.current().loadPendingOutbox(...args);
export const recordOutboxAttempt = (...args: Parameters<typeof deviceLocalStore.recordOutboxAttempt>) => owners.current().recordOutboxAttempt(...args);
export const rejectOutbox = (...args: Parameters<typeof deviceLocalStore.rejectOutbox>) => owners.current().rejectOutbox(...args);
export const acknowledgeOutbox = (...args: Parameters<typeof deviceLocalStore.acknowledgeOutbox>) => owners.current().acknowledgeOutbox(...args);
export const loadSessionHistory = (...args: Parameters<typeof deviceLocalStore.loadSessionHistory>) => owners.current().loadSessionHistory(...args);
export const loadAssessment = (...args: Parameters<typeof deviceLocalStore.loadAssessment>) => owners.current().loadAssessment(...args);
export const saveAssessmentDraft = (...args: Parameters<typeof deviceLocalStore.saveAssessmentDraft>) => owners.current().saveAssessmentDraft(...args);
export const cancelAssessment = (...args: Parameters<typeof deviceLocalStore.cancelAssessment>) => owners.current().cancelAssessment(...args);
export const loadSettings = (...args: Parameters<typeof deviceLocalStore.loadSettings>) => owners.current().loadSettings(...args);
export const saveSettings = (...args: Parameters<typeof deviceLocalStore.saveSettings>) => owners.current().saveSettings(...args);
