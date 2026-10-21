# AI cancellation receipt return-integrity evidence — 2026-10-12

## Scope

This slice validates local PostgreSQL persistence for AI-generation cancellation
receipts. It does not connect to Supabase, change a live database, or enable an
AI provider.

## Confirmed finding

The cancellation path checked that the receipt insert returned one row, but it
did not validate the returned outcome, request hash, response body or the
request state inside that response before reporting cancellation success.

## Implemented correction

- The returned receipt is now passed through the existing strict receipt
  validator.
- The returned outcome and complete request response must match the state
  committed in the same transaction.
- Altered returned receipts fail closed as `DEPENDENCY_UNAVAILABLE`.
- Added a regression test for an altered returned request version; existing
  replay and terminal-state checks remain.

## Checks

- Focused cancellation adapter tests: **8/8 PASS**.
- TypeScript typecheck: **PASS**.
- ESLint on changed adapter and test: **PASS**.
- Full repository suite: **1,401 PASS, 0 FAIL, 6 SKIPPED** across 239 test files (1,407 total). The six skipped cases are PGlite-backed PostgreSQL integration cases and are not passing evidence.
- Documentation checker: **PASS** — 503 Markdown files, 936 local links, 80/80 requirements covered; 20 cloud and 20 local-resource runtime scenarios remain unrun.

## Gates still open

- Live Supabase RLS/Auth and database integration: **NOT_RUN / REVIEW_PENDING**.
- Android/offline device verification: **NOT_RUN / REVIEW_PENDING**.
- Independent security review: **REVIEW_PENDING**.
- Production migration, deployment and release: **NOT_AUTHORIZED**.
