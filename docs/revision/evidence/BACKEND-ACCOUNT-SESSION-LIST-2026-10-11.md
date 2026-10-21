# Backend account-session list candidate — 2026-10-11

## Scope

This is a local, review-pending candidate for `EX-26` from the canonical backend
contract. It adds a read-only `GET /v1/account/sessions` route over the private
app-session registry. The response exposes only the session ID, coarse status,
current-session marker, issued/expiry timestamps and revocation timestamp. It
does not expose tokens, IP addresses, device fingerprints or provider data.

The query is bound to the verified actor, rechecks the active app session in the
same transaction, orders by `(issued_at DESC, session_id DESC)`, limits each
page to 100 items and uses an HMAC-signed owner/endpoint/limit/position cursor.
Malformed, foreign or unsafe rows fail closed.

## Changed files

- `supabase/functions/_shared/resource-list-cursor.ts`
- `supabase/functions/_shared/postgres-gateway-read-handlers.ts`
- `supabase/functions/_shared/gateway-router.ts`
- `supabase/functions/_shared/gateway-operation.ts`
- `tests/domain/resource-list-cursor.test.mjs`
- `tests/domain/postgres-gateway-read-handlers.test.mjs`
- `tests/domain/gateway-router.test.mjs`
- `tests/domain/postgres-gateway-handlers.test.mjs`

The EX-27 candidate's owner-session target query uses the same deterministic
`(issued_at DESC, session_id DESC)` order before row locking, so a frozen target
set has stable ordering. This does not implement or assume the unresolved
recent-auth policy.

## Actual checks

- Focused route/cursor/handler/router tests: **29/29 PASS**.
- TypeScript typecheck: **PASS**.
- ESLint for `supabase/functions/_shared`: **PASS**.
- Remote Supabase execution: **NOT_RUN**.
- RLS and two-account database isolation: **REVIEW_PENDING / NOT_RUN**.
- Independent security review: **REVIEW_PENDING**.

This artifact is not evidence of a live database route or production readiness.
