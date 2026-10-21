# Focus-session task identity link — 2026-10-07

```text
TASK: L-07A — persist a verified task identity with focus sessions
STATE: IMPLEMENTED candidate; HIGH risk; REVIEW_PENDING
OUTCOME: task-originated focus links to the stored task by stable ID, not title text
AUTHORITY: V1 implementation plan §§15–16; DATA_MODEL.md §4; existing SQLite
           task_id column/composite owner foreign key; current owner-scoped task store
RISK: HIGH — persisted relationship integrity and account-local ownership
NON-GOALS: new schema/version migration, task lifecycle/reward changes, cloud sync,
           title/route-input trust, production data
ACCEPTANCE: task detail and Plan My Day pass only stored task IDs; setup/session
            re-resolve an active task under the current local owner; snapshot title
            comes from the stored row; unavailable tasks start no timer; active and
            terminal session persistence preserves taskId; foreign-owner references
            fail at SQLite's composite FK boundary
```

Implementation adds optional `taskId` to `FocusSession` without changing the
existing seconds representation or timer-engine return semantics. Task detail and
Plan My Day pass the ID, not a route title. Focus setup reads the current owner's
task and displays its stored title; the session hook resolves it again before
creating the timer, so an invalid, completed or removed task does not begin a
session or write a record. Existing standalone sessions continue to use an
optional user-entered title. SQLite already stores `task_id` and constrains it by
`(owner_id, task_id)`; the existing schema was not changed. `taskId` is excluded
from legacy-extra JSON once normalized into that column.

Checks run:

- `node --test --test-reporter=tap tests/components/task-detail.test.mjs tests/domain/local-database-ownership.test.mjs tests/domain/session-boundaries.test.mjs` — 34/34 pass. This includes real Node SQLite owner-FK checks and the source-level hook harness; it is not Expo SQLite native/device evidence.
- Root `node node_modules/typescript/bin/tsc --noEmit` — pass after implementation.
- Direct ESLint for changed source and test files — pass after implementation.
- Android/iOS UI lifecycle and installed-app navigation — `NOT_RUN`.

**Review gate:** do not mark accepted or production-ready. Independent qualified
review must examine the local SQLite adapter, owner switching, migration/import
and task/session FK behavior; Android verification is also pending. Account
namespace integration remains coupled to the separate HIGH-risk auth candidate.
No commit, push, cloud schema or production data action was performed.
