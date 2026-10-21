# Backend evidence: versioned migration receipts

Date: 2026-10-11

## Implemented

- Added a local `schema_migration_receipts` migration candidate with ordered
  migration identity, SHA-256 checksum, schema version and approved authority.
- RLS is enabled and client roles are revoked; only `service_role` is granted
  table access.
- Added fail-closed receipt validation for migration tooling boundaries.
- Added a transaction-scoped PostgreSQL adapter that replays an exact receipt
  and rejects an identity/checksum/version/authority mismatch.
- Added a review-gated migration-runner adapter that verifies SQL checksums
  before execution and keeps execution plus receipt persistence in one injected
  transaction.
- Added a non-executing local manifest builder that validates migration names,
  transaction markers and destructive SQL before computing exact checksums.

## Evidence

- Receipt validation, adapter and manifest focused tests: **6/6 PASS**.
- All current repository migrations are included in the deterministic manifest;
  no SQL was executed.
- Migration contract test: **PASS**.
- Latest full repository suite after subsequent approved regression coverage:
  **1187/1187 PASS**.
- Typecheck, ESLint and documentation check: **PASS**.

## Boundaries

No migration runner, remote execution, production deployment or independent
security review was performed. Those remain `REVIEW_PENDING`/`NOT_RUN`.
