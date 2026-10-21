# Backend evidence — core receipt/sync ledger immutability candidate (2026-10-11)

Added a local, review-gated PostgreSQL migration candidate that prevents
updates and deletes to `mutation_receipts` and `sync_changes`. This protects
exact replay evidence and committed sync history; new writes still require the
reviewed owner/head transaction boundary.

## Actual checks

- Migration contract checks: **2/2 PASS**.
- Full repository regression: **1201/1201 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS**.
- Remote PostgreSQL execution: **NOT_RUN**.
- Live RLS/two-account isolation and independent security review:
  **REVIEW_PENDING / NOT_RUN**.

This candidate does not activate or deploy the core schema.
