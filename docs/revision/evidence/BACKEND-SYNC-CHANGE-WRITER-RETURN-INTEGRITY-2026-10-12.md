# Mutation-to-sync change writer return-integrity evidence — 2026-10-12

## Scope

This slice validates the local PostgreSQL writer that appends an authoritative
sync change after a domain mutation. It does not connect to Supabase, change a
live database, or perform a production migration.

## Confirmed finding

The writer previously checked only returned owner, sequence and change hash. It
did not verify the returned entity identity or operation before advancing the
owner sync head.

## Implemented correction

- `INSERT ... RETURNING` now validates entity kind, entity ID and operation as
  well as owner, sequence and computed hash.
- Head advancement remains blocked until the complete insert acknowledgement is
  valid.
- Added an altered-return entity identity regression test; existing ownership,
  payload-size, non-finite-value and head-safety checks remain.

## Checks

- Focused sync change writer tests: **19/19 PASS**.
- TypeScript typecheck: **PASS**.
- ESLint on changed writer and test: **PASS**.
- Full repository suite: **1,403 PASS, 0 FAIL, 6 SKIPPED** across 239 test files (1,409 total). The six skipped cases are PGlite-backed PostgreSQL integration cases and are not passing evidence.
- Documentation checker: **PASS** — 505 Markdown files, 936 local links, 80/80 requirements covered; 20 cloud and 20 local-resource runtime scenarios remain unrun.

## Gates still open

- Live Supabase RLS/Auth and database integration: **NOT_RUN / REVIEW_PENDING**.
- Android/offline device verification: **NOT_RUN / REVIEW_PENDING**.
- Independent security review: **REVIEW_PENDING**.
- Production migration, deployment and release: **NOT_AUTHORIZED**.
