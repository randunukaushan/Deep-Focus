# Migration manifest input-object boundary evidence — 2026-10-12

## Confirmed finding

The migration manifest builder assumed its coordinator input was a non-null
object. Null or array input could throw while reading fields instead of
returning the manifest validation failure.

## Change

The builder now rejects null and array inputs before reading migration files,
computing checksums or producing receipts. File naming, ordering, checksum,
transaction-marker and destructive-SQL checks remain unchanged.

## Evidence

- Focused test: `tests/domain/migration-manifest.test.mjs`
- Result: 4/4 passed, including null and array coordinator inputs.
- Typecheck and affected lint: passed after the change.
- Real database migration execution: `NOT_RUN`; independent review:
  `REVIEW_PENDING`.
