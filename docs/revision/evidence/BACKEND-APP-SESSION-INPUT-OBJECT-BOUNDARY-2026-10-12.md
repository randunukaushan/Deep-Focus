# App-session input-object boundary evidence — 2026-10-12

## Confirmed finding

The app-session helpers validated individual fields but assumed the outer
input was a non-null object. Null or array values could cause property access
to throw instead of returning the session boundary's safe failure result.

## Change

Session authorization, issuance and revocation helpers now reject null and
array inputs before reading fields or invoking storage. Existing provider
claim, active-session, ownership, expiry and revocation rules are unchanged.

## Evidence

- Focused test: `tests/domain/app-session.test.mjs`
- Result: 11/11 passed, including null and array runtime inputs.
- Typecheck and affected lint: passed after the change.
- Real Supabase Auth/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
