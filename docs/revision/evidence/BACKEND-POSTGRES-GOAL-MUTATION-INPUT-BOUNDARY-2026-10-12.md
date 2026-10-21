# PostgreSQL goal-mutation input boundary evidence — 2026-10-12

## Confirmed finding

Goal create/patch/delete appliers accessed mutation/client fields before proving
client, actor and resource identity types. Malformed runtime values could reach
workspace or goal storage through an unclassified path.

## Change

The shared goal mutation admission boundary now validates client, request body,
actor UUID and resource UUID before storage access. Focus-time `ms` semantics,
target validation, owner/workspace rules, optimistic versions and tombstones
remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-goal-applier.test.mjs`
- Result: 11/11 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1473/1473 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`476` markdown files, `936` local links checked).
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
