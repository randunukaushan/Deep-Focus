# Backend evidence — PostgreSQL app-session adapter (2026-10-10)

## Implemented

The local candidate now persists and reads owner-bound app-session registry rows and performs revocation plus provider-revocation outbox enqueue in one caller-owned transaction. Session reads and revocation lock the owner/session row; outbox insertion is idempotent by owner/session and provider I/O remains outside the transaction.

## Verification

- `postgres-app-session-adapter.test.mjs`: 3/3 passed.
- Full bundled runtime suite: 499/499 passed.
- TypeScript typecheck: passed.
- Affected ESLint: passed.
- Docs checker: passed.
- `git diff --check`: no content errors; existing LF/CRLF conversion warnings were reported.

## Boundaries

No provider token call, Supabase connection, remote migration, production data, or deployment was used. Real PostgreSQL locking/RLS, independent security review, and Android/device verification remain `REVIEW_PENDING`.

## Timestamp integrity follow-up

The issued timestamp supplied to the validated session-issue command is now
retained in `AppSessionRecord` and passed to `issued_at` explicitly. The
adapter no longer substitutes the process clock, which keeps expiry and
registry evidence deterministic.

- Auth/session/gateway/adapter focused set: **25/25 PASS**.
- The regression asserts the exact `issuedAt` SQL parameter and preserves
  owner-bound revocation behavior.
- Remote auth/RLS execution and independent review remain
  `NOT_RUN`/`REVIEW_PENDING`.
