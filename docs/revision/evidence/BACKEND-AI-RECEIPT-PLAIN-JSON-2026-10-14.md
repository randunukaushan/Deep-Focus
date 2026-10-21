# AI apply receipt plain-JSON boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — this protects the server-authoritative AI apply receipt and its
exact-once persistence boundary; independent review is still required.
ACCEPTANCE_CRITERIA_RESULT: user-confirmed apply/replay behavior preserved:
PASS; coercion-prone response bodies rejected before receipt writes: PASS;
bounded response size enforced: PASS.
VERIFICATION_STATUS: PASS for local candidate tests.
REVIEW_STATUS: self-review complete; independent security and product review
REVIEW_PENDING.
RELEASE_STATUS: NOT_READY — provider and live database execution were not used.

## Change

`ai-apply-receipt-guard.ts` now validates receipt response bodies as finite,
plain JSON objects and enforces the existing 256 KiB response boundary before
returning or replaying a receipt. The PostgreSQL receipt adapter reuses that
same validation before SQL and after mapping returned rows.

Regression tests cover `Date`, custom objects and `undefined` values without
weakening existing exact-once, expiry or proposal-confirmation assertions.

## Actual checks

- AI receipt guard and PostgreSQL receipt/apply adapter focused tests: **26/26
  pass**.
- Full local test command: **1496 total, 1487 passed, 0 failed, 9 skipped**.
- TypeScript no-emit check: **PASS**.
- Affected ESLint files: **PASS**.
- Documentation checker: **PASS**.

## Limits

No OpenAI request, live Supabase/Auth/RLS test, production migration,
deployment, Android/device verification, commit or push was performed. Those
remain `NOT_RUN` or `REVIEW_PENDING` as applicable. No package or tool download
was performed.
