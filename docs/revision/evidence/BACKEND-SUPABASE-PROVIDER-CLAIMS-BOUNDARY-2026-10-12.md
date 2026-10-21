# Supabase provider-claims boundary evidence — 2026-10-12

## Scope

The local provider-claims adapter now checks the runtime response and response
data shape before mapping verified claims. Malformed provider results fail as
`PROVIDER_TOKEN_INVALID` and do not become an unhandled server exception.

## Automated evidence

- `tests/domain/supabase-provider-session-verifier.test.mjs`: **4/4 passed**.
- Typecheck: **passed**.
- Affected lint: **passed**.

## Verification boundary

This is local adapter evidence only. Real Supabase Auth, Edge execution, live
session revocation/RLS, Android/device verification and independent security
review remain `REVIEW_PENDING` or `NOT_RUN`.
