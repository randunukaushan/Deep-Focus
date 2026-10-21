# SQLite owner namespace boundary — 2026-10-14

## Scope

The local SQLite factory now enforces the owner namespace contract: the
device-local store uses only `local:device`, while account stores use only
`account:<UUID>`. Mismatched or runtime-confused owner metadata is rejected
before initialization or migration.

## Evidence

- Focused test: `tests/domain/local-database-ownership.test.mjs` — 32 passed,
  0 failed.
- Typecheck: passed with `tsc --noEmit --pretty false`.
- Affected lint: passed for the implementation and focused test.
- Full suite: `1473 tests: 1467 passed, 0 failed, 6 skipped` across the current
  test set. The six skipped tests require a PostgreSQL-compatible local
  runtime; they are not live Supabase evidence.
- Documentation checker: `PASS`; 547 Markdown files, 936 local links, 80/80
  covered requirements and no reported errors.

## Boundaries

- This is local SQLite namespace evidence only; it is not live cloud account
  isolation or native Android evidence.
- Live database, production migration, deployment, merge, push and commit were
  not performed.
- Independent security review and Android/device verification remain
  `REVIEW_PENDING` / `NOT_RUN`.
