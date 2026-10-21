# Backend usage receipt return-integrity evidence — 2026-10-12

## Scope

This slice validates the PostgreSQL usage adapter's reservation and settlement
receipt writes. It does not connect to Supabase, change a live database, or
claim production readiness.

## Confirmed finding

The adapter previously confirmed only the returned receipt identity/scope after
reservation and settlement writes. A trusted database response with altered
units, policy version, remaining units, or lifecycle status could therefore be
accepted without validating the complete receipt state.

## Implemented correction

- Reservation `INSERT ... RETURNING` now validates owner/receipt identity,
  capability, period, units, policy version, remaining units and `reserved`
  status against the transaction's expected values.
- Settlement `UPDATE ... RETURNING` now validates the complete stored receipt
  decision and the requested terminal status before the transaction succeeds.
- Any malformed or mismatched returned row fails closed as
  `DEPENDENCY_UNAVAILABLE`.
- Regression tests cover altered reservation fields and altered settlement
  fields; existing ownership and scope safety assertions remain intact.

## Checks

- Focused PostgreSQL usage adapter tests: **27/27 PASS**.
- TypeScript typecheck: **PASS**.
- ESLint on changed adapter and test: **PASS**.
- Full repository suite: **1,395 PASS, 0 FAIL, 6 SKIPPED** across 239 test files (1,401 total). The six skipped cases are PGlite-backed PostgreSQL integration cases and are not passing evidence.
- Documentation checker: **PASS** — 497 Markdown files, 936 local links, 80/80 requirements covered; 20 cloud and 20 local-resource runtime scenarios remain unrun.

## Gates still open

- Live Supabase integration/RLS and Auth verification: **NOT_RUN / REVIEW_PENDING**.
- Android/offline device verification: **NOT_RUN / REVIEW_PENDING**.
- Independent security review: **REVIEW_PENDING**.
- Production migration, deployment and release: **NOT_AUTHORIZED**.
