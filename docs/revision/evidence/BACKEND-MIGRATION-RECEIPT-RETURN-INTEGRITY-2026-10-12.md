# Migration receipt return-integrity evidence — 2026-10-12

## Confirmed finding

The PostgreSQL migration adapter validated the returned receipt shape and
migration ID, but did not compare the returned checksum, schema version or
applied-by value with the receipt it had requested to save.

## Change

The adapter now fails with `MIGRATION_CHECKSUM_MISMATCH` when any of those
returned receipt fields differs. The surrounding transaction remains owned by
the caller, so the mismatch can roll back and a verified retry can be made.

## Evidence

- Focused migration adapter and runner tests: **14/14 PASS**.
- TypeScript typecheck and affected ESLint: **PASS**.
- Full suite: **1389/1389 PASS** across **238** test files.
- Docs checker: **PASS** (`493` markdown files, `936` local links checked).
- The private-migration RLS regression was also strengthened to match the
  explicit `ENABLE ROW LEVEL SECURITY` clause; its result is included in the
  full-suite evidence above.
- Live PostgreSQL migration, production data and independent review:
  `NOT_RUN` / `REVIEW_PENDING`.
