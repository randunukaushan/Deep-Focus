# V2 sync batch receipt plain-JSON boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — this protects replay receipts and the server-side sync idempotency
boundary; independent review remains required.
ACCEPTANCE_CRITERIA_RESULT: exact-once batch replay behavior preserved: PASS;
coercion-prone response bodies rejected before receipt writes: PASS; existing
size and non-finite bounds preserved: PASS.
VERIFICATION_STATUS: PASS for local candidate tests.
REVIEW_STATUS: self-review complete; independent sync/security review
REVIEW_PENDING.
RELEASE_STATUS: NOT_READY — live sync and database execution were not used.

## Change

`sync-v2-batch-receipt.ts` now accepts response bodies only when they are
finite, plain JSON values within the existing 256 KiB bound. The PostgreSQL
adapter therefore rejects `Date`, custom objects, `undefined` and cyclic
values before JSON serialization or SQL.

## Actual checks

- V2 batch receipt and PostgreSQL adapter focused tests: **18/18 pass**.
- Full local test command: **1498 total, 1489 passed, 0 failed, 9 skipped**.
- TypeScript no-emit check: **PASS**.
- Affected ESLint files: **PASS**.
- Documentation checker: **PASS**.

## Limits

No live Supabase/RLS sync, production migration, deployment, Android/device
verification, commit or push was performed. Those remain `NOT_RUN` or
`REVIEW_PENDING` as applicable. No package or tool download was performed.
