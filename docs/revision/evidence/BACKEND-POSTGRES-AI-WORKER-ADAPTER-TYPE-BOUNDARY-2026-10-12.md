# PostgreSQL AI generation worker adapter type-boundary evidence — 2026-10-12

## Scope

The local worker adapter now rejects malformed request objects, owner/request
identities and returned job rows before SQL or lease transitions. Existing
owner predicates, current-fence claim, renewal and reconciliation behavior are
preserved.

## Automated evidence

- tests/domain/postgres-ai-generation-worker-adapter.test.mjs: 6/6 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local adapter evidence only. Live Supabase queue locking, RLS,
transaction isolation, deployed Edge execution, production migration,
Android/device verification and independent security review remain
REVIEW_PENDING or NOT_RUN.
