# Backend evidence: recent-auth gate for EX-23

Date: 2026-10-11

## Implemented

- Added a server-only recent-auth policy helper.
- It accepts only a valid authentication instant at or before the current
  server time and inside a caller-supplied reviewed `maxAgeMs` window.
- Unsafe policy configuration, stale evidence, future timestamps and malformed
  timestamps fail with `AUTH_REQUIRED`.
- The export download-grant adapter requires this check before any job or grant
  SQL query is made.
- The policy does not choose a product TTL; the exact age window remains
  external configuration and review responsibility.

## Evidence

- `tests/domain/recent-auth-policy.test.mjs`: accepted, stale/future/malformed
  and unsafe-configuration cases.
- `tests/domain/postgres-privacy-download-grant-adapter.test.mjs`: proves stale
  auth stops before database access.
- Focused result: 7/7 passing.
- Typecheck, targeted lint and `git diff --check`: passing.

## Boundaries

This is a local candidate only. It does not perform provider reauthentication,
contact Supabase Auth or issue a download URL. The actual recent-auth provider
flow, live database/RLS, Android/device and independent security review remain
`REVIEW_PENDING` or `NOT_RUN`.
