# V2 sync group return-integrity evidence — 2026-10-12

## Scope

This slice validates local PostgreSQL V2 sync group persistence. It does not
connect to Supabase, change a live database, or perform a production
migration.

## Confirmed finding

The transaction-group append path previously checked only group owner/ID,
change owner/sequence and head owner/sequence after writes. It did not verify
the returned group metadata, per-change identity/hash or head privacy epoch.

## Implemented correction

- Group `INSERT ... RETURNING` now validates contract version, epoch, committed
  sequence, count and digest.
- Each change insert now validates transaction/entity/operation identity and
  the computed change hash.
- Head advancement now validates the returned privacy epoch as well as owner
  and sequence.
- Added regression tests for altered group metadata and altered change hash;
  existing replay, epoch and malformed-result checks remain.

## Checks

- Focused V2 sync group tests: **8/8 PASS**.
- TypeScript typecheck: **PASS**.
- ESLint on changed adapter and test: **PASS**.
- Full repository suite: **1,400 PASS, 0 FAIL, 6 SKIPPED** across 239 test files (1,406 total). The six skipped cases are PGlite-backed PostgreSQL integration cases and are not passing evidence.
- Documentation checker: **PASS** — 501 Markdown files, 936 local links, 80/80 requirements covered; 20 cloud and 20 local-resource runtime scenarios remain unrun.

## Gates still open

- Live Supabase RLS/Auth and database integration: **NOT_RUN / REVIEW_PENDING**.
- Android/offline device verification: **NOT_RUN / REVIEW_PENDING**.
- Independent security review: **REVIEW_PENDING**.
- Production migration, deployment and release: **NOT_AUTHORIZED**.
