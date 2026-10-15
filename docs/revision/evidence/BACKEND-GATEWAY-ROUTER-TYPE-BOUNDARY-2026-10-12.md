# Gateway router type-boundary evidence — 2026-10-12

## Confirmed finding

The route matcher applied regular expressions directly to method/path values
and resource IDs. Unsafe runtime values could throw before the normal unknown
route response.

## Change

- Method and path values must be strings before route matching.
- Captured resource IDs must be strings and valid UUIDs before admission.
- Invalid values return the safe `NOT_FOUND` boundary error.
- Existing route allowlist, method matching and body-independent resource
  extraction assertions remain unchanged.

Focused evidence: `tests/domain/gateway-router.test.mjs` — **4/4 passed**.
Typecheck and affected lint — **passed**.

Live gateway execution, database ownership/RLS and independent security review
remain `REVIEW_PENDING` or `NOT_RUN`.
