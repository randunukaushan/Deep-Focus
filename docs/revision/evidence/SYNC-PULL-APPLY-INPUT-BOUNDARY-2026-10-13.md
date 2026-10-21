# Local sync-pull apply input boundary — 2026-10-13

## Scope

Local sync-pull application now rejects runtime-confused owner IDs and missing
or non-callable storage dependencies before page validation or persistence.
Existing signed-cursor, page-size, entity-shape, atomic-apply and retry-failure
behavior remains unchanged.

## Evidence

- Focused test: `tests/domain/sync-pull-apply.test.mjs` — 8 passed,
  0 failed.
- Typecheck: passed with `tsc --noEmit --pretty false`.
- Affected lint: passed for the implementation and focused test.
- Full suite: `1468 tests: 1462 passed, 0 failed, 6 skipped` across the current
  test set. The six skipped tests require a PostgreSQL-compatible local
  runtime; they are not live Supabase evidence.
- Documentation checker: `PASS`; 543 Markdown files, 936 local links, 80/80
  covered requirements and no reported errors.

## Boundaries

- This is local sync contract evidence only; it is not live cloud sync,
  PostgreSQL or device restart evidence.
- Live database, production migration, deployment, merge, push and commit were
  not performed.
- Independent security review and Android/device verification remain
  `REVIEW_PENDING` / `NOT_RUN`.
