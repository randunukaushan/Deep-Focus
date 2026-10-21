# Backup/restore input-boundary evidence — 2026-10-12

## Confirmed finding

Backup and restore admission assumed non-null coordinator objects and did not
require `targetHasData` to be a boolean. An unknown overwrite-state value could
therefore be treated as false and weaken the empty-target safety gate.

## Change

Manifest decision, export and atomic-restore boundaries now reject malformed
outer inputs, missing source/transaction callbacks and non-boolean overwrite
state before reading or writing records. Ownership, digest, schema, duplicate
and no-overwrite rules remain unchanged.

## Evidence

- Focused test: `tests/domain/backup-restore.test.mjs`
- Result: 18/18 passed, including malformed inputs and overwrite-state checks.
- Typecheck and affected lint: passed after the change.
- Real database backup/restore execution: `NOT_RUN`; independent review:
  `REVIEW_PENDING`.
