# PostgreSQL profile-update input boundary evidence — 2026-10-12

## Confirmed finding

Profile update admission applied UUID checks directly to runtime actor values,
assumed a callable client and accessed returned `rows` without validating the
result container. Malformed inputs could therefore escape the intended safe
boundary response.

## Change

The profile applier now validates the client, input object, actor UUID, body
shape and query result container before SQL response mapping. Owner predicates,
optimistic version checks and display-name bounds remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-profile-applier.test.mjs`
- Result: 4/4 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1434/1434 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`472` markdown files, `936` local links checked).
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
