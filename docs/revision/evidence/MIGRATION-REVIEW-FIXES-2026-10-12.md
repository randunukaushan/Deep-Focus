# Migration review corrections — 2026-10-12

## Bounded task brief

- Outcome: correct the four identified local migration/runner findings without deploying.
- Authority: owner requested this agent to implement the review corrections; work alone.
- Risk: HIGH, schema ownership and migration transaction boundaries. Independent review remains required before integration/acceptance.
- References: AI_RULES, AI_EXECUTION_POLICY, DEFINITION_OF_DONE, ENGINEERING_GUARDRAILS; DATABASE_SCHEMA section 21; SECURITY database/role verification requirements.
- Baseline: extensive pre-existing dirty work is preserved. Existing migration files are local review candidates, not authorization to rewrite any applied database history.
- Allowed files: the existing personal_core, usage_receipt_decision, app_session_revocation_outbox and schema_migration_receipts SQL candidates; postgres-migration-runner-adapter.ts; corresponding domain regression tests; this evidence file and CHANGELOG.md. New isolated migration test files are permitted.
- Non-goals: remote execution, credentials, data migration on user databases, dependency upgrades, unrelated feature changes, commit/push.
- Acceptance: fresh migration chain does not add remaining_units twice; missing receipt table bootstraps only through the first migration on an absent private schema; cross-owner revocation references are constrained; transaction-scoped migration lock precedes receipt reads and writes.
- Recovery: failed migration and receipt insertion must roll back together under the injected transaction runner; no legacy receipt balances are invented.
- Verification: targeted tests, typecheck, focused lint and diff check; SQL engine execution where an isolated runtime is available. Mock tests are not live role/concurrency proof.
- Open gates: independent security review and native multi-connection PostgreSQL verification. No security clearance or production-readiness claim.

## Results

Initial SQL execution exposed another chain defect: reminders and goal contributions
reference `(owner_id, id)` on tasks/goals, but those parent tables only declared
`(owner_id, workspace_id, id)`. Added the missing composite unique constraints to
the already in-scope core candidate. Globally unique primary IDs already prevent
duplicates; this makes the existing owner-bound foreign keys executable without
relaxing ownership or changing data semantics. Initial engine run: 3 pass / 2 fail;
retained failures as regression targets, not removed tests.

## Actual verification

- Domain migration regressions: 86 pass.
- Isolated PGlite PostgreSQL execution: 6 pass. It covered fresh-chain apply,
  replay, missing-receipt fail-closed behavior, receipt-write rollback/retry,
  owner/session foreign-key insert and update rejection, nullable legacy usage
  balance preservation, and transaction advisory-lock release.
- TypeScript and focused ESLint passed before the final additional SQL regression.
- The repository-wide `git diff --check` remains non-clean because an unrelated,
  pre-existing `docs/CHANGELOG.md` blank-line-at-EOF warning is in the dirty tree.

PGlite uses one embedded engine. It is useful isolated PostgreSQL syntax and
constraint evidence, but does not replace native PostgreSQL multi-connection
race verification, Supabase role/RLS verification, or independent security review.
