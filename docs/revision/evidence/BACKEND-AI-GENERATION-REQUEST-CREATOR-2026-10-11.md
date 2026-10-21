# Backend evidence — atomic AI generation request creator (2026-10-11)

Added a local PostgreSQL candidate creator for the approved Plan My Day
generation lifecycle. The caller must provide an already-authorized owner,
reservation identity, server-selected deadline, intent digest and dispatch
identity. The adapter then inserts the pending request and queued job in one
transaction. It does not choose an allowance amount, provider, retry policy or
retention policy.

Same-owner and same-intent retries return the existing public status without
creating another job. A changed intent returns an idempotency conflict. A
pending request without its durable job fails closed, and malformed input is
rejected before a transaction opens.

## Actual checks

- Creator plus status-reader checks: **10/10 PASS**.
- Full repository regression: **1074/1074 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.

## Boundaries

This is a local candidate adapter and was not executed against Supabase. The
HTTP `POST /v1/ai/plan-my-day` composition, real allowance/RLS transaction,
provider worker, crash recovery, independent security review and Android/device
verification remain **REVIEW_PENDING / NOT_RUN**. No production data,
deployment, payment, commit or push was used.
