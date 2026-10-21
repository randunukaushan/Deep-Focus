# PostgreSQL snapshot page adapter type-boundary evidence — 2026-10-12

## Confirmed finding

The direct snapshot page adapter passed owner, snapshot, session and clock
values to UUID/date operations without runtime type guards. Unsafe values could
throw before the session check or page query.

## Change

- Owner, snapshot and session IDs require strings before UUID matching.
- The request clock requires a string before date parsing.
- Invalid requests fail before session or page SQL access.
- Existing ready-state, ownership, page metadata, payload-size and bigint
  checks remain unchanged.

Focused evidence: `tests/domain/postgres-snapshot-page-adapter.test.mjs` —
**11/11 passed**. Typecheck and affected lint — **passed**.

This is local adapter evidence only. Real PostgreSQL/RLS execution is
`NOT_RUN`; independent security review remains `REVIEW_PENDING`.
