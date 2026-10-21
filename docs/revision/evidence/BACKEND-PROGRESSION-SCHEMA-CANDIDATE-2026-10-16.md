# Backend progression schema candidate — 2026-10-16

## Task brief

```text
TASK: Add the smallest local Supabase V1 progression schema candidate.
STATE: IMPLEMENTED; remote execution and independent review remain REVIEW_PENDING.
DELIVERABLE: Local migration, structural regression test and evidence only.
REQUIREMENT / PHASE: PROGRESSION_RULES.md V1 durable model; existing local
  SQLite progression is preserved and is not replaced.
APPROVALS: Owner-approved XP/level/achievement rules recorded in
  PROGRESSION_RULES.md; no remote migration, deployment or production data work.
RISK / REASON: HIGH — future owner/RLS and durable-ledger boundary; local-only,
  additive and reversible before any remote execution.
REVIEW GATE: Independent security/data review required before remote integration.
READ: AGENTS.md, AI_RULES.md, ENGINEERING_GUARDRAILS.md,
  AI_EXECUTION_POLICY.md, DEFINITION_OF_DONE.md, DATA_MODEL.md,
  DATABASE_SCHEMA.md, API_SPEC.md, SECURITY.md and PROGRESSION_RULES.md.
INSPECT: Existing Supabase migrations, PGlite migration review harness, local
  SQLite progression implementation and gateway reward-projection validator.
ALLOWED FILES: New local migration, migration tests, progression/docs evidence.
NON-GOALS: No remote call, schema application, gateway handler, client direct
  database access, backfill execution, dependency change, commit or push.
BEHAVIOR: Owner-bound terminal focus event ledger, XP summary and stable
  achievement unlock records; an event requires its own completed focus session.
PERSISTENCE: Composite owner/source foreign keys and unique operation key protect
  `terminal:<sessionId>` under `rewards:v1`; no data migration is performed.
FAILURES / EDGES: Duplicate events, foreign-owner sources, cancelled sources,
  repeated presentation receipts and invalid backfilled receipts reject.
ACCEPTANCE: Candidate has RLS enabled, no direct anon/authenticated grants,
  durable owner/replay constraints and a one-time Summary receipt guard.
VERIFICATION: Static invariant test, existing local progression smoke set,
  TypeScript, docs check and diff check; PGlite execution needs a supplied,
  pinned local module path.
ROLLBACK / RECOVERY: Do not run remotely. Remove only the uncommitted candidate
  after explicit review if superseded; no existing migration is rewritten.
STOP / OPEN DECISIONS: Server-side reward processor and historical remote
  reconciliation require an independently reviewed trusted gateway design.
```

## Changes

- `supabase/migrations/20261016041647_reward_progression_v1.sql`
  - Adds `df_private.reward_progress`, `df_private.progression_events` and
    `df_private.user_achievements`.
  - Uses owner-scoped key `(owner_id, consumer, source_operation_key)` and
    `terminal:<focus_session_id>` validation for `rewards:v1`.
  - Rejects non-completed or cross-owner focus sources, rewrites to the event
    ledger, duplicate achievement rows, and a second Summary presentation
    receipt.
  - Enables RLS and revokes all direct table privileges from `public`, `anon`
    and `authenticated`; only `service_role` receives table privileges.
- `tests/domain/reward-progression-migration-contract.test.mjs` locks the
  structural V1 contract without weakening existing migration/RLS checks.

## Verification

| Check | Result |
| --- | --- |
| Static migration invariant test | `IMPLEMENTED_AND_LOCALLY_TESTED` — 1/1 passed with Node 24.18.0. |
| Local progression/focus smoke set | `IMPLEMENTED_AND_LOCALLY_TESTED` — 71/71 passed with Node 24.18.0. |
| PGlite migration/RLS execution | `NOT_RUN` — no configured or cached pinned `DEEP_FOCUS_PGLITE_MODULE`; no download was attempted. The TypeScript-aware runner loaded and reported all 10 cases skipped. |
| Live Supabase migration, Auth/RLS, gateway transaction and sync | `REVIEW_PENDING` — deliberately not called or deployed. |
| Android/iOS device verification | `NOT_RUN` — this is a server-schema candidate, not a device test. |
| Independent security/data review | `REVIEW_PENDING`. |

The previous changelog statement about a remote migration count is not used as
evidence for this candidate. The current local migration inventory was inspected
instead; no remote migration history or database state was queried.

## Regression follow-up

- The initial broad local run exposed an unrelated test-harness failure in
  `tests/domain/auth-service.test.mjs`: plain Node does not resolve the app's
  canonical `@/` TypeScript path alias. The harness now compiles the production
  module and injects the actual locale-copy module. It also supplies `URL`,
  matching the runtime global required to validate OAuth callbacks. Production
  auth behavior was not changed for this fix.
- A pre-existing import-order lint warning in `src/features/auth/auth-service.ts`
  was corrected by keeping its imports at module top. This is behavior-neutral.
- Full local Node regression: `1608/1608` passed, `0` failed, `0` skipped and
  `0` aborted (Node 24.18.0, `--test-concurrency=16`, 63.6 seconds).
- TypeScript: `node node_modules/typescript/bin/tsc --noEmit` — pass.
- Source lint: `node node_modules/eslint/bin/eslint.js src --max-warnings=0` —
  pass.
- Documentation checker: `node docs/revision/check-docs.mjs` — pass (650
  Markdown files, 937 local links, 0 errors).
- `git diff --check` — pass. Line-ending warnings were emitted by Git but no
  whitespace error remained.

## Remaining requirements before remote use

1. Run the full migration chain in an isolated PostgreSQL-compatible environment
   with the pinned PGlite module or a separately authorized disposable database.
2. Implement and independently review a trusted gateway transaction that derives
   owner/session state and recomputes XP; this migration intentionally provides
   no client-controlled reward mutation path.
3. Define an approved remote reconciliation plan for any existing reward totals
   before a historical backfill is enabled. No totals are reset or reconstructed
   by this candidate.
4. Perform live Supabase Auth/RLS negative tests, failure/retry tests and an
   independent security review before integration or release.
