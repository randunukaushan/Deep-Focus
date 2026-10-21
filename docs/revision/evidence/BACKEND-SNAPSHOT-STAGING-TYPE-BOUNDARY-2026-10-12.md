# PostgreSQL snapshot staging type-boundary evidence — 2026-10-12

## Confirmed finding

Snapshot staging passed owner, session, timestamp, page and cursor values
directly to UUID/date/regex operations. Unsafe runtime values, including a
non-array page data field, could throw before the write boundary.

## Change

- Owner, session and snapshot IDs require strings before UUID matching.
- Timestamps, digests and cursors require the expected string types.
- Page objects and page data arrays are checked before iteration.
- Invalid values fail before session checks or snapshot writes.
- Existing idempotent retry, conflict, duplicate-page, rollback and ready
  publication assertions remain unchanged.

Focused evidence: `tests/domain/postgres-snapshot-staging-adapter.test.mjs` —
**14/14 passed**. Typecheck and affected lint — **passed**.

This is local adapter evidence only. Real PostgreSQL transaction/RLS execution
is `NOT_RUN`; independent security review remains `REVIEW_PENDING`.
