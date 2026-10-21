# Backend evidence — bounded sync payload candidate (2026-10-11)

Added a local, review-gated additive constraint and matching runtime guards for
sync upsert payloads. New payloads are limited to 64 KiB at the database,
PostgreSQL pull adapter and generic server pull boundary. The SQL constraint is
`NOT VALID`, so existing rows are not rewritten during candidate preparation.

## Actual checks

- Migration contract checks: **2/2 PASS**.
- Generic sync-pull checks: **7/7 PASS**.
- PostgreSQL sync-pull checks: **10/10 PASS**.
- Server sync-transaction and PostgreSQL writer oversized-payload checks:
  **2/2 PASS**.
- Full repository regression: **1220/1220 PASS**.
- TypeScript, affected ESLint and documentation checker: **PASS**.
- Existing-data validation, remote PostgreSQL and independent sync/security
  review: **NOT_RUN / REVIEW_PENDING**.
