# Focus-session list cursor — 2026-10-11

## Implemented candidate

- Added an owner-bound signed cursor for descending focus-session history.
- The cursor binds the actor, endpoint, page size, descending `(started_at,id)`
  position and expiry.
- The read handler rechecks the active app session before querying, uses a
  bounded keyset query, and returns the existing `items` shape with pagination
  metadata.
- Query parameters are now admitted for `listSessions`; unknown, repeated or
  invalid keys remain rejected before handler dispatch.

## Verification

- Cursor and read-handler focused checks: **3/3 PASS**.
- TypeScript, affected ESLint, documentation checks and `git diff --check`:
  **PASS**.
- Full repository suite after this slice: **745/745 PASS**.

## Review boundary

This is a local server candidate. Real PostgreSQL/RLS execution, account A/B
integration, revoked-token/device evidence and independent security review remain
`REVIEW_PENDING / NOT_RUN`.
