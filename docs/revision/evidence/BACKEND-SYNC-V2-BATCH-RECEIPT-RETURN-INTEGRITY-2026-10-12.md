# V2 sync batch receipt return-integrity evidence — 2026-10-12

## Scope

This slice validates the local PostgreSQL adapter that persists V2 sync batch
replay receipts. It does not connect to Supabase, change a live database, or
perform a production migration.

## Confirmed finding

The batch receipt insert previously checked only returned owner and batch IDs.
It did not verify the returned request hash, response body/status or creation
timestamp that define the exact replay response.

## Implemented correction

- `INSERT ... RETURNING` now returns and validates every batch receipt column.
- A malformed or altered returned row fails closed as
  `DEPENDENCY_UNAVAILABLE`.
- Added a regression test for altered returned hash and response fields;
  existing owner, malformed-row, size and replay checks remain.

## Checks

- Focused V2 batch receipt tests: **9/9 PASS**.
- TypeScript typecheck: **PASS**.
- ESLint on changed adapter and test: **PASS**.
- Full repository suite: **1,397 PASS, 0 FAIL, 6 SKIPPED** across 239 test files (1,403 total). The six skipped cases are PGlite-backed PostgreSQL integration cases and are not passing evidence.
- Documentation checker: **PASS** — 499 Markdown files, 936 local links, 80/80 requirements covered; 20 cloud and 20 local-resource runtime scenarios remain unrun.

## Gates still open

- Live Supabase RLS/Auth and database integration: **NOT_RUN / REVIEW_PENDING**.
- Android/offline device verification: **NOT_RUN / REVIEW_PENDING**.
- Independent security review: **REVIEW_PENDING**.
- Production migration, deployment and release: **NOT_AUTHORIZED**.
