# PostgreSQL snapshot metadata adapter type-boundary evidence — 2026-10-12

## Confirmed finding

The direct metadata adapter passed owner, snapshot, session and clock values to
UUID/date operations without runtime type guards. Unsafe values could throw
before session verification or metadata SQL access.

## Change

- Owner, snapshot and session IDs require strings before UUID matching.
- The request clock requires a string before date parsing.
- Invalid requests fail before session or metadata SQL access.
- Existing owner-bound ready-state, expiry, digest and bigint assertions remain
  unchanged.

Focused evidence: `tests/domain/postgres-snapshot-metadata-adapter.test.mjs` —
**7/7 passed**. Typecheck and affected lint — **passed**.

This is local adapter evidence only. Real PostgreSQL/RLS execution is
`NOT_RUN`; independent security review remains `REVIEW_PENDING`.
