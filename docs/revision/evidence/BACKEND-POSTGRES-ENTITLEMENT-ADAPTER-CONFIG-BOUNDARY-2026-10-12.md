# PostgreSQL entitlement adapter configuration evidence — 2026-10-12

## Confirmed finding

The entitlement adapter assumed a valid transaction runner and well-formed
query result container. A malformed runner or `{ rows: null }` response could
surface as an unclassified runtime failure before server capability admission.

## Change

Entitlement readers and capability admission now validate runner configuration
and query result shape before mapping server-owned entitlement rows. Owner,
session, server-verification and status/expiry checks remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-entitlement-adapter.test.mjs`
- Result: 11/11 passed, including malformed dependencies.
- Typecheck and affected lint: passed after the change.
- Real PostgreSQL/entitlement integration: `NOT_RUN`; independent review:
  `REVIEW_PENDING`.
