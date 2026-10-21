# PostgreSQL snapshot materializer type-boundary evidence — 2026-10-12

## Confirmed finding

The snapshot materializer passed scheduler and job values directly to UUID,
date and secret-length validation. Unsafe runtime values could throw outside
the intended safe boundary or reach snapshot construction without a stable
validation result.

## Change

The materializer now requires string UUIDs for session, owner, job and snapshot
identities; string timestamps with a valid ordered window; and a string cursor
secret of the required minimum length. Invalid values fail before opening a
transaction or starting snapshot materialization. Existing session binding,
consistent snapshot construction and ownership checks are unchanged.

## Evidence

- Focused test: `tests/domain/postgres-sync-snapshot-materializer.test.mjs`
- Result: 3/3 passed, including unsafe scheduler and job runtime values.
- Typecheck: passed.
- Affected lint: passed.
- Real PostgreSQL/RLS integration: `NOT_RUN` because the local Supabase,
  PostgreSQL and Docker prerequisites are unavailable.
- Independent security review: `REVIEW_PENDING`.
