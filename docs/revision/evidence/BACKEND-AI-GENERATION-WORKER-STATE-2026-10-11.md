# Backend evidence — AI generation worker lease state (2026-10-11)

Added a local server-only state machine for the AI generation job phases already
allowed by the candidate schema: `queued`, `running` and `reconciling`.
Queued work and expired running leases can be claimed with a new fencing value.
Only the current worker and fence may renew a lease or enter reconciliation.
Reconciliation clears the lease and records only an allowlisted error code; it
does not authorize a blind second provider call or create a terminal public
request state.

The implementation deliberately does not add a terminal job state or choose
max-attempt, lease, retry, deadline or retention policy values. Those decisions
remain isolated for review, as required by the canonical lifecycle contract.

## Actual checks

- Worker state-machine tests: **6/6 PASS**.
- Full repository regression: **1080/1080 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.

## Boundaries

This is a local candidate state machine; no provider call, live Supabase query,
allowance settlement, production migration or deployment was performed. SQL
worker adapter, crash reconciliation, terminal request publication, live RLS,
independent security review and Android/device verification remain
**REVIEW_PENDING / NOT_RUN**.
