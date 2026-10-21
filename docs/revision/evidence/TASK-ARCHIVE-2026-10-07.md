# Reversible task archive — 2026-10-07

```text
TASK: V1 Tasks lifecycle / reversible archive and restore
STATE: IMPLEMENTED; REVIEW_PENDING for persisted lifecycle/ownership review and device verification
DELIVERABLE: archive/restore service, task-list visibility, detail controls and regression evidence
REQUIREMENT / PHASE: V1 Phase 4 Tasks/Goals; Build Guide §4. Archive preserves session history and stable task identity.
APPROVALS: Approved V1 Tasks lifecycle and SQLite ownership boundary; implement non-destructive archive as a reversible state. Existing local schema extension storage is used without changing table layout.
RISK / REASON: HIGH — persisted owner-scoped task lifecycle and references, though the record is reversible and no schema migration is introduced.
REVIEW GATE: self-review complete; independent storage/ownership review pending; Android/iOS accessibility verification NOT_RUN.
READ: docs/AI_RULES.md; docs/ai/AI_EXECUTION_POLICY.md; docs/ai/DEFINITION_OF_DONE.md; docs/ai/ENGINEERING_GUARDRAILS.md; docs/TESTING_STRATEGY.md; docs/DOCUMENTATION_MAP.md; docs/revision/03-PRODUCT-AND-EXPERIENCE.md §6; docs/revision/15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md; docs/DATA_MODEL.md §Task and focus-session identity/archive invariants; docs/revision/49-BUILD-ENTRY-HANDOFF-SI.md Phase 4.
INSPECT: Task type/SQLite `legacy_extra_json`, owner-routed repository, task list/detail, focus setup, Plan My Day, goal/task associations, and real-SQLite test adapter.
BASELINE: full suite 151/151 before this slice; pre-existing dirty repository preserved.
ALLOWED FILES: src/features/tasks/task-types.ts; src/features/tasks/task-storage.ts; src/features/storage/local-database.ts; src/app/tasks/index.tsx; src/app/tasks/[taskId].tsx; src/app/focus/setup.tsx; src/app/plan-my-day.tsx; tests/domain/local-database-ownership.test.mjs; tests/components/task-detail.test.mjs; tests/components/tasks.test.mjs; docs/CHANGELOG.md; this evidence file.
NON-GOALS: no permanent delete behavior change, schema migration, remote sync, new dependency, rewards, production database, or change to session history.

BEHAVIOR: Archiving writes a validated UTC `archivedAt` timestamp as a preserved task extension and advances `updatedAt`. Restore removes only that extension and advances the revision. Both operations require the caller's expected revision and current owner namespace. Active Tasks and Plan My Day exclude archived tasks; Tasks can reveal archived records; detail offers restore. Archived tasks cannot be edited, completed, linked to a new focus session or selected into Plan My Day. Existing history and goal links are not modified; archived completed tasks remain available to Progress aggregation.
PERSISTENCE: Existing `legacy_extra_json` extension field, no DDL/schema-version change. Legacy import/export fields remain preserved; typed task fields and stable IDs are unchanged.
FAILURES / EDGES: invalid archive timestamps reject; stale revision returns conflict without write; duplicate owner IDs stay isolated; write failure preserves old state; re-opened owner store retains archive state; archive/restore does not mutate existing session `task_id` or task-name snapshot.
SECURITY / PRIVACY / ACCESSIBILITY: local owner ID is derived by the existing store, never supplied by route input. Task archive state is not synced or exposed in URLs. Detail actions have explicit names; list shows a discoverable archived section and status label. Native screen reader and Android hit-target verification NOT_RUN.
ACCEPTANCE: archive is reversible; IDs/content/links survive; no stale/cross-owner write; archived items disappear from active planning and can be found/restored; actual SQLite record survives opening a fresh owner-scoped store.
VERIFICATION: focused real-SQLite + task-route commands pass; latest full `node --test` — 156/156 PASS; `node node_modules/typescript/bin/tsc --noEmit` — PASS; direct installed ESLint on affected source/tests — PASS; latest docs checker — PASS (79 markdown files, 928 local links); `git diff --check` — PASS with existing line-ending warnings. `adb` is not available, so Android device verification is NOT_RUN. Official npm lint script also remains unavailable in this shell (`npm`/`npx` absent); direct project-local ESLint was run instead.
ROLLBACK / RECOVERY: archive/restore is owner-scoped and reversible; no data deletion or schema migration. Restore is available from the archived record detail.
STOP / OPEN DECISIONS: independent review, Android/TalkBack verification and later app-wide localization review remain pending.
```
