# Backend evidence — AI generation worker PostgreSQL adapter (2026-10-11)

Added a local PostgreSQL adapter for the approved AI generation job phases.
Claim, renew and reconciliation operations lock the owner/request row, use
owner/request/fence/lease predicates for writes, validate returned identity and
lease shape, and propagate an unacknowledged update as a dependency failure.
The due query is bounded and includes queued work plus expired running leases;
reconciliation remains explicit and does not silently create another
reservation.

## Actual checks

- Worker state plus PostgreSQL adapter checks: **11/11 PASS**.
- Full repository regression: **1085/1085 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.

## Boundaries

This is a local candidate adapter and was not executed against Supabase. It does
not call a provider, settle allowance, publish a proposal, or invent terminal
job/retry policy. Live concurrent SQL/RLS evidence, crash reconciliation,
terminal request publication, independent security review and Android/device
verification remain **REVIEW_PENDING / NOT_RUN**. No production data,
deployment, payment, commit or push was used.
