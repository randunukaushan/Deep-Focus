# PostgreSQL settings-update input boundary evidence — 2026-10-12

## Confirmed finding

The settings applier assumed a callable client and object-shaped input/result
containers, and did not type-check the actor before processing the request.
Malformed runtime values could therefore escape the intended safe boundary.

## Change

The applier now validates client, request object, actor UUID, body shape and
query result container before SQL or response mapping. Field allowlisting,
settings bounds, owner predicates and optimistic version behavior remain
unchanged.

## Evidence

- Focused test: `tests/domain/postgres-settings-applier.test.mjs`
- Result: 3/3 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1437/1437 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`473` markdown files, `936` local links checked).
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
