# AI proposal selection array boundary — 2026-10-14

## Scope

The PostgreSQL AI proposal adapter now requires selected operation IDs to be
finite plain JSON arrays before applying or replaying an applied proposal.
Sparse arrays are rejected before SQL, preventing omitted elements from being
coerced to `null` during JSON persistence.

## Evidence

- Focused proposal/apply suites: `14/14 passed; 0 failed; 0 skipped`
- Full domain suite: `1516 total; 1507 passed; 0 failed; 9 skipped`
- TypeScript check: `PASS` (`tsc --noEmit --pretty false`)
- Affected-file lint: `PASS` (adapter and regression test)
- Documentation check: `PASS` (`docs/revision/check-docs.mjs`)

## Gates not established here

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`
- Real Auth/session/provider verification: `REVIEW_PENDING`
- Android/device verification: `NOT_RUN`
- Independent security review: `REVIEW_PENDING`
- Production migration/deployment: `NOT_RUN`
