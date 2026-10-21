# AI proposal apply receipt return-integrity evidence — 2026-10-12

## Scope

This slice validates the local PostgreSQL adapter that persists AI proposal
apply receipts. It does not connect to Supabase, change a live database, or
enable an AI provider or paid service.

## Confirmed finding

The receipt insert previously checked only returned owner, proposal and
mutation identifiers. It did not verify that the database returned the same
proposal version, review/request hashes, response payload/status, committed
sequence and applied timestamp that the transaction attempted to persist.

## Implemented correction

- `INSERT ... RETURNING` now returns and validates every receipt column.
- A malformed or altered returned receipt fails closed as
  `DEPENDENCY_UNAVAILABLE`.
- Added a regression test for altered version, request hash and response
  status; existing replay, malformed-row and foreign-owner assertions remain.

## Checks

- Focused AI apply receipt tests: **7/7 PASS**.
- TypeScript typecheck: **PASS**.
- ESLint on changed adapter and test: **PASS**.
- Full repository suite: **1,396 PASS, 0 FAIL, 6 SKIPPED** across 239 test files (1,402 total). The six skipped cases are PGlite-backed PostgreSQL integration cases and are not passing evidence.
- Documentation checker: **PASS** — 498 Markdown files, 936 local links, 80/80 requirements covered; 20 cloud and 20 local-resource runtime scenarios remain unrun.

## Gates still open

- Live Supabase RLS/Auth and database integration: **NOT_RUN / REVIEW_PENDING**.
- Android/offline device verification: **NOT_RUN / REVIEW_PENDING**.
- Independent security review: **REVIEW_PENDING**.
- Production migration, deployment, AI provider and paid-service activation:
  **NOT_AUTHORIZED**.
