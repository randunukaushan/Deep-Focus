# Backend evidence — AI generation replay integrity (2026-10-11)

Hardened the local PostgreSQL generation-request creator so an existing pending
request can be replayed only with the same owner-bound reservation identity,
intent digest and queued-job dispatch identity. A changed reservation or
dispatch key now returns `IDEMPOTENCY_CONFLICT` before public status recovery;
missing job state remains a dependency failure. Identical retries still return
the existing status without inserting a second job.

## Actual checks

- Generation creator, status adapter and migration-contract checks: **15/15 PASS**.
- Full repository regression: **1104/1104 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS** — 342 Markdown files, 80/80 requirements,
  936 local links checked.

## Boundaries

This is a local candidate and was not executed against Supabase. Live
reservation/request transactions, RLS, concurrent worker races, provider
idempotency, independent security review and Android/device verification remain
**REVIEW_PENDING / NOT_RUN**. No production data, deployment, payment, commit
or push was used.
