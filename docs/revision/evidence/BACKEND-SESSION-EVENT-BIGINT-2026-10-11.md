# Session event PostgreSQL bigint normalization — 2026-10-11

## Implemented

The session-event adapter now normalizes PostgreSQL `bigint` strings for
planned, focused and paused milliseconds and the event sequence before timer
arithmetic or ordering checks. Unsafe or malformed storage values fail closed
before a new event is inserted. Existing owner, version, state and sequence
guards remain active.

## Actual checks

- Session-event focused tests: **9/9 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite: **980/980 PASS**.
- Documentation checker: **PENDING**.

## Gates

Live PostgreSQL execution, RLS/account-isolation verification,
Android/device verification and independent security review remain
`NOT_RUN`/`REVIEW_PENDING`. No remote database, production migration,
deployment, commit or push was performed.
