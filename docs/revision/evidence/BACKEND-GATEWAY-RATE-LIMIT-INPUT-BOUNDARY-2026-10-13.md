# Gateway rate-limit input boundary — 2026-10-13

## Scope

Rate-limit admission now rejects null, array and malformed counter dependency
inputs before constructing a shared counter key or making a counter call.
Existing actor/operation policy validation, atomic denial and bounded retry
behavior remain unchanged.

## Evidence

- Focused test: `tests/domain/gateway-rate-limit.test.mjs` — 7 passed,
  0 failed.
- Typecheck: passed with `tsc --noEmit --pretty false`.
- Affected lint: passed for the implementation and focused test.
- Full suite: `1466 tests: 1460 passed, 0 failed, 6 skipped` across the current
  test set. The six skipped tests require a PostgreSQL-compatible local
  runtime; they are not live Supabase evidence.
- Documentation checker: `PASS`; 541 Markdown files, 936 local links, 80/80
  covered requirements and no reported errors.

## Boundaries

- This is local rate-limit admission evidence only; it is not live shared
  counter, Supabase or production traffic evidence.
- Live database, production migration, deployment, merge, push and commit were
  not performed.
- Independent security review and Android/device verification remain
  `REVIEW_PENDING` / `NOT_RUN`.
