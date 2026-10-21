# Gateway admission input boundary — 2026-10-13

## Scope

Gateway request admission now rejects null, array and malformed header
containers before reading authentication or idempotency metadata. Existing
method, path, actor, body, size and write-idempotency rules remain unchanged.

## Evidence

- Focused test: `tests/domain/gateway-admission.test.mjs` — 7 passed,
  0 failed.
- Typecheck: passed with `tsc --noEmit --pretty false`.
- Affected lint: passed for the implementation and focused test.
- Full suite: `1467 tests: 1461 passed, 0 failed, 6 skipped` across the current
  test set. The six skipped tests require a PostgreSQL-compatible local
  runtime; they are not live Supabase evidence.
- Documentation checker: `PASS`; 542 Markdown files, 936 local links, 80/80
  covered requirements and no reported errors.

## Boundaries

- This is local request-admission evidence only; it is not live API gateway,
  Supabase Auth or RLS evidence.
- Live database, production migration, deployment, merge, push and commit were
  not performed.
- Independent security review and Android/device verification remain
  `REVIEW_PENDING` / `NOT_RUN`.
