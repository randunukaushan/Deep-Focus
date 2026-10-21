# Tasks + Goals V1 reliability — 2026-10-15

## Task brief

- **TASK:** harden V1 Tasks and Goals lifecycle, local persistence and focus
  relationships without changing V1 scope or redesigning the UI.
- **STATE:** `REVIEW_PENDING` — implemented and locally tested; independent
  review and real-device evidence are not complete.
- **REQUIREMENT / PHASE:** V1 scope §6 and implementation-plan Phase 4.
- **RISK:** HIGH. Task completion and deletion mutate persisted user data and
  related focus-session references.
- **ALLOWED FILES:** Tasks storage/routes, local SQLite repository, focused
  Tasks/Goals tests, this evidence record and changelog. No migration, remote
  deployment, dependency, provider or schema redesign.
- **NON-GOALS:** live cloud synchronization, new goal types, task-derived
  metric semantics, production data access, UI redesign, commits and deploys.

## Inspected contracts and code

- `AGENTS.md`; `docs/AI_RULES.md`; execution policy; engineering guardrails;
  Definition of Done and documentation map.
- `docs/V1_FEATURE_SCOPE.md` §6, `docs/V1_IMPLEMENTATION_PLAN.md` Phase 4,
  `docs/DATA_MODEL.md`, `docs/DATABASE_SCHEMA.md`, `docs/API_SPEC.md`,
  `docs/SECURITY.md`, and `docs/TESTING_STRATEGY.md`.
- `docs/revision/evidence/CORE-FOCUS-RELIABILITY-2026-10-15.md`.
- Tasks, Goals, Focus, Home and Plan My Day routes/services named in the task;
  local SQLite storage, ownership and focused component/domain tests.

## Verified behavior and fixes

- Task IDs and Goal IDs are stable persisted IDs. Account-local SQLite rows are
  composite-owner scoped; identical IDs in distinct accounts remain isolated.
- Task detail edits validate title, priority, optional description, goal link
  and date; the repository enforces owner-scoped foreign-key links.
- Task archive is reversible. Task deletion is transactional: it preserves
  focus-session task name and stable historical task ID while clearing the
  active foreign key. Goal deletion atomically unlinks its tasks and preserves
  focus history.
- Found and fixed a completion write race: Tasks list/detail previously rewrote
  their whole locally loaded task collection when completing one task. A stale
  view could therefore recreate a task another writer had deleted.
- Completion now uses one SQLite transaction with `(owner_id, id,
  updated_at)` optimistic revision checking. A terminal retry returns the saved
  completed task as `already_completed`; a missing/deleted task returns no
  success and is never recreated.
- New-task repository validation rejects malformed lifecycle, relationship and
  due-date values; the list composer constrains title input to the established
  120-character task-title boundary.
- Goal progress remains derived, not client-incremented. `focus_time` uses
  unique terminal focus-session IDs and verified `focusedDurationSeconds`;
  `session_count` uses completed sessions only. The established owner decision
  means a cancelled session's real focused time contributes to a focus-time
  goal, but never to a completed-session-count goal.
- The current V1 goal types are only `focus_time` and `session_count`; task
  completion is not a metric contribution source in this implementation. A
  linked task remains an organisational relationship. Adding a task-count goal
  or another task-progress rule needs an explicit product decision and is not
  inferred here.
- Goal lifecycle reconciliation derives completion deterministically from
  history; duplicate terminal session IDs are de-duplicated and conflicting
  duplicates fail closed. The shared `terminal:<sessionId>` processing boundary
  remains the durable future-consumer identity.

## Tests added or strengthened

- Added a real SQLite regression proving concurrent task completion has one
  completed winner plus a safe `already_completed` replay, preserves account
  isolation, and cannot resurrect a deleted task.
- Updated Tasks list/detail route fixtures to use the production-shaped atomic
  completion service rather than whole-list save behavior.
- Existing coverage retained for task and goal CRUD, archive/delete, linked
  task/history preservation, task-to-goal link/unlink, task-to-focus stable
  association, goal derived progress, cancelled-session exclusion from count
  goals, goal deletion rollback, legacy import and owner isolation.

## Actual checks

Run in the repository with installed Node:

```text
node --test --test-reporter=tap tests/domain/goal-progress.test.mjs tests/domain/local-database-ownership.test.mjs tests/domain/task-date.test.mjs tests/components/tasks.test.mjs tests/components/task-detail.test.mjs tests/components/goals.test.mjs tests/components/goal-detail.test.mjs tests/domain/session-boundaries.test.mjs tests/domain/completion-processing.test.mjs tests/domain/session-summary-data.test.mjs tests/components/session-summary-source.test.mjs
```

- Result: **116 passed, 0 failed, 0 skipped, 0 todo**.
- `node node_modules/typescript/bin/tsc --noEmit` — exit 0.
- `node node_modules/expo/bin/cli lint` — exit 0; Expo loaded the existing
  local environment configuration and reported no lint findings.
- `git diff --check` — exit 0.
- Node emitted the pre-existing `MODULE_TYPELESS_PACKAGE_JSON` warning while
  loading TypeScript test modules. It did not fail a test and no module-type
  change was made.

## Persistence and ownership status

- Local SQLite persistence, transactions, restart-safe legacy import, rollback
  and account-local namespaces have synthetic SQLite evidence.
- Legacy JSON is imported only into the retained device-local namespace; it is
  not claimed by an account namespace and source files are preserved.
- Local account isolation is tested with two synthetic owner IDs. This is not
  evidence of live Supabase Auth, hosted RLS or cloud synchronization.
- Cloud sync exists as a future boundary but is **not asserted as an end-to-end
  Tasks/Goals sync implementation by this evidence**.

## Remaining risks and gates

- `NOT_RUN`: Android/iOS real-device lifecycle, offline/restart storage-failure
  interaction, screen-reader/dynamic-type rendering and device navigation.
- `REVIEW_PENDING`: qualified independent review for HIGH-risk persisted
  lifecycle/ownership behavior.
- `REVIEW_PENDING`: live Supabase Auth/RLS/remote-sync authorization evidence;
  no live database, migration or deployment was used for this task.
- No `V1_FEATURE_MATRIX.md` exists in this checkout, so no status file was
  changed. Tasks/Goals are **not Release Ready**. They are a local
  **Green Candidate only after** the listed device and independent-review gates
  are completed; current status remains partial/review-pending.
