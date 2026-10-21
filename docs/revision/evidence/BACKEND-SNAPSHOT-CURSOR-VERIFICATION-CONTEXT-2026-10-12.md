# Snapshot cursor verification-context evidence — 2026-10-12

## Confirmed finding

Cursor verification assumed that its expected-context argument was a non-null
object. A null or array value could cause property access to throw before the
cursor validation error was returned.

## Change

Verification now rejects null and array contexts before reading owner,
snapshot or clock fields and before HMAC verification. Existing signature,
scope and expiry checks are unchanged.

## Evidence

- Focused test: `tests/domain/snapshot-page-cursor.test.mjs`
- Result: 6/6 passed, including null and array contexts.
- Typecheck and affected lint: passed after the change.
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
