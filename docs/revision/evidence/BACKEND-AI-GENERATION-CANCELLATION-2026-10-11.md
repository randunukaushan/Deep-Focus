# Backend evidence — AI generation cancellation transition (2026-10-11)

Added a server-only cancellation transition for the canonical Plan My Day
request lifecycle. A pending request becomes cancelled exactly once, advances
its version, preserves its identity/deadline, and returns an explicit signal
that the previously reserved action must be released. A cancelled request is
idempotent, while completed and failed requests remain terminal and never
receive an implicit refund.

Malformed stored status, invalid reservation identity and time travel fail
closed. This module does not perform the database write or allowance settlement;
those must remain in one reviewed transaction with the request lock and a
durable cancellation receipt.

## Actual checks

- Cancellation transition tests: **6/6 PASS**.
- Full repository regression: **1091/1091 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.

## Boundaries

The HTTP cancel route, cancellation receipt migration, live usage release,
concurrent SQL serialization, live RLS, independent security review and
Android/device verification remain **REVIEW_PENDING / NOT_RUN**. No provider
call, production data, deployment, payment, commit or push was used.
