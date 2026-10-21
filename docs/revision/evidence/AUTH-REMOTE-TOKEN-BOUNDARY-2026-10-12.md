# Remote API token boundary evidence — 2026-10-12

## Confirmed finding

The remote API client only checked the truthiness of the runtime access-token
value. A blank string or a malformed runtime value could therefore reach the
Bearer-header construction boundary.

## Change

The client now accepts only a non-blank string access token and returns the
existing `AUTH_REQUIRED` error before invoking the fetcher for blank or
malformed values. No token is logged or copied into request bodies.

## Evidence

- Focused test: `tests/domain/remote-api-client.test.mjs`
- Result: **9/9 passed**.
- Typecheck and affected lint: **passed**.
- Full repository suite: **1388/1388 PASS** across **238** test files, run in
  six bounded batches.
- Docs checker: **PASS** (`492` markdown files, `936` local links checked).
- Live authenticated API, Android/device verification and independent security
  review: `NOT_RUN` / `REVIEW_PENDING`; this local change does not establish
  production readiness.
