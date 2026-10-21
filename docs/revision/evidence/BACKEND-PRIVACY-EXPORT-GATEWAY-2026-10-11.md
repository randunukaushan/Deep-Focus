# Backend evidence: EX-21 export gateway candidate

Date: 2026-10-11

## Implemented

- Added `POST /v1/privacy/exports` to the gateway route allowlist.
- Request admission accepts exactly `{format:"json",scope:"own_account_data"}`;
  unknown fields and other scopes are rejected.
- The handler requires a verified session and UUID `Idempotency-Key`, then
  rechecks the app session inside the same transaction used to enqueue the job.
- The response is HTTP 202 with only the coarse queued job DTO. It does not
  return an artifact locator, token, URL or provider detail.
- Repeated requests use the existing enqueue adapter's owner/operation replay
  behavior, so a new job is not silently created.

## Evidence

- `tests/domain/gateway-router.test.mjs`: route allowlist coverage.
- `tests/domain/gateway-operation.test.mjs`: exact request/body and idempotency
  admission coverage.
- `tests/domain/postgres-gateway-handlers.test.mjs`: session recheck, 202
  response and private-artifact omission.
- Focused result: 22/22 passing.
- Typecheck, targeted lint and `git diff --check`: passing.

## Boundaries

This is a local candidate. It does not materialize an export, issue a download
token, call storage or contact a live Supabase database. Recent-auth policy,
rate limits, live RLS and independent security review remain
`REVIEW_PENDING`/`NOT_RUN`.
