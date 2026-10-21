# Backend evidence — fenced AI completion transition (2026-10-11)

Added a review-gated pure completion transition for the local AI generation
candidate. It accepts only a pending request with a live matching worker
lease/fence and an unexpired server deadline. A valid result produces only an
owner-bound Plan My Day proposal reference at contract version 2 and exactly
one `consume` settlement. Safe provider/validation failures produce no result
and exactly one `release` settlement. Terminal requests, stale/expired leases,
identity mismatches, unknown failure codes and malformed proposal IDs fail
closed.

The transition is not wired to a provider or live PostgreSQL publication yet.
The existing SQL constraints remain the source of truth for the eventual
atomic request/proposal/usage update. This slice does not claim live database,
RLS, concurrency, provider or device evidence.

## Actual checks

- Completion transition and worker lease tests: **12/12 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository regression: **1116/1116 PASS**.
- Documentation checker: **PASS** — 344 Markdown files, 80/80 requirements,
  936 local links checked.

## Gates

- Live Supabase transaction, RLS and concurrent completion/cancellation:
  **REVIEW_PENDING / NOT_RUN**.
- Provider output validation and external idempotency: **REVIEW_PENDING /
  NOT_RUN**.
- Independent security review and Android/device verification:
  **REVIEW_PENDING / NOT_RUN**.
