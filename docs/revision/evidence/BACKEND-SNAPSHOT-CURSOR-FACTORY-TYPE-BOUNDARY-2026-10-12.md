# Snapshot page-cursor factory type-boundary evidence — 2026-10-12

## Confirmed finding

The cursor factory applied UUID and date validation directly to runtime input.
Unsafe owner, snapshot, expiry or secret values could throw before the factory's
intended invalid-configuration error was returned.

## Change

The factory now requires string UUID identities, a string parseable expiry and
a string secret of the existing minimum length before any cursor is signed.
Page-boundary checks and signed identity/expiry payloads are unchanged.

## Evidence

- Focused test: `tests/domain/snapshot-page-cursor-factory.test.mjs`
- Result: 5/5 passed, including unsafe runtime values.
- Typecheck and affected lint: passed after the change.
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
