# Auth session clock-boundary evidence — 2026-10-12

## Change

`authorizeAppSession` now rejects non-string runtime clock input before claim
validation or session-registry access. Issue and revoke transitions also reject
non-string UUID/timestamp values before regular-expression or date parsing.
Malformed input therefore remains on the safe `invalid_claims` or
`invalid_input` path instead of allowing an exception to escape.

## Automated evidence

- `tests/domain/app-session.test.mjs`: 10/10 passed.
- `tests/domain/request-session.test.mjs`: 8/8 passed, including malformed
  header containers that must not reach provider verification.
- The regression covers `null`, numeric and object clock values, symbol-based
  UUID/timestamp confusion, and asserts that invalid authorization input does
  not consult the session registry.
- Live Supabase Auth, token revocation, device verification and independent
  security review remain `REVIEW_PENDING` / `NOT_RUN`.
