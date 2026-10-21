# Legacy sync change return-integrity evidence — 2026-10-12

## Scope

This slice validates local PostgreSQL persistence for the legacy sync change
transaction path. It does not connect to Supabase, change a live database, or
perform a production migration.

## Confirmed finding

The legacy change insert previously checked only returned owner, sequence and
hash. It did not verify that the database returned the same entity identity and
operation that the transaction attempted to append.

## Implemented correction

- `INSERT ... RETURNING` now returns and validates entity kind, entity ID and
  operation as well as owner, sequence and computed hash.
- Existing stored-payload hash recomputation and replay protections remain.
- An altered returned change identity fails closed as
  `DEPENDENCY_UNAVAILABLE`.
- Added a regression test for altered inserted entity identity.

## Checks

- Focused legacy sync transaction tests: **13/13 PASS**.
- TypeScript typecheck: **PASS**.
- ESLint on changed adapter and test: **PASS**.
- Full repository suite: **1,402 PASS, 0 FAIL, 6 SKIPPED** across 239 test files (1,408 total). The six skipped cases are PGlite-backed PostgreSQL integration cases and are not passing evidence.
- Documentation checker: **PASS** — 504 Markdown files, 936 local links, 80/80 requirements covered; 20 cloud and 20 local-resource runtime scenarios remain unrun.

## Gates still open

- Live Supabase RLS/Auth and database integration: **NOT_RUN / REVIEW_PENDING**.
- Android/offline device verification: **NOT_RUN / REVIEW_PENDING**.
- Independent security review: **REVIEW_PENDING**.
- Production migration, deployment and release: **NOT_AUTHORIZED**.
