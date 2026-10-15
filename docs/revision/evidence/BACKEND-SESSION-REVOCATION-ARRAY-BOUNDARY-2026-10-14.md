# Session revocation receipt array boundary — 2026-10-14

## Scope

The PostgreSQL account-session revocation adapter now requires `session_ids`
to be finite plain JSON arrays before writing or replaying a receipt. Sparse
arrays are rejected before SQL, so an omitted array element cannot become a
different stored value or bypass UUID validation.

## Evidence

- Focused account-session suite: `30/30 passed; 0 failed; 0 skipped`
- Full domain suite: `1515 total; 1506 passed; 0 failed; 9 skipped`
- TypeScript check: `PASS` (`tsc --noEmit --pretty false`)
- Affected-file lint: `PASS` (adapter and regression test)
- Documentation check: `PASS` (`docs/revision/check-docs.mjs`)

## Gates not established here

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`
- Real Auth/session/provider verification: `REVIEW_PENDING`
- Android/device verification: `NOT_RUN`
- Independent security review: `REVIEW_PENDING`
- Production migration/deployment: `NOT_RUN`
