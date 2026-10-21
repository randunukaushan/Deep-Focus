# Core sync gateway deployment readiness — 2026-10-12

TASK_STATUS: BLOCKED

RISK: HIGH — authenticated owner data, session admission, rate limiting and
local-to-cloud sync integrity would be changed by a live gateway.

## Intended outcome

Prepare the already authored personal-core sync gateway for a future deployment
to `deep-focus-dev` without changing the remote project.

## Inspected implementation

The local gateway has reviewed composition boundaries for provider claim
verification, app-session rechecks, owner authorization, request bounds and
rate limiting:

- `supabase/functions/_shared/postgres-authenticated-gateway-runtime.ts`
- `supabase/functions/_shared/postgres-gateway-handlers.ts`
- `supabase/functions/_shared/postgres-sync-gateway-handlers.ts`
- `supabase/functions/_shared/postgres-rate-limit-adapter.ts`

The composition requires a real `PostgresTransactionRunner`. The local
Edge-only runner and entrypoint now provide that composition; they remain
unverified in a real Deno/Supabase runtime. Using a public client or client-side
`supabase-js` call instead would not provide the required atomic sync
transaction and would weaken the documented trust boundary.

## Remote observation

On 2026-10-12, `deep-focus-dev` (`wffyrevlhnqiycoybqia`) has zero applied
migrations and zero deployed Edge Functions. Supabase security advisors returned
zero current lints only because no application schema exists there.

## Scope decision

No remote migration, Edge deployment, project setting, secret, user account or
real data was changed. The existing migration artifacts explicitly remain
`REVIEW_PENDING`; the repository execution policy requires independent qualified
review before HIGH-risk integration.

## Implemented local connection boundary

A pinned Edge-only `@db/postgres` 0.19.5 dependency is declared in
`supabase/functions/deep-focus-gateway/deno.json`. The shared
`edge-postgres-transaction-runner.ts` borrows one pool connection, opens a
serializable transaction, rolls back failures and releases the connection in
all terminal paths. It contains no credential value.

The `deep-focus-gateway` entrypoint accepts only `/v1/*` requests, requires all
server configuration values and returns a generic `503` when configuration or
dependencies are unavailable. Its first authenticated bootstrap route creates
the owner profile, personal workspace, sync head and app-session record in one
transaction. A lost bootstrap response can be retried with the same active
provider session without overwriting the first account foundation; revoked or
expired sessions are never revived. Later protected routes recheck that app session. Only `pullSync`
and `pushSync` are otherwise composed; unrelated AI, billing, classroom and
resource routes are not activated.

Focused Node tests for account-bootstrap HTTP admission, app-session issue/retry,
PostgreSQL adapter behavior and provider-verified account bootstrap passed 40/40.
Root TypeScript typecheck and documentation checker passed. Deno/Supabase runtime
tests were not run because a Deno runtime and the required server-side secrets
are not available in this workspace.

2026-10-13 local preflight addition: configuration, Edge transaction-boundary,
public-source and deployable-source secret scans passed 16/16. The deployable
scan rejects static secret-key, database-credential and private-key literals in
`src`, `web/src` and `supabase/functions`; it does not inspect ignored local
environment files or prove hosted secret handling.

## Local readiness update — 2026-10-14

The current local preflight, server environment template and isolated PGlite
suite are recorded in `SUPABASE-LOCAL-DEPLOYMENT-PREFLIGHT-2026-10-13.md`.
The current migration revision has nine verified isolated cases: candidate
chain/replay, rollback/retry/checksum mismatch, existing-schema fail-closed,
cross-owner revocation outbox rejection, legacy nullable receipt preservation,
advisory-lock release, all-private-table RLS/client-SELECT denial,
personal-core cross-owner composite-FK rejection, and a simulated-owner task
RLS isolation case. Gateway configuration, server-template and dependency-pin
regression tests also pass.

This reduces local migration/configuration uncertainty only. It does not close
the required owner A/B API, provider-token, revoked-session, replayed push,
concurrent-writer, lost-response, Data API or Edge-runtime cases. The local
machine still lacks Deno and Docker for Edge Runtime serving; no server-side
configuration has been set. Independent security review remains required
before migration or gateway integration.

## Required before deployment

1. Provide server-side Edge configuration: hosted `SUPABASE_PUBLISHABLE_KEYS`
   with a `default` key, `SUPABASE_DB_URL`, the separate
   `DEEP_FOCUS_SYNC_CURSOR_SECRET`, `DEEP_FOCUS_LIST_CURSOR_SECRET` and
   `DEEP_FOCUS_SNAPSHOT_CURSOR_SECRET` values, plus the three explicit numeric
   policy values. The gateway rejects a malformed
   hosted key map and retains local/legacy fallbacks only for compatibility;
   never place database credentials or cursor secrets in mobile or Git
   configuration.
2. Add isolated integration tests for owner A/B, expired/revoked sessions,
   replayed push, concurrent writes, lost response/retry and rollback.
3. Obtain the required independent security review before applying migrations
   or deploying the gateway. Device and real-provider verification remain
   separate release gates.

## Non-goals

AI, billing, classroom, cloud resources, deployment, secrets and migration
application are not part of this readiness record.
