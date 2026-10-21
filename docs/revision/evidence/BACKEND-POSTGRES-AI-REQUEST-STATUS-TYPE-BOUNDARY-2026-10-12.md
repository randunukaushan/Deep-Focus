# PostgreSQL AI request-status type-boundary evidence — 2026-10-12

## Scope

The local status reader now validates direct owner/request inputs and rejects
null or malformed database rows before exposing a public status DTO. It keeps
the selected public fields owner-bound and does not select private prompt or
provider-response columns.

## Automated evidence

- tests/domain/postgres-ai-generation-request-adapter.test.mjs: 6/6 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local adapter evidence only. Live Supabase RLS and query execution,
deployed Edge runtime, production migration, Android/device verification and
independent security review remain REVIEW_PENDING or NOT_RUN.
