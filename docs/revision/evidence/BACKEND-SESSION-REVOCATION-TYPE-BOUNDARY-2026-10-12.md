# Session revocation type-boundary evidence — 2026-10-12

## Change

The revocation batch, fenced worker, retry scheduler and lease state machine
now validate UUID, timestamp and provider-error types before regular-expression
or date parsing. Malformed runtime values fail with the bounded validation
error and do not read due work, claim a lease, call the provider or schedule a
retry.

## Automated evidence

- `tests/domain/app-session-revocation-batch.test.mjs`: 5/5 passed.
- `tests/domain/app-session-revocation-runner.test.mjs`: 5/5 passed.
- `tests/domain/app-session-revocation-retry.test.mjs`: 4/4 passed.
- `tests/domain/app-session-revocation-worker.test.mjs`: 5/5 passed.
- `tests/domain/app-session-revocation-plan.test.mjs`: 9/9 passed.
- `tests/domain/postgres-app-session-revocation-worker-adapter.test.mjs`: 8/8
  passed.
- `tests/domain/postgres-account-session-revocation-handler.test.mjs`: 3/3
  passed.
- `tests/domain/app-session-revocation.test.mjs`: 5/5 passed.
- `tests/domain/postgres-app-session-adapter.test.mjs`: 13/13 passed.
- Live provider revocation, Supabase execution and independent security review
  remain `REVIEW_PENDING` / `NOT_RUN`.
