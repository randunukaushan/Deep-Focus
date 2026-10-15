# Account-session revocation plan candidate — 2026-10-11

## Implemented candidate

- Added an owner-bound `one / others / all` session-revocation planner.
- Expired, revoked and foreign rows never become selected targets; malformed
  rows and missing recent-auth proof fail closed.
- Added a transaction boundary that enqueues provider-revocation work for every
  selected session before changing registry state. An outbox failure propagates
  and cannot be reported as a partial success.
- Added an owner-scoped PostgreSQL adapter candidate that locks the selected
  registry rows and uses the existing durable outbox schema; it does not create
  a connection or select credentials.

## Verification

- Planner, transaction and PostgreSQL-adapter focused checks: **5/5 PASS**.
- Full repository test suite after this slice: **762/762 PASS**.
- Real PostgreSQL transaction/RLS execution, provider worker delivery and
  recent-auth policy wiring: `REVIEW_PENDING / NOT_RUN`.

## Boundary

This is an isolated server candidate. It does not expose a public endpoint,
choose an unapproved recent-auth duration, or revoke any remote session.
