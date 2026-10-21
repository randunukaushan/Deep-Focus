# Backend evidence — bounded mutation receipt candidate (2026-10-11)

Added a local, review-gated additive constraint and runtime guard for core
mutation receipts. New response receipts must be JSON objects no larger than 256 KiB. The
constraint is `NOT VALID` so existing rows are not rewritten or rejected during
candidate preparation; existing-data validation remains a separate gate.

## Actual checks

- Migration contract checks: **2/2 PASS**.
- Runtime mutation receipt-boundary checks: **10/10 PASS**.
- PostgreSQL adapter replay-boundary checks: **13/13 PASS**.
- Generic mutation-guard replay checks: **6/6 PASS**.
- Full repository regression: **1214/1214 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS**.
- Existing-data constraint validation and remote PostgreSQL execution:
  **NOT_RUN**.
- Independent security/data review: **REVIEW_PENDING / NOT_RUN**.

No migration was applied to a remote or production database.
