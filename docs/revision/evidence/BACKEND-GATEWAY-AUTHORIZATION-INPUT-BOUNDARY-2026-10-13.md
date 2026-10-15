# Gateway authorization input boundary — 2026-10-13

## Scope

Gateway owner authorization now rejects null, array and malformed admitted
request/store inputs before reading actor, route or ownership fields. It also
rejects a malformed actor identifier before any ownership lookup. Existing
foreign-resource checks and linked-resource ownership checks are unchanged.

## Evidence

- Focused test: `tests/domain/gateway-authorization.test.mjs` — 10 passed,
  0 failed.
- Full suite: `1461 tests: 1455 passed, 0 failed, 6 skipped` across the current
  test set. The six skipped tests require a PostgreSQL-compatible local
  runtime; they are not live Supabase evidence.
- Typecheck: passed with `tsc --noEmit --pretty false`.
- Affected lint: passed for the implementation and focused test.
- Documentation checker: `PASS`; 535 Markdown files, 936 local links, 80/80
  covered requirements and no reported errors.

## Boundaries

- This is local adapter and test evidence only; it is not live PostgreSQL RLS
  or Supabase account-isolation evidence.
- Live database, production migration, deployment, merge, push and commit were
  not performed.
- Independent security review and Android/device verification remain
  `REVIEW_PENDING` / `NOT_RUN`.
