# Backend evidence — owner-bound AI generation status gateway (2026-10-11)

The local gateway candidate now exposes `GET /v1/ai/requests/{requestId}`.
Route admission keeps the request bodyless, the authenticated read boundary
rechecks the app session inside the transaction, and the PostgreSQL reader
binds both owner and request ID. Only the reviewed public lifecycle DTO is
returned; provider, input, worker, lease and credential fields remain outside
the route.

## Actual checks

- Focused gateway/router/read-handler checks: **51/51 PASS**.
- Full repository regression: **1069/1069 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.

## Boundaries

This is a local candidate route and was not executed against Supabase. Live RLS
and account-isolation evidence, provider/worker execution, token expiry and
duplicate apply integration, independent security review and Android/device
verification remain **REVIEW_PENDING / NOT_RUN**. No production data,
deployment, payment, commit or push was used.
