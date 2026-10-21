# Backend evidence — AI/V2 replay receipt immutability candidate (2026-10-11)

Added a local, review-gated PostgreSQL migration candidate that prevents
updates and deletes to AI proposal-apply receipts and V2 batch replay receipts.
Exact-once and replay decisions therefore remain append-only; new receipts
still require their existing reviewed owner-bound transactions.

## Actual checks

- Migration contract checks: **2/2 PASS**.
- Full repository regression: **1203/1203 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS**.
- Remote PostgreSQL execution: **NOT_RUN**.
- Live RLS, provider/database retry and independent security review:
  **REVIEW_PENDING / NOT_RUN**.

This candidate does not activate live AI, paid services or V2 sync routes.
