# Backend evidence — AI generation cancellation receipt migration (2026-10-11)

Added a local `REVIEW_PENDING` SQL candidate for durable cancellation response
replay. The table binds `owner_id` and `request_id` to the generation request,
uses `(owner_id, mutation_id)` as the receipt identity, permits only one receipt
per owner/request, constrains the three reviewed outcomes and stores only an
object response with a successful HTTP status. Direct `public`, `anon` and
`authenticated` table access is revoked; only the server role is granted
select/insert.

## Actual checks

- Cancellation transition plus migration contract checks: **9/9 PASS**.
- Full repository regression: **1094/1094 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.

## Boundaries

The migration was not applied to Supabase. The cancellation HTTP route, live
request-lock/usage-release transaction, concurrent SQL/RLS evidence,
independent security review and Android/device verification remain
**REVIEW_PENDING / NOT_RUN**. No production data, deployment, payment, commit
or push was used.
