# Local assessment storage foundation — 2026-10-07

```text
TASK: V1 onboarding foundation — versioned, owner-isolated local assessment drafts
STATE: IMPLEMENTED; REVIEW_PENDING before onboarding route integration/acceptance
DELIVERABLE: SQLite schema v2, draft repository operations, migration and real-SQLite tests
REQUIREMENT / PHASE: V1 Phase 1 local data foundation; prerequisite to persisted
  Personal Assessment. Existing V1 scope requires optional, resumable answers;
  selected question set and behavior mapping are not frozen here.
APPROVALS: Owner-approved versioned SQLite/local migration, explicit data
  ownership, all-or-nothing migration, no automatic account claim/upload; owner
  authorized approved V1 implementation including onboarding/personalization.
RISK / REASON: HIGH — schema migration and account-owned personal assessment data.
  New tables only; no existing rows are rewritten or deleted.
REVIEW GATE: REVIEW_PENDING — independent storage/security review and Android
  installed-build migration verification required before route integration or
  acceptance. iOS verification NOT_RUN. Production migration not authorized/run.
READ: AGENTS.md; docs/AI_RULES.md; docs/ai/AI_EXECUTION_POLICY.md;
  docs/ai/DEFINITION_OF_DONE.md; docs/ai/ENGINEERING_GUARDRAILS.md;
  docs/DOCUMENTATION_MAP.md; docs/DATABASE_SCHEMA.md §§12–13;
  docs/DATA_MODEL.md §Assessment; docs/V1_SCREEN_MAP.md onboarding rows;
  docs/V1_FEATURE_SCOPE.md §2; docs/revision/01-REQUIREMENTS-AND-DECISIONS.md
  V1 implementation authorization; docs/revision/18 readiness and open policy.
INSPECT: current schema version/import transaction, local owner routing, task and
  goal SQLite adapters, assessment screens, test adapter and dirty worktree.
ALLOWED FILES: src/features/storage/local-database.ts;
  src/features/assessment/assessment-storage.ts;
  tests/domain/local-database-ownership.test.mjs; docs/CHANGELOG.md; this evidence.
NON-GOALS: changing the question set or deriving behavioral/health claims; applying
  focus, break, locale, theme or notification preferences; onboarding screen
  integration; cloud sync, account claim, deployment or production migration.
BEHAVIOR: `assessments` and `assessment_answers` are scoped by local owner and
  keyed by assessment/question identity. Draft creation/update is one transaction;
  optimistic revision mismatch returns no write; duplicate creation does not
  overwrite; only documented answer value shapes are serialized. Source JSON and
  existing task/session/goal/settings records remain untouched. Answer counts and
  payload lengths are bounded before serialization to limit corrupt/unbounded input.
PERSISTENCE: schema version 2 adds tables to existing version-1 databases in one
  transaction. New legacy import creates the new tables inside the same import
  transaction. Existing device-local data is not assigned to an account.
FAILURES / EDGES: injected DDL failure rolls back table and version change; opening
  again retries; duplicate create, stale/concurrent writes, invalid JSON values,
  close/reopen and same assessment ID across owners are tested.
SECURITY / ACCESSIBILITY: owner comes from the existing selected local store;
  composite keys/foreign keys enforce row ownership. This does not prove trusted
  server authorization or account lifecycle security.
ACCEPTANCE: real SQLite confirms atomic upgrade/rollback/retry, preserved existing
  task data, account isolation, persistence after store recreation, stale-write
  rejection, no duplicate overwrite and invalid answer rejection.
VERIFICATION: focused actual-SQLite ownership suite (`node --test
  tests/domain/local-database-ownership.test.mjs`) — 15/15 PASS; complete root
  domain/component/navigation/website suite — 168/168 PASS, 0 failures/skips/
  todos; `node node_modules/typescript/bin/tsc --noEmit` — exit 0; direct
  ESLint for the changed TypeScript/test files — exit 0; `node
  docs/revision/check-docs.mjs` — PASS, 84 Markdown files / 933 local links /
  80 requirements covered; `git diff --check` — exit 0 (existing LF/CRLF notices).
  Node SQLite tests do not substitute for Expo/Android installed-build verification.
ROLLBACK / RECOVERY: migration is additive and transactionally retryable; no data
  downgrade/drop operation is included. Do not manually downgrade a real database.
STOP / OPEN DECISIONS: exact question set, required/optional questions, profile
  calculation, settings-application mapping, age/consent gates and translation
  review remain governed by their contracts and are not inferred from this schema.
```
