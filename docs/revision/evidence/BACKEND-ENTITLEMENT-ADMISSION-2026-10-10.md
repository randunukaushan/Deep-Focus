# Server entitlement admission candidate — 2026-10-10

මෙය AI සහ optional cloud-resource capability සඳහා server-only admission
boundary එකකි. මෙය payment provider, price catalog, webhook inbox හෝ usage
ledger එකක් නොවේ; ඒවා owner/provider decisions සහ independent review ඉවර වනතුරු
සක්‍රිය කරලා නැත.

## Implemented

- Access decision එක verified actor UUID එකට, capability එකට, server-verified
  active entitlement එකට, policy version එකට සහ expiry එකට බැඳී ඇත.
- Foreign owner, wrong capability, missing/revoked/expired entitlement සහ
  invalid actor/clock fail-closed වේ.
- Result එකේ price, provider secret, client grant හෝ raw entitlement payload
  නොමැත.

## Actual checks

- `node --experimental-strip-types --test tests/domain/entitlement-boundary.test.mjs` —
  **4/4 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite after subsequent slices — **344/344 PASS**.

## Remaining gates

- Server-authoritative allowance reservation/consumption ledger, signed billing
  webhook processing, live provider integration and duplicate/out-of-order event
  tests — **NOT_RUN**.
- Price/catalog decision, payment/ads activation, independent security review
  and deployment — **REVIEW_PENDING**.

## Hardened metadata follow-up

The direct server admission helper now rejects malformed `verifiedBy` and
empty/overlong `policyVersion` metadata even when it is called without the
PostgreSQL row mapper. This keeps the boundary fail-closed independently of
its storage adapter.

- Entitlement, PostgreSQL admission, usage boundary and usage adapter focused
  set: **27/27 PASS**.
- Live billing/provider integration, remote RLS execution and independent
  security review remain **NOT_RUN/REVIEW_PENDING**.

## Migration privilege contract follow-up

The local migration contract now explicitly requires the entitlement table to
grant CRUD access only to `service_role` and rejects grants to `public`, `anon`
or `authenticated`. This is static migration evidence, not live Supabase RLS
execution.

- Full repository suite after this follow-up — **684/684 PASS**.
- TypeScript, affected ESLint and documentation checker — **PASS**.
- Remote RLS execution, independent security review and device verification —
  **NOT_RUN / REVIEW_PENDING**.
