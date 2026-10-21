# Domain mutation receipt return-integrity evidence — 2026-10-12

## Scope

This slice validates local PostgreSQL domain mutation receipt persistence. It
does not connect to Supabase, change a live database, or perform a production
migration.

## Confirmed finding

The mutation receipt insert previously checked only returned owner, operation
and mutation identifiers. It did not verify the request hash, response body or
response status returned by the database before reporting success.

## Implemented correction

- `INSERT ... RETURNING` now returns and validates every mutation receipt
  column.
- A malformed or altered returned row fails closed as
  `DEPENDENCY_UNAVAILABLE`.
- Added a regression test for altered returned hash and response metadata;
  existing replay, ownership, size and malformed-row assertions remain.

## Checks

- Focused domain mutation adapter tests: **16/16 PASS**.
- TypeScript typecheck: **PASS**.
- ESLint on changed adapter and test: **PASS**.
- Full repository suite: **1,398 PASS, 0 FAIL, 6 SKIPPED** across 239 test files (1,404 total). The six skipped cases are PGlite-backed PostgreSQL integration cases and are not passing evidence.
- Documentation checker: **PASS** — 500 Markdown files, 936 local links, 80/80 requirements covered; 20 cloud and 20 local-resource runtime scenarios remain unrun.

## Gates still open

- Live Supabase RLS/Auth and database integration: **NOT_RUN / REVIEW_PENDING**.
- Android/offline device verification: **NOT_RUN / REVIEW_PENDING**.
- Independent security review: **REVIEW_PENDING**.
- Production migration, deployment and release: **NOT_AUTHORIZED**.
