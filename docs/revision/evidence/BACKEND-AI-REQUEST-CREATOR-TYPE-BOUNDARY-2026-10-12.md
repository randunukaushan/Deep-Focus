# AI generation request creator type-boundary evidence — 2026-10-12

## Scope

The local request creator validates both its public runner boundary and its
caller-owned transaction helper. Malformed identities, null input and
non-serializable snapshots fail before request/job SQL or partial admission.
Owner-bound idempotent replay and missing-job failure behavior remain intact.

## Automated evidence

- tests/domain/postgres-ai-generation-request-creator.test.mjs: 8/8 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local candidate evidence only. Live Supabase transaction rollback,
RLS, allowance coupling, deployed Edge execution, production migration,
Android/device verification and independent security review remain
REVIEW_PENDING or NOT_RUN.
