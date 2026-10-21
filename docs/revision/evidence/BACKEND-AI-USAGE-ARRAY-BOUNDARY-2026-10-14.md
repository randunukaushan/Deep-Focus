# AI usage projection array boundary — 2026-10-14

## Scope

The server-authoritative AI usage projection now rejects sparse or otherwise
non-plain `buckets` and `enabledActions` arrays before aggregating allowance
totals or returning the current usage projection.

## Evidence

- Focused AI usage/gateway suites: `24/24 passed; 0 failed; 0 skipped`
- Full domain suite: `1517 total; 1508 passed; 0 failed; 9 skipped`
- TypeScript check: `PASS` (`tsc --noEmit --pretty false`)
- Affected-file lint: `PASS` (projection and regression test)
- Documentation check: `PASS` (`docs/revision/check-docs.mjs`)

## Gates not established here

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`
- Real Auth/session/provider verification: `REVIEW_PENDING`
- Android/device verification: `NOT_RUN`
- Independent security review: `REVIEW_PENDING`
- Production migration/deployment: `NOT_RUN`
