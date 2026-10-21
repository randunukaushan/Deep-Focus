# AI proposal expiry regression — 2026-10-12

## Implemented

Added a regression case for a proposal whose owner, version and review digest
all match but whose `expiresAt` equals the server `now`. The atomic apply
boundary rejects it before selected-domain operations, proposal marking or
receipt writing.

## Actual checks

- AI proposal apply focused suite: **6/6 PASS**.
- Full repository suite: **1227/1227 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS**.

## Gates

Provider-backed expiry, live duplicate apply, real database transaction
isolation and independent security review remain `NOT_RUN` /
`REVIEW_PENDING`.
