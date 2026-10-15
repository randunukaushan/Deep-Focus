# Session event returned sequence normalization — 2026-10-11

## Implemented

The session-event PostgreSQL adapter now accepts a safe decimal string for the
`focus_events.sequence bigint` value returned by an insert, normalizes it and
compares it with the requested client sequence. Foreign, malformed or unsafe
returned sequence values still fail closed before the session update.

## Actual checks

- Session-event focused tests: **10/10 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite: **992/992 PASS**.
- Documentation checker: **PENDING**.

## Gates

Live PostgreSQL event insertion, concurrent session writes, RLS/account-
isolation verification, Android/device verification and independent security
review remain `NOT_RUN`/`REVIEW_PENDING`. No remote database, production
migration, deployment, commit or push was performed.
