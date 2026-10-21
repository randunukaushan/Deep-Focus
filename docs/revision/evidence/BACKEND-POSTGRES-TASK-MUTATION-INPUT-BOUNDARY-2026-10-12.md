# PostgreSQL task-mutation input boundary evidence — 2026-10-12

## Confirmed finding

Patch, delete and action task appliers accessed mutation/client fields before
proving the client, actor and resource identity types. Malformed runtime values
could therefore reach task or goal storage access through an unclassified path.

## Change

The shared task mutation admission boundary now validates client, request body,
actor UUID and resource UUID before patch/delete/action storage access. Task
ownership, optimistic versions, goal-link checks, tombstones and state
transitions remain unchanged.

## Evidence

- Focused tests:
  `tests/domain/postgres-task-patch-applier.test.mjs`,
  `tests/domain/postgres-task-delete-applier.test.mjs`,
  `tests/domain/postgres-task-action-applier.test.mjs`
- Result: 16/16 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1462/1462 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`475` markdown files, `936` local links checked).
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
