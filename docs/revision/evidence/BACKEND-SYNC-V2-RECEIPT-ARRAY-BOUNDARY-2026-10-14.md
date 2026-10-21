# V2 sync batch receipt nested-array boundary — 2026-10-14

## Scope

The V2 sync batch receipt validator now rejects sparse arrays inside response
payloads. This keeps the response digest and durable replay value identical
before and after JSON serialization.

## Evidence

- Focused V2 batch receipt suites: `18/18 passed; 0 failed; 0 skipped`
- Full domain suite: `1516 total; 1507 passed; 0 failed; 9 skipped`
- TypeScript check: `PASS` (`tsc --noEmit --pretty false`)
- Affected-file lint: `PASS` (validator and regression test)
- Documentation check: `PASS` (`docs/revision/check-docs.mjs`)

## Gates not established here

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`
- Real Auth/session/provider verification: `REVIEW_PENDING`
- Android/device verification: `NOT_RUN`
- Independent security review: `REVIEW_PENDING`
- Production migration/deployment: `NOT_RUN`
