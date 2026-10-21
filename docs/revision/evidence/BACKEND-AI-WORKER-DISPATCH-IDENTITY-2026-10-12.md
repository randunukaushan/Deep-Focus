# AI worker dispatch-identity evidence — 2026-10-12

## Scope

This slice validates local PostgreSQL AI-generation worker lease transitions.
It does not connect to Supabase, invoke an AI provider, or change production
data.

## Confirmed finding

Worker transition responses validated that `dispatch_key` was a UUID, but did
not compare it with the dispatch key on the originally locked job. A malformed
database response could therefore be accepted with a different provider/replay
identity.

## Implemented correction

- Claim, renew and reconcile transitions now require the returned job to retain
  the locked job's original `dispatch_key`.
- Existing owner/request, fence, lease, state and error-code validation remains.
- Added a cross-dispatch returned-row regression test.

## Checks

- Focused AI worker tests: **7/7 PASS**.
- TypeScript typecheck: **PASS**.
- ESLint on changed adapter and test: **PASS**.
- Full repository suite: **1,405 PASS, 0 FAIL, 6 SKIPPED** across 239 test files (1,411 total). The six skipped cases are PGlite-backed PostgreSQL integration cases and are not passing evidence.
- Documentation checker: **PASS** — 508 Markdown files, 936 local links, 80/80 requirements covered; 20 cloud and 20 local-resource runtime scenarios remain unrun.

## Gates still open

- Live Supabase RLS/Auth and database integration: **NOT_RUN / REVIEW_PENDING**.
- Android/offline device verification: **NOT_RUN / REVIEW_PENDING**.
- Independent security review: **REVIEW_PENDING**.
- Production migration, deployment and release: **NOT_AUTHORIZED**.
