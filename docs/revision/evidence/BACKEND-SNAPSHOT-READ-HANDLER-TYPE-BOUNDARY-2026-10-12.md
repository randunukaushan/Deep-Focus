# PostgreSQL snapshot read handler type-boundary evidence — 2026-10-12

## Confirmed finding

Snapshot metadata/page handlers passed actor, session, snapshot and clock
values directly to UUID matching and date parsing. Unsafe runtime values could
throw before the session guard or storage query.

## Change

- All request identity fields require strings before UUID matching.
- Request clocks require strings before date parsing.
- Invalid values fail before session/storage access.
- Existing owner-bound DTO, privacy-preserving not-found and revoked-session
  assertions remain unchanged.

Focused evidence: `tests/domain/postgres-snapshot-read-handlers.test.mjs` —
**7/7 passed**. Typecheck and affected lint — **passed**.

This is local adapter evidence only. Real PostgreSQL/RLS execution is
`NOT_RUN` because the workspace has no `supabase`, `psql` or `docker` tooling;
independent security review remains `REVIEW_PENDING`.
