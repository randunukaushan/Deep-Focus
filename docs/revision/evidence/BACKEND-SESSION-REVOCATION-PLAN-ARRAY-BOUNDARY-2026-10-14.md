# Session revocation plan array boundary — 2026-10-14

## Scope

The owner-bound session revocation planner now rejects sparse or otherwise
non-plain session record and replay-target arrays before selecting sessions,
enqueuing provider revocations or replaying a frozen receipt.

## Evidence

- Focused revocation-plan/session suites: `36/36 passed; 0 failed; 0 skipped`
- Full domain suite: `1520 total; 1511 passed; 0 failed; 9 skipped`
- TypeScript check: `PASS` (`tsc --noEmit --pretty false`)
- Affected-file lint: `PASS` (planner and regression test)
- Documentation check: `PASS` (`docs/revision/check-docs.mjs`)

## Gates not established here

- Live Supabase/Auth/session verification: `REVIEW_PENDING`
- Real provider revocation execution: `REVIEW_PENDING`
- Android/device verification: `NOT_RUN`
- Independent security review: `REVIEW_PENDING`
- Production deployment: `NOT_RUN`
