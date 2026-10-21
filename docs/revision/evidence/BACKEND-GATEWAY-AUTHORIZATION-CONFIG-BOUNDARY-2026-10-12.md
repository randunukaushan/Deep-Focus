# Gateway authorization adapter configuration evidence — 2026-10-12

## Confirmed finding

The PostgreSQL owner-lookup adapter assumed its transaction runner was present
and callable. Malformed factory configuration could therefore surface as a
runtime TypeError at an authorization request boundary.

## Change

The factory now validates the runner and its transaction callback before
returning an authorization store. Existing allowlisted tables, parameterized
IDs, owner checks and malformed-row failure behavior remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-gateway-authorization-adapter.test.mjs`
- Result: 7/7 passed, including malformed runner configuration.
- Typecheck and affected lint: passed after the change.
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent review:
  `REVIEW_PENDING`.
