# Request-session input boundary — 2026-10-13

## Scope

The request-session authorization boundary now rejects null and array runtime
inputs as `invalid_token` before reading headers or invoking provider/session
dependencies. Existing missing-token, guest-shaped, provider-failure and
account-switching behavior remains unchanged.

## Evidence

- Focused test: `tests/domain/request-session.test.mjs` — 9 passed, 0 failed.
- Typecheck: passed with `tsc --noEmit --pretty false`.
- Affected lint: passed for the implementation and focused test.
- Full suite: `1465 tests: 1459 passed, 0 failed, 6 skipped` across the current
  test set. The six skipped tests require a PostgreSQL-compatible local
  runtime; they are not live Supabase evidence.
- Documentation checker: `PASS`; 540 Markdown files, 936 local links, 80/80
  covered requirements and no reported errors.

## Boundaries

- This is local auth-composition evidence only; it is not live Supabase Auth,
  RLS or account-isolation evidence.
- Live database, production migration, deployment, merge, push and commit were
  not performed.
- Independent security review and Android/device verification remain
  `REVIEW_PENDING` / `NOT_RUN`.
