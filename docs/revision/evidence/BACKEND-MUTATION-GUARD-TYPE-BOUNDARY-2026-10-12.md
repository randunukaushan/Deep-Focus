# Mutation guard type-boundary evidence — 2026-10-12

## Confirmed finding

The ownership/idempotency guard passed actor, mutation, operation and hash
values directly to regular expressions. Stored receipt hashes were handled the
same way. Unsafe runtime values could throw before the owner/replay decision.

## Change

- Actor and mutation IDs require strings before UUID matching.
- Operation and request-hash values require strings before pattern matching.
- Stored receipt validation checks the receipt object and hash type first.
- Invalid values fail before replay decisions or mutation execution.
- Existing owner hiding, exact replay, conflict and response-size assertions
  remain unchanged.

Focused evidence: `tests/domain/mutation-guard.test.mjs` — **7/7 passed**.
Typecheck and affected lint — **passed**.

Live database idempotency, RLS ownership and independent security review remain
`REVIEW_PENDING` or `NOT_RUN`.
