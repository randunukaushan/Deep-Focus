# PostgreSQL create-task input boundary evidence — 2026-10-12

## Confirmed finding

The create-task applier accessed operation/body fields and trusted the actor
value before proving the client, input object and actor identity types. Malformed
runtime values could therefore reach an unclassified failure before the
owner-bound workspace read.

## Change

The create-task boundary now validates the client, request object, actor UUID
and body shape before storage. Workspace ownership, goal ownership/linking and
task field bounds remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-task-applier.test.mjs`
- Result: 9/9 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1446/1446 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`474` markdown files, `936` local links checked).
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
