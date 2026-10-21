# Migration runner dependency boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — migration execution and receipt persistence are integrity-sensitive
and remain isolated candidates until independent review.
ACCEPTANCE_CRITERIA_RESULT: malformed migration-store dependencies fail closed
before manifest or SQL work: PASS; existing migration ordering, replay, failure
and retry behavior remains green: PASS.
VERIFICATION_STATUS: PASS for local candidate tests.
REVIEW_STATUS: self-review complete; independent migration/security review
REVIEW_PENDING.
RELEASE_STATUS: NOT_READY — no live database or deployment was used.

## Change

`supabase/functions/_shared/migration-runner.ts` now validates the runner input
and its `withMigrationTransaction` dependency before reading the manifest. A
null or malformed store therefore returns the existing bounded
`VALIDATION_FAILED` boundary instead of a raw property-access exception or any
possible migration work.

`tests/domain/migration-runner.test.mjs` adds null-input and malformed-store
regression coverage. `docs/CHANGELOG.md` records the change.

## Actual checks

- Migration manifest, receipt validation, migration runner and PostgreSQL
  migration adapter focused tests: **22/22
  pass**.
- Full local test command over all `tests/**/*.test.mjs`: **1494 total, 1485
  passed, 0 failed, 9 skipped**.
- TypeScript no-emit check: **PASS**.
- Affected ESLint files: **PASS**.
- Documentation checker: **PASS** after the evidence update.

## Limits and next gate

This is local candidate evidence only. Live Supabase migration execution,
production data, rollback rehearsal against a real disposable hosted database,
independent security review, Android/device checks, deployment, merge, push and
commit remain `REVIEW_PENDING` or `NOT_RUN` as applicable. No package or tool
download was performed.
