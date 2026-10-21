# AI cancellation receipt plain-JSON boundary — 2026-10-14

## Scope

The PostgreSQL candidate cancellation adapter now rejects a stored cancellation
receipt whose response body is a custom-prototype or otherwise coercion-prone
runtime object. The existing exact response shape and request-status checks are
preserved. This protects replayed receipts before they are exposed to callers.

## Evidence

- Focused cancellation suite: `16/16 passed; 0 failed; 0 skipped`
- Full domain suite: `1514 total; 1505 passed; 0 failed; 9 skipped`
- TypeScript check: `PASS` (`tsc --noEmit --pretty false`)
- Affected-file lint: `PASS` (adapter and regression test)
- Documentation check: `PASS` (`docs/revision/check-docs.mjs`)

## Gates not established here

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`
- Real Auth/session/provider verification: `REVIEW_PENDING`
- Android/device verification: `NOT_RUN`
- Independent security review: `REVIEW_PENDING`
- Production migration/deployment: `NOT_RUN`
