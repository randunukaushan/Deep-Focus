# Backend evidence — atomic AI generation cancellation adapter (2026-10-11)

Added a local PostgreSQL candidate adapter for the cancellation transition. It
locks the owner-bound request, reads and locks the reserved AI usage receipt,
releases the reservation, updates the pending request, and writes the durable
cancellation response receipt inside one caller-owned transaction. The request
and usage update precede the receipt acknowledgement; any missing or malformed
acknowledgement fails closed.

Matching mutation retries replay the stored response without opening the request
or usage write path. Foreign receipt metadata, missing reservations, failed
request updates and malformed identities are not treated as successful
cancellation.

## Actual checks

- Cancellation transition, migration and adapter checks: **13/13 PASS**.
- Full repository regression: **1098/1098 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.

## Boundaries

This is a local candidate adapter and was not executed against Supabase. The
HTTP cancel route, live concurrent SQL/RLS evidence, completion-vs-cancel race
with real transactions, independent security review and Android/device
verification remain **REVIEW_PENDING / NOT_RUN**. No provider call, production
data, deployment, payment, commit or push was used.
