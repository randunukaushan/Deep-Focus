# PostgreSQL consistent snapshot builder type-boundary evidence — 2026-10-12

## Confirmed finding

The builder applied UUID/date and decimal validation directly to runtime values.
Unsafe identity, timestamp or source high-water values could throw instead of
returning the intended safe boundary error before snapshot work proceeded.

## Change

The builder now requires string UUIDs and timestamps at admission, requires a
string decimal high-water value from the source reader, and rejects malformed
values before snapshot staging. Repeatable-read ordering, session recheck and
single-transaction source/staging behavior remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-consistent-snapshot-builder.test.mjs`
- Result: 4/4 passed, including unsafe identity, clock and high-water cases.
- Typecheck and affected lint: passed after the change.
- Real PostgreSQL/RLS integration: `NOT_RUN` because local prerequisites are
  unavailable.
- Independent security review: `REVIEW_PENDING`.
