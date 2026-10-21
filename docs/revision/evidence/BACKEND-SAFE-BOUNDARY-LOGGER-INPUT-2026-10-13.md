# Safe boundary logger input validation — 2026-10-13

## Scope

The server diagnostic logger now rejects null, array and runtime type-confusion
inputs before regular-expression validation or error mapping. Event names and
request IDs remain allowlisted, and error objects are still reduced to safe
status/code fields.

## Evidence

- Focused test: `tests/domain/server-boundary.test.mjs` — 7 passed, 0 failed.
- Typecheck: passed with `tsc --noEmit --pretty false`.
- Affected lint: passed for the implementation and focused test.
- Full suite: `1464 tests: 1458 passed, 0 failed, 6 skipped` across the current
  test set. The six skipped tests require a PostgreSQL-compatible local
  runtime; they are not live Supabase evidence.
- Documentation checker: `PASS`; 539 Markdown files, 936 local links, 80/80
  covered requirements and no reported errors.

## Boundaries

- This is local logging-boundary evidence only; it is not production log or
  live Supabase evidence.
- Live database, production migration, deployment, merge, push and commit were
  not performed.
- Independent security review and Android/device verification remain
  `REVIEW_PENDING` / `NOT_RUN`.
