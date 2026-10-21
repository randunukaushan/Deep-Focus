# Backend evidence — atomic AI completion adapter candidate (2026-10-11)

Added a local PostgreSQL adapter candidate around the completion transition.
It locks the owner-bound request and current fenced job, validates the
proposal identity, writes the private proposal, settles the reserved usage,
updates the terminal request and clears the worker lease through one injected
transaction. A transaction failure therefore leaves the candidate changes to
the database transaction's rollback. Stale fences and foreign proposal
metadata are rejected before settlement.

This is a local candidate only. It is not wired to a provider or HTTP route,
and no Supabase project was contacted.

## Actual checks

- Completion transition plus PostgreSQL adapter checks: **12/12 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository regression: **1121/1121 PASS**.
- Documentation checker: **PASS** — 345 Markdown files, 80/80 requirements,
  936 local links checked.

## Gates

- Live Supabase transaction, RLS and concurrent completion/cancellation:
  **REVIEW_PENDING / NOT_RUN**.
- Provider output validation and external idempotency:
  **REVIEW_PENDING / NOT_RUN**.
- Independent security review and Android/device verification:
  **REVIEW_PENDING / NOT_RUN**.
