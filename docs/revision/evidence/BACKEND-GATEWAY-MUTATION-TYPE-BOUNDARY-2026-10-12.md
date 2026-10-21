# Gateway and mutation type-boundary evidence — 2026-10-12

## Confirmed finding

The core gateway admission and domain mutation transaction paths passed actor,
idempotency, path, body and mutation fields directly to regular expressions,
string operations or transaction entry. Unsafe runtime values could throw
instead of returning the normal safe validation response.

## Change

- Gateway UUID fields require strings before matching.
- Gateway path/body fields require strings before regex, encoding or JSON work.
- Gateway request IDs and idempotency keys reject non-string runtime values.
- Domain mutation actor, operation, mutation, hash, resource and session fields
  are type-checked before opening the transaction.
- Existing authorization, owner lock, replay, rollback and receipt assertions
  remain unchanged.

Focused evidence: gateway admission **6/6 passed**; domain mutation transaction
**11/11 passed**. Typecheck and affected lint — **passed**.

Live gateway/database authorization, RLS isolation and independent security
review remain `REVIEW_PENDING` or `NOT_RUN`.
