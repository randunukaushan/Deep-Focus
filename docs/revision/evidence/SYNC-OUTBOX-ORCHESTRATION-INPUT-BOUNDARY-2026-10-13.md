# Local sync outbox orchestration input boundary — 2026-10-13

## Scope

The local sync orchestrator now rejects null, array and incomplete store/push
dependencies before creating an in-flight operation or reading the outbox.
Existing retry, explicit acknowledgement, duplicate prevention, rejection
quarantine, concurrency and account-switch recovery behavior remains unchanged.

## Evidence

- Focused test: `tests/domain/sync-service.test.mjs` — 16 passed,
  0 failed.
- Typecheck: passed with `tsc --noEmit --pretty false`.
- Affected lint: passed for the implementation and focused test.
- Full suite: `1469 tests: 1463 passed, 0 failed, 6 skipped` across the current
  test set. The six skipped tests require a PostgreSQL-compatible local
  runtime; they are not live Supabase evidence.
- Documentation checker: `PASS`; 544 Markdown files, 936 local links, 80/80
  covered requirements and no reported errors.

## Boundaries

- This is local outbox orchestration evidence only; it is not live cloud sync,
  server idempotency or Android restart evidence.
- Live database, production migration, deployment, merge, push and commit were
  not performed.
- Independent security review and Android/device verification remain
  `REVIEW_PENDING` / `NOT_RUN`.
