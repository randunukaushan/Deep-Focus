# Backend evidence — goal attribution ledger immutability candidate (2026-10-11)

Added a local, review-gated PostgreSQL migration candidate that makes the
goal-contribution ledger append-only at the database boundary. Existing
owner, source, rule-version and duplicate-prevention constraints remain
unchanged; corrections require a separate reviewed attribution contract.

## Actual checks

- Migration contract checks: **2/2 PASS**.
- Full repository regression: **1199/1199 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS**.
- Remote PostgreSQL execution: **NOT_RUN**.
- Live RLS/two-account isolation and independent security review:
  **REVIEW_PENDING / NOT_RUN**.

This is not evidence that the remote ledger is active or production-ready.
