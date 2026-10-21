# Server entitlement admission type-boundary evidence — 2026-10-12

## Scope

The local server capability gate was checked against malformed JavaScript
runtime values at the actor and clock boundaries. The change is limited to
fail-closed input typing; it does not grant capabilities, change entitlement
semantics, or contact a live Supabase project.

## Confirmed finding

`admitServerCapability` previously passed `verifiedActorId` directly to a UUID
regular expression and passed `now` directly to `Date.parse`. A non-string
runtime value such as `Symbol()` could throw before the gate returned a denial.
That was a confirmed local robustness defect at a security-sensitive boundary.

## Change and regression coverage

- Actor IDs are checked as strings before UUID matching.
- Clock values are checked as strings before date parsing.
- Unsafe values return `invalid_actor` or `invalid_clock` and do not reach
  entitlement approval logic.
- Existing active, missing, foreign, expired, malformed-metadata and
  client-capability denial assertions remain unchanged.

Focused evidence: `tests/domain/entitlement-boundary.test.mjs` — **7/7 passed**.
Typecheck and affected lint — **passed**.

Live Supabase entitlement execution, RLS, provider revocation, Android/device
verification and independent security review remain `REVIEW_PENDING` or
`NOT_RUN`; this local test is not production security evidence.
